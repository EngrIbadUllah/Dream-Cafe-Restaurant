import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Verify the current user has an admin or manager role. */
export const requireAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r) => r.role);
    const isAdmin = roles.includes("admin") || roles.includes("manager");
    if (!isAdmin) throw new Error("Forbidden");
    return { isAdmin: true, roles };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const s = context.supabase;
    const [orders, reservations, reviews, messages, foods, customers] = await Promise.all([
      s.from("orders").select("id,total,status,created_at"),
      s.from("reservations").select("id,status,reservation_date"),
      s.from("reviews").select("id,rating,is_approved"),
      s.from("contact_messages").select("id,is_read"),
      s.from("foods").select("id,is_available"),
      s.from("profiles").select("id"),
    ]);
    const ordersData = orders.data ?? [];
    const revenue = ordersData
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    return {
      revenue,
      ordersCount: ordersData.length,
      pendingOrders: ordersData.filter((o) => o.status === "pending").length,
      reservationsCount: (reservations.data ?? []).length,
      pendingReservations: (reservations.data ?? []).filter((r) => r.status === "pending").length,
      reviewsCount: (reviews.data ?? []).length,
      pendingReviews: (reviews.data ?? []).filter((r) => !r.is_approved).length,
      unreadMessages: (messages.data ?? []).filter((m) => !m.is_read).length,
      foodsCount: (foods.data ?? []).length,
      customersCount: (customers.data ?? []).length,
    };
  });

const orderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
});

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => orderStatusSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const reservationStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "seated", "completed", "cancelled", "no_show"]),
});

export const updateReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => reservationStatusSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("reservations")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Phase 5: dashboard extras, customers, settings --------

export const getDashboardExtras = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const s = context.supabase;
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const [recent, weekly, topFoods] = await Promise.all([
      s.from("orders")
        .select("id,order_number,customer_name,total,status,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      s.from("orders")
        .select("total,status,created_at")
        .gte("created_at", since.toISOString()),
      s.from("order_items")
        .select("food_name,quantity")
        .limit(500),
    ]);

    // build 7-day series
    const days: { date: string; label: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        revenue: 0,
        orders: 0,
      });
    }
    for (const o of weekly.data ?? []) {
      if (o.status === "cancelled") continue;
      const key = new Date(o.created_at).toISOString().slice(0, 10);
      const day = days.find((d) => d.date === key);
      if (day) {
        day.revenue += Number(o.total ?? 0);
        day.orders += 1;
      }
    }

    // top foods
    const counts = new Map<string, number>();
    for (const it of topFoods.data ?? []) {
      counts.set(it.food_name, (counts.get(it.food_name) ?? 0) + Number(it.quantity ?? 0));
    }
    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    return { recent: recent.data ?? [], weekly: days, topFoods: top };
  });

export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const s = context.supabase;
    const [profiles, roles, orders] = await Promise.all([
      s.from("profiles").select("id,full_name,phone,city,created_at").order("created_at", { ascending: false }),
      s.from("user_roles").select("user_id,role"),
      s.from("orders").select("user_id,total,status"),
    ]);
    const roleMap = new Map<string, string[]>();
    for (const r of roles.data ?? []) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }
    const spendMap = new Map<string, { count: number; total: number }>();
    for (const o of orders.data ?? []) {
      if (!o.user_id || o.status === "cancelled") continue;
      const cur = spendMap.get(o.user_id) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += Number(o.total ?? 0);
      spendMap.set(o.user_id, cur);
    }
    return (profiles.data ?? []).map((p) => ({
      ...p,
      roles: roleMap.get(p.id) ?? ["customer"],
      orders: spendMap.get(p.id)?.count ?? 0,
      spend: spendMap.get(p.id)?.total ?? 0,
    }));
  });

const setRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "manager", "staff", "customer"]),
  action: z.enum(["add", "remove"]),
});

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => setRoleSchema.parse(d))
  .handler(async ({ context, data }) => {
    // caller must be admin (not just manager) to change roles
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Only admins can change roles.");
    if (data.action === "add") {
      const { error } = await context.supabase
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const listSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("site_settings")
      .select("key,value,updated_at")
      .order("key");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(), // raw JSON string
});

export const upsertSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => settingSchema.parse(d))
  .handler(async ({ context, data }) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data.value);
    } catch {
      // store as plain string if not JSON
      parsed = data.value;
    }
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: data.key, value: parsed as never }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ key: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("site_settings").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Analytics --------

const analyticsSchema = z.object({
  from: z.string(), // YYYY-MM-DD
  to: z.string(),   // YYYY-MM-DD (inclusive)
  granularity: z.enum(["hour", "day"]).default("day"),
});

export const getAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => analyticsSchema.parse(d))
  .handler(async ({ context, data }) => {
    const s = context.supabase;
    const fromDate = new Date(`${data.from}T00:00:00`);
    const toDate = new Date(`${data.to}T23:59:59.999`);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || fromDate > toDate) {
      throw new Error("Invalid date range");
    }

    const { data: orders, error } = await s
      .from("orders")
      .select(
        "id,order_number,customer_name,total,subtotal,discount,delivery_fee,status,order_type,payment_method,created_at",
      )
      .gte("created_at", fromDate.toISOString())
      .lte("created_at", toDate.toISOString())
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = orders ?? [];
    const ids = rows.map((r) => r.id);

    const { data: items } = ids.length
      ? await s
          .from("order_items")
          .select("order_id,food_name,quantity,subtotal")
          .in("order_id", ids)
      : { data: [] as { order_id: string; food_name: string; quantity: number; subtotal: number }[] };

    const nonCancelled = rows.filter((o) => o.status !== "cancelled");
    const revenue = nonCancelled.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    const discountTotal = nonCancelled.reduce((sum, o) => sum + Number(o.discount ?? 0), 0);
    const deliveryTotal = nonCancelled.reduce((sum, o) => sum + Number(o.delivery_fee ?? 0), 0);

    // Build time series buckets
    const buckets: { key: string; label: string; revenue: number; orders: number }[] = [];
    const cursor = new Date(fromDate);
    const stepMs = data.granularity === "hour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    while (cursor <= toDate) {
      const key =
        data.granularity === "hour"
          ? cursor.toISOString().slice(0, 13) // YYYY-MM-DDTHH
          : cursor.toISOString().slice(0, 10); // YYYY-MM-DD
      const label =
        data.granularity === "hour"
          ? cursor.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit" })
          : cursor.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      buckets.push({ key, label, revenue: 0, orders: 0 });
      cursor.setTime(cursor.getTime() + stepMs);
    }
    const bucketMap = new Map(buckets.map((b) => [b.key, b]));
    for (const o of nonCancelled) {
      const d = new Date(o.created_at);
      const key =
        data.granularity === "hour" ? d.toISOString().slice(0, 13) : d.toISOString().slice(0, 10);
      const b = bucketMap.get(key);
      if (b) {
        b.revenue += Number(o.total ?? 0);
        b.orders += 1;
      }
    }

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const o of rows) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;

    // Order type & payment method
    const typeCounts: Record<string, number> = {};
    const paymentCounts: Record<string, number> = {};
    for (const o of nonCancelled) {
      typeCounts[o.order_type] = (typeCounts[o.order_type] ?? 0) + 1;
      paymentCounts[o.payment_method] = (paymentCounts[o.payment_method] ?? 0) + 1;
    }

    // Top items
    const itemAgg = new Map<string, { qty: number; revenue: number }>();
    const nonCancelledIds = new Set(nonCancelled.map((o) => o.id));
    for (const it of items ?? []) {
      if (!nonCancelledIds.has(it.order_id)) continue;
      const cur = itemAgg.get(it.food_name) ?? { qty: 0, revenue: 0 };
      cur.qty += Number(it.quantity ?? 0);
      cur.revenue += Number(it.subtotal ?? 0);
      itemAgg.set(it.food_name, cur);
    }
    const topItems = [...itemAgg.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return {
      summary: {
        revenue,
        ordersCount: rows.length,
        completedCount: nonCancelled.length,
        cancelledCount: rows.length - nonCancelled.length,
        avgOrder: nonCancelled.length ? revenue / nonCancelled.length : 0,
        discountTotal,
        deliveryTotal,
      },
      series: buckets,
      statusCounts,
      typeCounts,
      paymentCounts,
      topItems,
      orders: rows.slice(0, 100),
    };
  });
