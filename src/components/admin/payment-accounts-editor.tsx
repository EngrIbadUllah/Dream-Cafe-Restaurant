import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Wallet } from "lucide-react";
import type { PaymentAccounts } from "@/hooks/use-payment-accounts";

const BLANK: PaymentAccounts = {
  easypaisa: { enabled: false, account_title: "", account_number: "" },
  jazzcash: { enabled: false, account_title: "", account_number: "" },
  bank: { enabled: false, account_title: "", account_number: "", bank_name: "", iban: "" },
  instructions:
    "Send the exact total to the account below, then upload the screenshot and paste the transaction ID.",
};

export function PaymentAccountsEditor({
  current,
  upsert,
}: {
  current: unknown;
  upsert: (value: string) => Promise<unknown>;
}) {
  const seed: PaymentAccounts = {
    ...BLANK,
    ...(current && typeof current === "object" ? (current as any) : {}),
    easypaisa: { ...BLANK.easypaisa, ...((current as any)?.easypaisa ?? {}) },
    jazzcash: { ...BLANK.jazzcash, ...((current as any)?.jazzcash ?? {}) },
    bank: { ...BLANK.bank, ...((current as any)?.bank ?? {}) },
  };
  const [form, setForm] = useState<PaymentAccounts>(seed);

  useEffect(() => {
    setForm(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(current)]);

  const save = useMutation({
    mutationFn: async () => upsert(JSON.stringify(form)),
    onSuccess: () => toast.success("Payment accounts updated"),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-2xl border border-gold/20 bg-gold/[0.04] p-6 space-y-5">
      <header className="flex items-center gap-2">
        <Wallet size={18} className="text-gold" />
        <h2 className="font-serif text-xl text-cream">Payment accounts</h2>
      </header>
      <p className="text-xs text-cream/60 -mt-2">
        Toggle which methods appear at checkout and set the account details customers should send funds to.
      </p>

      {/* EasyPaisa */}
      <Section
        title="EasyPaisa"
        enabled={form.easypaisa.enabled}
        onToggle={(v) => setForm((f) => ({ ...f, easypaisa: { ...f.easypaisa, enabled: v } }))}
      >
        <Field label="Account title">
          <input
            className="input-base"
            value={form.easypaisa.account_title}
            onChange={(e) => setForm((f) => ({ ...f, easypaisa: { ...f.easypaisa, account_title: e.target.value } }))}
          />
        </Field>
        <Field label="Account / mobile number">
          <input
            className="input-base"
            placeholder="03XX XXXXXXX"
            value={form.easypaisa.account_number}
            onChange={(e) => setForm((f) => ({ ...f, easypaisa: { ...f.easypaisa, account_number: e.target.value } }))}
          />
        </Field>
      </Section>

      {/* JazzCash */}
      <Section
        title="JazzCash"
        enabled={form.jazzcash.enabled}
        onToggle={(v) => setForm((f) => ({ ...f, jazzcash: { ...f.jazzcash, enabled: v } }))}
      >
        <Field label="Account title">
          <input
            className="input-base"
            value={form.jazzcash.account_title}
            onChange={(e) => setForm((f) => ({ ...f, jazzcash: { ...f.jazzcash, account_title: e.target.value } }))}
          />
        </Field>
        <Field label="Account / mobile number">
          <input
            className="input-base"
            placeholder="03XX XXXXXXX"
            value={form.jazzcash.account_number}
            onChange={(e) => setForm((f) => ({ ...f, jazzcash: { ...f.jazzcash, account_number: e.target.value } }))}
          />
        </Field>
      </Section>

      {/* Bank */}
      <Section
        title="Bank Transfer"
        enabled={form.bank.enabled}
        onToggle={(v) => setForm((f) => ({ ...f, bank: { ...f.bank, enabled: v } }))}
      >
        <Field label="Bank name">
          <input
            className="input-base"
            value={form.bank.bank_name}
            onChange={(e) => setForm((f) => ({ ...f, bank: { ...f.bank, bank_name: e.target.value } }))}
          />
        </Field>
        <Field label="Account title">
          <input
            className="input-base"
            value={form.bank.account_title}
            onChange={(e) => setForm((f) => ({ ...f, bank: { ...f.bank, account_title: e.target.value } }))}
          />
        </Field>
        <Field label="Account number">
          <input
            className="input-base"
            value={form.bank.account_number}
            onChange={(e) => setForm((f) => ({ ...f, bank: { ...f.bank, account_number: e.target.value } }))}
          />
        </Field>
        <Field label="IBAN (optional)">
          <input
            className="input-base"
            value={form.bank.iban ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, bank: { ...f.bank, iban: e.target.value } }))}
          />
        </Field>
      </Section>

      <Field label="Instructions shown to customer">
        <textarea
          rows={2}
          className="input-base"
          value={form.instructions}
          onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
        />
      </Field>

      <div className="flex justify-end">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-lg gradient-gold px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          <Save size={14} /> {save.isPending ? "Saving…" : "Save payment accounts"}
        </button>
      </div>
    </section>
  );
}

function Section({
  title,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="font-serif text-lg text-cream">{title}</span>
        <span className="flex items-center gap-2 text-xs text-cream/70">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="h-4 w-4 accent-[color:var(--gold,#c9a35a)]"
          />
          Show at checkout
        </span>
      </label>
      {enabled && <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-cream/60 text-xs">{label}</span>
      {children}
    </label>
  );
}
