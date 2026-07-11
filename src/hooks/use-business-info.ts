import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { site as defaults } from "@/lib/site-config";

export type SocialLink = { url: string; enabled: boolean };
export type BusinessInfo = Omit<typeof defaults, "social"> & {
  social: {
    facebook: SocialLink;
    instagram: SocialLink;
    tiktok: SocialLink;
    youtube: SocialLink;
  };
};

function normalizeSocial(input: any, fallback: SocialLink): SocialLink {
  if (!input) return { url: fallback.url, enabled: fallback.enabled };
  if (typeof input === "string") return { url: input, enabled: !!input };
  return {
    url: typeof input.url === "string" ? input.url : fallback.url,
    enabled: typeof input.enabled === "boolean" ? input.enabled : !!(input.url ?? fallback.url),
  };
}

/**
 * Returns the site's business info, merging admin-editable overrides
 * (stored under the `business_info` key in site_settings) with the
 * defaults from src/lib/site-config.ts. Safe to call anywhere; falls
 * back to defaults until data is loaded.
 */
export function useBusinessInfo(): BusinessInfo {
  const { data } = useQuery({
    queryKey: ["business-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "business_info")
        .maybeSingle();
      if (error || !data) return null;
      return data.value as any;
    },
    staleTime: 5 * 60 * 1000,
  });

  const src: any = data && typeof data === "object" ? data : {};
  const socialSrc: any = src.social ?? {};
  return {
    ...defaults,
    ...src,
    address: { ...defaults.address, ...(src.address ?? {}) },
    social: {
      facebook: normalizeSocial(socialSrc.facebook, defaults.social.facebook),
      instagram: normalizeSocial(socialSrc.instagram, defaults.social.instagram),
      tiktok: normalizeSocial(socialSrc.tiktok, defaults.social.tiktok),
      youtube: normalizeSocial(socialSrc.youtube, defaults.social.youtube),
    },
    phones: Array.isArray(src.phones) && src.phones.length ? src.phones : defaults.phones,
    hours: Array.isArray(src.hours) && src.hours.length ? src.hours : defaults.hours,
  } as BusinessInfo;
}
