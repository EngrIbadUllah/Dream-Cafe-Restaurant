import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PaymentAccount = {
  enabled: boolean;
  account_title: string;
  account_number: string;
};

export type BankAccount = PaymentAccount & { bank_name: string; iban?: string };

export type PaymentAccounts = {
  easypaisa: PaymentAccount;
  jazzcash: PaymentAccount;
  bank: BankAccount;
  instructions: string;
};

const DEFAULTS: PaymentAccounts = {
  easypaisa: { enabled: false, account_title: "", account_number: "" },
  jazzcash: { enabled: false, account_title: "", account_number: "" },
  bank: { enabled: false, account_title: "", account_number: "", bank_name: "", iban: "" },
  instructions:
    "Send the exact total to the account below, then upload the screenshot and paste the transaction ID.",
};

function coerce(src: any): PaymentAccounts {
  const s = src && typeof src === "object" ? src : {};
  return {
    easypaisa: { ...DEFAULTS.easypaisa, ...(s.easypaisa ?? {}) },
    jazzcash: { ...DEFAULTS.jazzcash, ...(s.jazzcash ?? {}) },
    bank: { ...DEFAULTS.bank, ...(s.bank ?? {}) },
    instructions: typeof s.instructions === "string" && s.instructions ? s.instructions : DEFAULTS.instructions,
  };
}

export function usePaymentAccounts(): PaymentAccounts {
  const { data } = useQuery({
    queryKey: ["payment-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "payment_accounts")
        .maybeSingle();
      if (error || !data) return null;
      return data.value as any;
    },
    staleTime: 5 * 60 * 1000,
  });
  return coerce(data);
}
