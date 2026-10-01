import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { inputCls } from "@/components/Shell";
import { avatarSrc } from "@/lib/dogs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SkilitsaID" },
      { name: "description", content: "Sign in to manage your dog's biometric passport and care tools." },
      { property: "og:title", content: "Sign in — SkilitsaID" },
      { property: "og:description", content: "Manage your dog's biometric passport." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && navigate({ to: "/dashboard" }));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => s && navigate({ to: "/dashboard" }));
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "up") toast.success("Check your email to confirm your account.");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="clay p-8">
        <img src={avatarSrc("frenchie")} alt="" className="mx-auto -mt-20 size-28 rounded-full border-8 border-background bg-muted" />
        <h1 className="mt-2 text-center text-3xl font-bold">{mode === "in" ? "Welcome back" : "Join the pack"}</h1>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className={inputCls} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inputCls} type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={busy} className="clay-btn w-full bg-primary py-3 text-primary-foreground disabled:opacity-60">
            {mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
            if (r.error) toast.error(String(r.error.message ?? r.error));
          }}
          className="clay-btn mt-3 w-full bg-muted py-3"
        >
          Continue with Google
        </button>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-sm font-bold text-primary">
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
