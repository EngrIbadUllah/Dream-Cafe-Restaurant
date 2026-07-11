import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Publishable VAPID key — safe to expose. Read from server env.
 */
export const getVapidPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  return { publicKey: process.env.VAPID_PUBLIC_KEY ?? "" };
});

type SaveInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
};

export const savePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: SaveInput) => {
    if (!d?.endpoint || !d?.p256dh || !d?.auth) throw new Error("Invalid subscription");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: context.userId,
          endpoint: data.endpoint,
          p256dh: data.p256dh,
          auth: data.auth,
          user_agent: data.user_agent ?? null,
        },
        { onConflict: "endpoint" },
      );
    if (error) throw error;
    return { ok: true };
  });

export const deletePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { endpoint: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", context.userId)
      .eq("endpoint", data.endpoint);
    if (error) throw error;
    return { ok: true };
  });

/**
 * Server-only helper — sends a notification to every admin/manager subscriber.
 * Silently ignores individual failures and cleans up expired endpoints.
 */
export async function sendPushToAdmins(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { buildPushPayload } = await import("@block65/webcrypto-web-push");

    // Get all users with admin or manager role
    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "manager"]);
    const adminIds = Array.from(new Set((roleRows ?? []).map((r) => r.user_id)));
    if (adminIds.length === 0) return;

    const { data: subs } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .in("user_id", adminIds);
    if (!subs || subs.length === 0) return;

    const vapid = {
      subject: process.env.VAPID_SUBJECT ?? "mailto:admin@example.com",
      publicKey: process.env.VAPID_PUBLIC_KEY!,
      privateKey: process.env.VAPID_PRIVATE_KEY!,
    };

    const message = {
      data: JSON.stringify(payload),
      options: { ttl: 60 },
    };

    await Promise.allSettled(
      subs.map(async (sub) => {
        const subscription = {
          endpoint: sub.endpoint,
          expirationTime: null,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        };
        try {
          const req = await buildPushPayload(message, subscription, vapid);
          const res = await fetch(sub.endpoint, req as unknown as RequestInit);
          // 404 / 410 → subscription no longer valid → clean up
          if (res.status === 404 || res.status === 410) {
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
        } catch (err) {
          console.error("[push] send failed", err);
        }
      }),
    );
  } catch (err) {
    console.error("[push] sendPushToAdmins error", err);
  }
}
