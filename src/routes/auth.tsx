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
      { title: "Σύνδεση — SkilitsaID" },
      { name: "description", content: "Συνδέσου για να διαχειριστείς το βιομετρικό διαβατήριο και τη φροντίδα του σκύλου σου." },
      { property: "og:title", content: "Σύνδεση — SkilitsaID" },
      { property: "og:description", content: "Διαχειρίσου το βιομετρικό διαβατήριο του σκύλου σου." },
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
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/dashboard" }); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (s) navigate({ to: "/dashboard" }); });
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
    if (error) { toast.error(error.message); return; }
    if (mode === "up") toast.success("Έλεγξε το email σου για να επιβεβαιώσεις τον λογαριασμό σου.");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="clay p-8">
        <img src={avatarSrc("frenchie")} alt="" className="mx-auto -mt-20 size-28 rounded-full border-8 border-background bg-muted" />
         <h1 className="mt-2 text-center text-3xl font-bold">{mode === "in" ? "Καλώς ήρθες ξανά" : "Μπες στην παρέα"}</h1>
        <form onSubmit={submit} className="mt-6 space-y-3">
           <input className={inputCls} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
           <input className={inputCls} type="password" required minLength={6} placeholder="Κωδικός πρόσβασης" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={busy} className="clay-btn w-full bg-primary py-3 text-primary-foreground disabled:opacity-60">
             {mode === "in" ? "Σύνδεση" : "Δημιουργία λογαριασμού"}
          </button>
        </form>
        <button
          onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
            if (r.error) toast.error(String(r.error.message ?? r.error));
          }}
          className="clay-btn mt-3 w-full bg-muted py-3"
        >
           Συνέχεια με Google
        </button>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-sm font-bold text-primary">
           {mode === "in" ? "Νέος εδώ; Δημιούργησε λογαριασμό" : "Έχεις ήδη λογαριασμό; Συνδέσου"}
        </button>
      </div>
    </div>
  );
}
