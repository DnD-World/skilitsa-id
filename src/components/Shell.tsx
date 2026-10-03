import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Bone, Heart, Moon, Sun, ScanFace, LogOut, PawPrint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

function FloatingBg() {
  const items = [
    { el: "cloud", cls: "left-[5%] top-[12%] w-32" },
    { el: "cloud", cls: "right-[8%] top-[30%] w-40 [animation-delay:-3s]" },
    { el: "bone", cls: "left-[12%] bottom-[18%] [animation-delay:-2s]" },
    { el: "heart", cls: "right-[15%] bottom-[10%] [animation-delay:-5s]" },
    { el: "heart", cls: "left-[45%] top-[6%] [animation-delay:-1s]" },
    { el: "bone", cls: "right-[40%] bottom-[35%] [animation-delay:-4s]" },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {items.map((it, i) => (
        <div key={i} className={`absolute animate-floaty opacity-60 ${it.cls}`}>
          {it.el === "cloud" ? (
            <div className="h-12 rounded-full bg-sky shadow-inner" />
          ) : it.el === "bone" ? (
            <Bone className="size-10 text-warning" />
          ) : (
            <Heart className="size-8 fill-accent text-accent" />
          )}
        </div>
      ))}
    </div>
  );
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return user;
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  return (
    <button
      aria-label="Εναλλαγή σκοτεινής λειτουργίας"
      onClick={() => {
        const d = !dark;
        setDark(d);
        localStorage.setItem("theme", d ? "dark" : "light");
        document.documentElement.classList.toggle("dark", d);
      }}
      className="clay-btn grid size-10 place-items-center bg-muted text-foreground"
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

const NAV = [
  { to: "/dashboard", label: "Διαβατήρια" },
  { to: "/budget", label: "Έξοδα" },
  { to: "/health", label: "Υγεία" },
  { to: "/wallet", label: "Πορτοφόλι" },
  { to: "/community", label: "Παρέα" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const user = useUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen">
      <FloatingBg />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="mr-auto flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <PawPrint className="size-6 text-primary" /> My.<span className="text-primary">Skilitsa</span>.com
          </Link>
          {user && (
            <nav className="order-last flex w-full gap-1 overflow-x-auto md:order-none md:w-auto">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-full px-3 py-1.5 text-sm font-bold text-muted-foreground hover:bg-muted"
                  activeProps={{ className: "bg-muted !text-foreground" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          )}
          <Link to="/scan" className="clay-btn flex items-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground">
             <ScanFace className="size-4" /> Σάρωση χαμένου σκύλου
          </Link>
          <ThemeToggle />
          {user ? (
            <button
              aria-label="Αποσύνδεση"
              onClick={async () => {
                await qc.cancelQueries();
                qc.clear();
                await supabase.auth.signOut();
                navigate({ to: "/auth", replace: true });
              }}
              className="clay-btn grid size-10 place-items-center bg-muted text-foreground"
            >
              <LogOut className="size-5" />
            </button>
          ) : (
            <Link to="/auth" className="clay-btn bg-primary px-4 py-2 text-sm text-primary-foreground">
              Σύνδεση
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-4xl font-bold">{title}</h1>
      {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export const inputCls =
  "w-full rounded-2xl border-2 border-input bg-background px-4 py-2.5 outline-none focus:border-primary";
