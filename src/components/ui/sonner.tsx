import { Toaster as Sonner } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      expand
      closeButton
      duration={3800}
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={2.5} />,
        error: <XCircle className="h-5 w-5 text-rose-500" strokeWidth={2.5} />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" strokeWidth={2.5} />,
        info: <Info className="h-5 w-5 text-sky-500" strokeWidth={2.5} />,
        loading: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast: [
            "group toast pointer-events-auto relative flex w-full items-start gap-3",
            "overflow-hidden rounded-2xl border border-border/60 bg-background/90 p-4 pr-10",
            "text-foreground shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl",
            "ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
            // colored left accent bar
            "before:content-[''] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary",
            // per-type accent + subtle tint
            "[&[data-type=success]]:before:bg-emerald-500 [&[data-type=success]]:bg-gradient-to-r [&[data-type=success]]:from-emerald-500/[0.09] [&[data-type=success]]:to-background/90 [&[data-type=success]]:border-emerald-500/25",
            "[&[data-type=error]]:before:bg-rose-500 [&[data-type=error]]:bg-gradient-to-r [&[data-type=error]]:from-rose-500/[0.09] [&[data-type=error]]:to-background/90 [&[data-type=error]]:border-rose-500/25",
            "[&[data-type=warning]]:before:bg-amber-500 [&[data-type=warning]]:bg-gradient-to-r [&[data-type=warning]]:from-amber-500/[0.10] [&[data-type=warning]]:to-background/90 [&[data-type=warning]]:border-amber-500/25",
            "[&[data-type=info]]:before:bg-sky-500 [&[data-type=info]]:bg-gradient-to-r [&[data-type=info]]:from-sky-500/[0.09] [&[data-type=info]]:to-background/90 [&[data-type=info]]:border-sky-500/25",
          ].join(" "),
          title: "text-sm font-semibold leading-snug tracking-tight text-foreground",
          description: "mt-0.5 text-[13px] leading-relaxed text-muted-foreground",
          icon: "mt-0.5 shrink-0",
          actionButton:
            "group-[.toast]:h-8 group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:h-8 group-[.toast]:rounded-lg group-[.toast]:bg-muted group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-muted-foreground",
          closeButton:
            "!left-auto !right-2 !top-2 !translate-x-0 !translate-y-0 !h-6 !w-6 !rounded-md !border-0 !bg-transparent !text-muted-foreground hover:!bg-muted hover:!text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
