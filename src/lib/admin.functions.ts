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
