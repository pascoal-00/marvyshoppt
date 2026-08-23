import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/admin.functions";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/console-9f3d2a")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar | M-Shop Admin" },
      { name: "description", content: "Acesso reservado à administração da M-Shop." },
      { property: "og:title", content: "Entrar | M-Shop Admin" },
      { property: "og:description", content: "Acesso reservado à administração da M-Shop." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || password.length < 8) {
      toast.error("Introduz um email válido e uma palavra-passe com pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.success("Conta criada. Confirma o email para entrares.");
        return;
      }

      try {
        const result = await claimFirstAdmin();
        if (result.granted) toast.success("Conta de administrador criada.");
      } catch {
        /* already has an admin */
      }

      navigate({ to: "/admin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-16 text-background">
      <div className="w-full max-w-sm">
        <Logo className="h-8 w-auto" />
        <h1 className="display mt-8 text-3xl">M-SHOP ADMIN</h1>
        <p className="mt-2 text-sm text-background/60">Área reservada à gestão da loja.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="eyebrow text-background/60">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              required
              className="mt-2 w-full border border-white/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-white"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-background/60">Palavra-passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={72}
              required
              className="mt-2 w-full border border-white/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-white"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent px-6 py-4 text-[11px] font-semibold tracking-[0.2em] text-background disabled:opacity-60"
          >
            {loading ? "A PROCESSAR..." : mode === "signin" ? "ENTRAR" : "CRIAR CONTA"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-xs uppercase tracking-[0.16em] text-background/60 underline underline-offset-4"
        >
          {mode === "signin" ? "Criar a primeira conta de administrador" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}
