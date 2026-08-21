import { useEffect, useState } from "react";
import { X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "mshop-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    window.localStorage.setItem(DISMISS_KEY, "1");
  };

  if (!visible || !deferred) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 border border-border bg-card px-4 py-3 shadow-lg sm:left-auto sm:right-4 sm:w-80">
      <div className="flex-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-foreground">INSTALAR M-SHOP</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Acesso rápido à loja, direto do teu ecrã inicial.
        </p>
      </div>
      <button
        type="button"
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          dismiss();
        }}
        className="bg-primary px-3 py-2 text-[11px] font-semibold tracking-[0.14em] text-primary-foreground"
      >
        INSTALAR
      </button>
      <button type="button" onClick={dismiss} aria-label="Dispensar" className="text-muted-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
