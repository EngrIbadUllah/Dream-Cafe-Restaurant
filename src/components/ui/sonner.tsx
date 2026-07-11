import { Toaster as Sonner } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      expand
      richColors={false}
      closeButton
      duration={3800}
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <XCircle className="h-5 w-5 text-rose-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        info: <Info className="h-5 w-5 text-sky-500" />,
        loading: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-border/60 bg-background/85 p-4 pr-10 text-foreground shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-black/[0.03] dark:ring-white/[0.06] before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:bg-primary",
          title: "text-sm font-semibold leading-snug tracking-tight",
          description: "mt-0.5 text-[13px] leading-relaxed text-muted-foreground",
          icon: "mt-0.5 shrink-0",
          actionButton:
            "group-[.toast]:h-8 group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-primary-foreground hover:group-[.toast]:opacity-90",
          cancelButton:
            "group-[.toast]:h-8 group-[.toast]:rounded-lg group-[.toast]:bg-muted group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-muted-foreground",
          closeButton:
            "!left-auto !right-2 !top-2 !translate-x-0 !translate-y-0 !h-6 !w-6 !rounded-md !border-0 !bg-transparent !text-muted-foreground hover:!bg-muted hover:!text-foreground",
          success:
            "before:!bg-emerald-500 border-emerald-500/20 bg-gradient-to-br from-emerald-50/90 to-background/85 dark:from-emerald-950/40 dark:to-background/85",
          error:
            "before:!bg-rose-500 border-rose-500/20 bg-gradient-to-br from-rose-50/90 to-background/85 dark:from-rose-950/40 dark:to-background/85",
          warning:
            "before:!bg-amber-500 border-amber-500/20 bg-gradient-to-br from-amber-50/90 to-background/85 dark:from-amber-950/40 dark:to-background/85",
          info:
            "before:!bg-sky-500 border-sky-500/20 bg-gradient-to-br from-sky-50/90 to-background/85 dark:from-sky-950/40 dark:to-background/85",
          loading: "before:!bg-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
