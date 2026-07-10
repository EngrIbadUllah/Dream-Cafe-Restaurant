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
