import { createServerFn } from "@tanstack/react-start";



type PlaceOrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: "delivery" | "takeaway" | "dine_in";
  payment_method: "cod" | "bank_transfer";
  delivery_address?: string;
  delivery_city?: string;
  delivery_notes?: string;
  table_number?: string;
  notes?: string;
  coupon_code?: string;
  items: { food_id: string; food_name: string; unit_price: number; quantity: number; notes?: string }[];
};

const DELIVERY_FEE = 150;

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d: PlaceOrderInput) => {
    if (!d.customer_name?.trim()) throw new Error("Name is required");
    if (!/^[\d+\s\-]{7,}$/.test(d.customer_phone || "")) throw new Error("Valid phone required");
    if (!d.items?.length) throw new Error("Cart is empty");
    if (d.order_type === "delivery" && !d.delivery_address?.trim())
      throw new Error("Delivery address required");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const subtotal = data.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    let discount = 0;
    let couponCode: string | null = null;

    if (data.coupon_code?.trim()) {
      const code = data.coupon_code.trim().toUpperCase();
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      if (coupon) {
        const now = new Date();
        const okStart = !coupon.starts_at || new Date(coupon.starts_at) <= now;
        const okEnd = !coupon.expires_at || new Date(coupon.expires_at) >= now;
        const okMin = !coupon.min_order_amount || subtotal >= Number(coupon.min_order_amount);
        const okUses = !coupon.usage_limit || coupon.used_count < coupon.usage_limit;
        if (okStart && okEnd && okMin && okUses) {
          if (coupon.discount_type === "percentage") {
            discount = (subtotal * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
          } else {
            discount = Number(coupon.discount_value);
          }
          couponCode = coupon.code;
        }
      }
    }

    const delivery_fee = data.order_type === "delivery" ? DELIVERY_FEE : 0;
    const tax = 0;
    const total = Math.max(0, subtotal - discount + delivery_fee + tax);

    const { data: numData, error: numErr } = await supabaseAdmin.rpc("generate_order_number" as never);
    if (numErr) throw numErr;
    const order_number = numData as unknown as string;

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number,
        customer_name: data.customer_name.trim(),
        customer_phone: data.customer_phone.trim(),
        customer_email: data.customer_email?.trim() || null,
        order_type: data.order_type,
        payment_method: data.payment_method,
        payment_status: "unpaid",
        status: "pending",
        delivery_address: data.delivery_address?.trim() || null,
        delivery_city: data.delivery_city?.trim() || "Shakargarh",
        delivery_notes: data.delivery_notes?.trim() || null,
        table_number: data.table_number?.trim() || null,
        notes: data.notes?.trim() || null,
        coupon_code: couponCode,
        subtotal,
        discount,
        delivery_fee,
        tax,
        total,
      })
      .select("id, order_number")
      .single();
    if (orderErr) throw orderErr;

    const items = data.items.map((i) => ({
      order_id: order.id,
      food_id: i.food_id,
      food_name: i.food_name,
      unit_price: i.unit_price,
      quantity: i.quantity,
      subtotal: i.unit_price * i.quantity,
      notes: i.notes || null,
    }));
    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(items);
    if (itemsErr) throw itemsErr;

    if (couponCode) {
      await supabaseAdmin.rpc("increment_coupon_usage" as never, { p_code: couponCode } as never).then(
        () => undefined,
        async () => {
          // best-effort fallback if RPC doesn't exist
          const { data: c } = await supabaseAdmin
            .from("coupons").select("used_count").eq("code", couponCode).maybeSingle();
          if (c) await supabaseAdmin.from("coupons").update({ used_count: (c.used_count ?? 0) + 1 }).eq("code", couponCode);
        },
      );
    }

    return { order_number: order.order_number, total, discount, delivery_fee };
  });

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { order_number: string; phone: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, status, payment_status, payment_method, order_type, customer_name, customer_phone, delivery_address, delivery_city, subtotal, discount, delivery_fee, tax, total, notes, created_at",
      )
      .eq("order_number", data.order_number.trim())
      .maybeSingle();
    if (error) throw error;
    if (!order) return { order: null, items: [] as { food_name: string; quantity: number; unit_price: number; subtotal: number }[] };

    const normPhone = (s: string) => s.replace(/[^\d]/g, "").slice(-10);
    if (normPhone(order.customer_phone) !== normPhone(data.phone))
      return { order: null, items: [] };

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("food_name, quantity, unit_price, subtotal")
      .eq("order_id", order.id);

    return { order, items: items ?? [] };
  });
