import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PageTitle, inputCls } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { useDelete, useInsert, useRows } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({ meta: [{ title: "Έξοδα σκύλου — SkilitsaID" }, { name: "description", content: "Παρακολούθησε τα έξοδα τροφής, κτηνιάτρου και περιποίησης." }, { property: "og:title", content: "Έξοδα σκύλου — SkilitsaID" }, { property: "og:description", content: "Παρακολούθησε τα έξοδα φροντίδας του σκύλου σου." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Budget,
});

type Expense = { id: string; category: string; label: string; amount: number; spent_on: string };
const CATS = [
  { value: "Food", label: "Τροφή" },
  { value: "Treats", label: "Λιχουδιές" },
  { value: "Vet", label: "Κτηνίατρος" },
  { value: "Grooming", label: "Περιποίηση" },
  { value: "Other", label: "Άλλο" },
];
const CAT_LABELS = Object.fromEntries(CATS.map((category) => [category.value, category.label]));

function Budget() {
  const qc = useQueryClient();
  const { data: rows = [] } = useRows<Expense>("expenses", "spent_on");
  const ins = useInsert("expenses");
  const del = useDelete("expenses");
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await supabase.from("settings").select("*").maybeSingle()).data,
  });
  const [limit, setLimit] = useState(200);
  useEffect(() => { if (settings) setLimit(Number(settings.monthly_budget)); }, [settings]);
  const [f, setF] = useState({ category: "Food", label: "", amount: "", spent_on: new Date().toISOString().slice(0, 10) });

  const now = new Date();
  const month = rows.filter((r) => { const d = new Date(r.spent_on); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const spent = month.reduce((s, r) => s + Number(r.amount), 0);
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  const tone = pct > 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success";
  const label = pct > 90 ? "Κρίσιμο — πάνω από 90%" : pct >= 70 ? "Προσοχή — 70–90%" : "Εντός ορίου — κάτω από 70%";
  const day = now.getDate();
  const velocity = spent / day;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  async function saveLimit() {
    await supabase.from("settings").upsert({ monthly_budget: limit } as any);
    qc.invalidateQueries({ queryKey: ["settings"] });
  }

  return (
    <div>
       <PageTitle title="Έξοδα και τροφή" sub="Δες καθαρά το πραγματικό κόστος φροντίδας." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="clay p-6 lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
               <p className="text-sm font-bold text-muted-foreground">Αυτόν τον μήνα</p>
              <p className="font-display text-5xl font-bold">€{spent.toFixed(2)}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold text-primary-foreground ${tone}`}>{label}</span>
          </div>
          <div className="mt-4 h-6 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
           <p className="mt-2 text-sm text-muted-foreground">{pct.toFixed(0)}% από το όριο των €{limit}</p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
             <Stat k="Ανά ημέρα" v={`€${velocity.toFixed(2)}`} />
             <Stat k="Πρόβλεψη μήνα" v={`€${(velocity * daysInMonth).toFixed(0)}`} />
             <Stat k="Υπόλοιπο" v={`€${Math.max(limit - spent, 0).toFixed(0)}`} />
          </div>
        </div>
        <div className="clay space-y-3 p-6">
           <p className="font-bold">Μηνιαίο όριο (€)</p>
          <input className={inputCls} type="number" min={0} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
           <button onClick={saveLimit} className="clay-btn w-full bg-secondary py-2 text-secondary-foreground">Αποθήκευση ορίου</button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ins.mutate({ ...f, amount: Number(f.amount) }, { onSuccess: () => setF({ ...f, label: "", amount: "" }) });
        }}
        className="clay mt-6 grid gap-3 p-6 md:grid-cols-5"
      >
        <select className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
           {CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
         <input className={inputCls} required placeholder="Τι αγόρασες (π.χ. τροφή 17 κιλών)" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
        <input className={inputCls} required type="number" step="0.01" min="0" placeholder="€" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <input className={inputCls} type="date" value={f.spent_on} onChange={(e) => setF({ ...f, spent_on: e.target.value })} />
         <button className="clay-btn bg-primary py-2 text-primary-foreground">Προσθήκη εξόδου</button>
      </form>

      <div className="clay mt-6 divide-y divide-border">
         {rows.length === 0 && <p className="p-6 text-muted-foreground">Δεν υπάρχουν ακόμη έξοδα.</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-6 py-3">
             <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-bold">{CAT_LABELS[r.category] ?? r.category}</span>
            <span className="flex-1 font-bold">{r.label}</span>
            <span className="text-sm text-muted-foreground">{r.spent_on}</span>
            <span className="w-20 text-right font-display font-bold">€{Number(r.amount).toFixed(2)}</span>
             <button aria-label="Διαγραφή" onClick={() => del.mutate(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <p className="font-display text-2xl font-bold">{v}</p>
      <p className="text-xs font-bold text-muted-foreground">{k}</p>
    </div>
  );
}
