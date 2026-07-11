import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCafeLogo() {
  const { data } = useQuery({
    queryKey: ["cafe-logo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "cafe_logo")
        .maybeSingle();
      if (error) return null;
      const v = data?.value as unknown;
      if (typeof v === "string" && v.length > 0) return v;
      return null;
    },
    staleTime: 5 * 60 * 1000,
  });
  return data ?? null;
}
