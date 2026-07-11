import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Building2, Plus, Trash2 } from "lucide-react";
import { site as defaults } from "@/lib/site-config";
import type { BusinessInfo } from "@/hooks/use-business-info";

type Phone = { label: string; number: string; tel: string };
type Hour = { day: string; time: string };

export function BusinessInfoEditor({
  current,
  upsert,
}: {
  current: unknown;
  upsert: (value: string) => Promise<unknown>;
}) {
  const initial: BusinessInfo = {
    ...defaults,
    ...(current && typeof current === "object" ? (current as Partial<BusinessInfo>) : {}),
    address: { ...defaults.address, ...((current as any)?.address ?? {}) },
    social: { ...defaults.social, ...((current as any)?.social ?? {}) },
    phones: Array.isArray((current as any)?.phones) && (current as any).phones.length
      ? (current as any).phones
      : [...defaults.phones],
    hours: Array.isArray((current as any)?.hours) && (current as any).hours.length
      ? (current as any).hours
      : [...defaults.hours],
  };

  const [form, setForm] = useState<BusinessInfo>(initial);

  useEffect(() => {
    setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(current)]);

  const save = useMutation({
    mutationFn: async () => upsert(JSON.stringify(form)),
    onSuccess: () => toast.success("Business info updated"),
    onError: (e: Error) => toast.error(e.message),
  });

  function setField<K extends keyof BusinessInfo>(k: K, v: BusinessInfo[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function setAddress<K extends keyof BusinessInfo["address"]>(k: K, v: string) {
    setForm((f) => ({ ...f, address: { ...f.address, [k]: v } }));
  }
  function setSocial<K extends keyof BusinessInfo["social"]>(k: K, v: string) {
    setForm((f) => ({ ...f, social: { ...f.social, [k]: v } }));
  }
  function updatePhone(idx: number, patch: Partial<Phone>) {
    setForm((f) => ({
      ...f,
      phones: f.phones.map((p, i) => (i === idx ? { ...p, ...patch } : p)) as any,
    }));
  }
  function addPhone() {
    setForm((f) => ({ ...f, phones: [...f.phones, { label: "Orders", number: "", tel: "+92" }] as any }));
  }
  function removePhone(idx: number) {
    setForm((f) => ({ ...f, phones: f.phones.filter((_, i) => i !== idx) as any }));
  }
  function updateHour(idx: number, patch: Partial<Hour>) {
    setForm((f) => ({
      ...f,
      hours: f.hours.map((h, i) => (i === idx ? { ...h, ...patch } : h)) as any,
    }));
  }
  function addHour() {
    setForm((f) => ({ ...f, hours: [...f.hours, { day: "", time: "" }] as any }));
  }
  function removeHour(idx: number) {
    setForm((f) => ({ ...f, hours: f.hours.filter((_, i) => i !== idx) as any }));
  }

  return (
    <section className="rounded-2xl border border-gold/20 bg-gold/[0.04] p-6">
      <h2 className="font-serif text-xl text-cream mb-1 flex items-center gap-2">
        <Building2 size={18} className="text-gold" /> Business info
      </h2>
      <p className="text-cream/60 text-sm mb-5">
        Restaurant name, phones, email, address and hours. Updates instantly across the whole website.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Restaurant name">
          <input className="input-base" value={form.name}
            onChange={(e) => setField("name", e.target.value as any)} />
        </Field>
        <Field label="Short name">
          <input className="input-base" value={form.shortName}
            onChange={(e) => setField("shortName", e.target.value as any)} />
        </Field>
        <Field label="Tagline" full>
          <input className="input-base" value={form.tagline}
            onChange={(e) => setField("tagline", e.target.value as any)} />
        </Field>
        <Field label="Description" full>
          <textarea className="input-base min-h-[80px]" value={form.description}
            onChange={(e) => setField("description", e.target.value as any)} />
        </Field>

        <Field label="Email">
          <input className="input-base" type="email" value={form.email}
            onChange={(e) => setField("email", e.target.value as any)} />
        </Field>
        <Field label="WhatsApp (with country code)">
          <input className="input-base" placeholder="+923001212790" value={form.whatsapp}
            onChange={(e) => setField("whatsapp", e.target.value as any)} />
        </Field>
        <Field label="WhatsApp auto message (pre-filled when a customer taps the WhatsApp button)" full>
          <textarea className="input-base min-h-[70px]" placeholder="Hi Dream Cafe, I'd like to place an order."
            value={form.whatsappMessage ?? ""}
            onChange={(e) => setField("whatsappMessage", e.target.value as any)} />
        </Field>

        <Field label="Price range label" full>
          <input className="input-base" value={form.priceRangeLabel}
            onChange={(e) => setField("priceRangeLabel", e.target.value as any)} />
        </Field>
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold text-cream/80">Address</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Street / area" full>
          <input className="input-base" value={form.address.line1}
            onChange={(e) => setAddress("line1", e.target.value)} />
        </Field>
        <Field label="City">
          <input className="input-base" value={form.address.city}
            onChange={(e) => setAddress("city", e.target.value)} />
        </Field>
        <Field label="Region">
          <input className="input-base" value={form.address.region}
            onChange={(e) => setAddress("region", e.target.value)} />
        </Field>
        <Field label="Postal code">
          <input className="input-base" value={form.address.postalCode}
            onChange={(e) => setAddress("postalCode", e.target.value)} />
        </Field>
        <Field label="Country">
          <input className="input-base" value={form.address.country}
            onChange={(e) => setAddress("country", e.target.value)} />
        </Field>
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold text-cream/80 flex items-center justify-between">
        <span>Phone numbers</span>
        <button type="button" onClick={addPhone}
          className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-1 text-xs text-gold hover:bg-gold/20">
          <Plus size={12} /> Add
        </button>
      </h3>
      <div className="space-y-2">
        {form.phones.map((p, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <input className="input-base" placeholder="Label (e.g. Orders)" value={p.label}
              onChange={(e) => updatePhone(i, { label: e.target.value })} />
            <input className="input-base" placeholder="Display (e.g. 0300 1212283)" value={p.number}
              onChange={(e) => updatePhone(i, { number: e.target.value })} />
            <input className="input-base" placeholder="Tel (e.g. +923001212283)" value={p.tel}
              onChange={(e) => updatePhone(i, { tel: e.target.value })} />
            <button type="button" onClick={() => removePhone(i)}
              className="rounded-md border border-rose-400/30 bg-rose-500/10 px-2 text-rose-300 hover:bg-rose-500/20">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold text-cream/80 flex items-center justify-between">
        <span>Opening hours</span>
        <button type="button" onClick={addHour}
          className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-1 text-xs text-gold hover:bg-gold/20">
          <Plus size={12} /> Add
        </button>
      </h3>
      <div className="space-y-2">
        {form.hours.map((h, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input className="input-base" placeholder="Day (e.g. Monday – Friday)" value={h.day}
              onChange={(e) => updateHour(i, { day: e.target.value })} />
            <input className="input-base" placeholder="Time (e.g. 11:00 AM – 12:00 AM)" value={h.time}
              onChange={(e) => updateHour(i, { time: e.target.value })} />
            <button type="button" onClick={() => removeHour(i)}
              className="rounded-md border border-rose-400/30 bg-rose-500/10 px-2 text-rose-300 hover:bg-rose-500/20">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold text-cream/80">Social links</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Facebook URL">
          <input className="input-base" value={form.social.facebook}
            onChange={(e) => setSocial("facebook", e.target.value)} />
        </Field>
        <Field label="Instagram URL">
          <input className="input-base" value={form.social.instagram}
            onChange={(e) => setSocial("instagram", e.target.value)} />
        </Field>
        <Field label="TikTok URL" full>
          <input className="input-base" value={form.social.tiktok}
            onChange={(e) => setSocial("tiktok", e.target.value)} />
        </Field>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
          className="inline-flex items-center gap-2 rounded-lg gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Save size={14} /> {save.isPending ? "Saving…" : "Save business info"}
        </button>
      </div>
    </section>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={full ? "sm:col-span-2 block" : "block"}>
      <span className="mb-1 block text-xs font-medium text-cream/70">{label}</span>
      {children}
    </label>
  );
}
