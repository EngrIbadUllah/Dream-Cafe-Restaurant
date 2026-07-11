import { Toaster as Sonner } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({
  position = "top-center",
  richColors: _richColors,
  toastOptions: _toastOptions,
  ...props
}: ToasterProps) => {
  return (
    <Sonner
      position={position}
      expand
      closeButton
      duration={3800}
      gap={10}
      offset={18}
      visibleToasts={4}
      className="toaster group dream-toaster"
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-[color:var(--toast-success)]" strokeWidth={2.5} />,
        error: <XCircle className="h-5 w-5 text-[color:var(--toast-error)]" strokeWidth={2.5} />,
        warning: <AlertTriangle className="h-5 w-5 text-[color:var(--toast-warning)]" strokeWidth={2.5} />,
        info: <Info className="h-5 w-5 text-[color:var(--toast-info)]" strokeWidth={2.5} />,
        loading: <Loader2 className="h-5 w-5 animate-spin text-gold" strokeWidth={2.5} />,
      }}
      toastOptions={{
        classNames: {
          toast: [
            "group toast dream-toast pointer-events-auto relative flex w-[calc(100vw-1.5rem)] max-w-[24rem] items-start gap-3",
            "overflow-hidden rounded-xl border border-border bg-card px-4 py-3.5 pr-10 text-foreground shadow-2xl backdrop-blur-xl",
            "before:content-[''] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[color:var(--toast-accent)]",
            "after:content-[''] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--toast-accent)_16%,transparent),transparent_58%)]",
            "[&[data-type=success]]:[--toast-accent:var(--toast-success)]",
            "[&[data-type=error]]:[--toast-accent:var(--toast-error)]",
            "[&[data-type=warning]]:[--toast-accent:var(--toast-warning)]",
            "[&[data-type=info]]:[--toast-accent:var(--toast-info)]",
            "[&[data-type=loading]]:[--toast-accent:var(--color-gold)]",
          ].join(" "),
          title: "relative z-10 text-sm font-bold leading-snug text-foreground",
          description: "relative z-10 mt-1 text-[13px] leading-relaxed text-muted-foreground",
          icon: "relative z-10 mt-0.5 shrink-0 rounded-full bg-background/70 p-1 shadow-sm ring-1 ring-border",
          actionButton:
            "group-[.toast]:relative group-[.toast]:z-10 group-[.toast]:h-8 group-[.toast]:rounded-lg group-[.toast]:gradient-gold group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-bold group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:relative group-[.toast]:z-10 group-[.toast]:h-8 group-[.toast]:rounded-lg group-[.toast]:bg-muted group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-semibold group-[.toast]:text-muted-foreground",
          closeButton:
            "!left-auto !right-2 !top-2 !translate-x-0 !translate-y-0 !h-6 !w-6 !rounded-md !border-0 !bg-transparent !text-muted-foreground hover:!bg-muted hover:!text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
