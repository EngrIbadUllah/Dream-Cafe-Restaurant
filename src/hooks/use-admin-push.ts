import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  deletePushSubscription,
  getVapidPublicKey,
  savePushSubscription,
} from "@/lib/push.functions";

type Status = "unsupported" | "denied" | "granted" | "default" | "loading";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration() {
  const reg = await navigator.serviceWorker.register("/push-sw.js");
  await navigator.serviceWorker.ready;
  return reg;
}

export function useAdminPush() {
  const [status, setStatus] = useState<Status>("loading");
  const [subscribed, setSubscribed] = useState(false);
  const save = useServerFn(savePushSubscription);
  const remove = useServerFn(deletePushSubscription);
  const fetchVapid = useServerFn(getVapidPublicKey);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission as Status);
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/push-sw.js");
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const subscribe = useCallback(async () => {
    try {
      if (!("Notification" in window)) throw new Error("Notifications not supported");
      const perm = await Notification.requestPermission();
      setStatus(perm as Status);
      if (perm !== "granted") {
        toast.error("Notifications permission denied");
        return false;
      }
      const { publicKey } = await fetchVapid();
      if (!publicKey) throw new Error("Server not configured for push");
      const reg = await getRegistration();
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }
      const json = sub.toJSON();
      await save({
        data: {
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
          user_agent: navigator.userAgent,
        },
      });
      setSubscribed(true);
      toast.success("Push notifications enabled");
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to enable push";
      toast.error(msg);
      return false;
    }
  }, [fetchVapid, save]);

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await remove({ data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.success("Push notifications disabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to disable push");
    }
  }, [remove]);

  return { status, subscribed, subscribe, unsubscribe };
}
