import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { site as defaults } from "@/lib/site-config";

export type BusinessInfo = typeof defaults;

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
      return data.value as Partial<BusinessInfo> | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!data || typeof data !== "object") return defaults;
  // shallow merge, but deep-merge address/social so partial edits don't wipe fields
  return {
    ...defaults,
    ...data,
    address: { ...defaults.address, ...(data.address ?? {}) },
    social: { ...defaults.social, ...(data.social ?? {}) },
    phones: Array.isArray(data.phones) && data.phones.length ? data.phones : defaults.phones,
    hours: Array.isArray(data.hours) && data.hours.length ? data.hours : defaults.hours,
  } as BusinessInfo;
}
