import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Syringe, Stethoscope, Pill, Trash2 } from "lucide-react";
import { PageTitle, inputCls } from "@/components/Shell";
import { daysBetween, today, useDelete, useInsert, useRows, useUpdate } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/health")({
  head: () => ({ meta: [{ title: "Υγεία και εμβόλια — SkilitsaID" }, { name: "description", content: "Πρόγραμμα εμβολίων, κτηνιατρικών ελέγχων και φαρμάκων." }, { property: "og:title", content: "Υγεία και εμβόλια — SkilitsaID" }, { property: "og:description", content: "Πρόγραμμα εμβολίων, κτηνιατρικών ελέγχων και φαρμάκων." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Health,
});

type Ev = { id: string; kind: string; title: string; due_on: string; clinic: string | null; done: boolean; dog_id: string | null };
const CORE = ["Rabies", "DHPP", "Bordetella", "Leptospirosis"];
const HEALTH_LABELS: Record<string, string> = { Rabies: "Λύσσα", DHPP: "DHPP", Bordetella: "Bordetella", Leptospirosis: "Λεπτοσπείρωση", "Flea/tick chewable": "Χάπι για ψύλλους και τσιμπούρια", "Annual checkup": "Ετήσιος έλεγχος" };
const ICON = { vaccine: Syringe, appointment: Stethoscope, medication: Pill } as const;

function Health() {
  const { data: evs = [] } = useRows<Ev>("health_events", "due_on", true);
  const { data: dogs = [] } = useRows<{ id: string; name: string }>("dogs");
  const ins = useInsert("health_events");
  const upd = useUpdate("health_events");
  const del = useDelete("health_events");
  const [f, setF] = useState({ kind: "vaccine", title: "Rabies", due_on: "", clinic: "", dog_id: "" });

  const t = today();
  return (
    <div>
      <PageTitle title="Υγεία, εμβόλια και κτηνίατρος" sub="Βασικά εμβόλια, αντίστροφη μέτρηση ελέγχων και μηνιαία φάρμακα." />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {CORE.map((v) => {
          const next = evs.filter((e) => e.kind === "vaccine" && e.title === v && !e.done)[0];
          const last = evs.filter((e) => e.kind === "vaccine" && e.title === v && e.done).at(-1);
          return (
            <div key={v} className="clay p-4 text-center">
              <Syringe className="mx-auto size-7 text-secondary-foreground" />
              <p className="mt-1 font-display text-lg font-bold">{HEALTH_LABELS[v]}</p>
              <p className="text-xs text-muted-foreground">
                {next ? `Σε ${daysBetween(t, new Date(next.due_on))} ημέρες` : last ? `Έγινε ${last.due_on}` : "Δεν έχει προγραμματιστεί"}
              </p>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ins.mutate({ ...f, clinic: f.clinic || null, dog_id: f.dog_id || null }, { onSuccess: () => setF({ ...f, due_on: "", clinic: "" }) });
        }}
        className="clay mb-6 grid gap-3 p-6 md:grid-cols-6"
      >
        <select className={inputCls} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value, title: e.target.value === "vaccine" ? "Rabies" : e.target.value === "medication" ? "Flea/tick chewable" : "Annual checkup" })}>
          <option value="vaccine">Εμβόλιο</option>
          <option value="appointment">Ραντεβού κτηνιάτρου</option>
          <option value="medication">Φάρμακο</option>
        </select>
        {f.kind === "vaccine" ? (
          <select className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })}>{CORE.map((c) => <option key={c} value={c}>{HEALTH_LABELS[c]}</option>)}</select>
        ) : (
          <input className={inputCls} required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        )}
        <select className={inputCls} value={f.dog_id} onChange={(e) => setF({ ...f, dog_id: e.target.value })}>
          <option value="">Όλοι οι σκύλοι</option>
          {dogs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input className={inputCls} required type="date" value={f.due_on} onChange={(e) => setF({ ...f, due_on: e.target.value })} />
        <input className={inputCls} placeholder="Κτηνιατρείο" value={f.clinic} onChange={(e) => setF({ ...f, clinic: e.target.value })} />
        <button className="clay-btn bg-primary py-2 text-primary-foreground">Προσθήκη</button>
      </form>

      <ol className="relative space-y-4 border-l-4 border-dashed border-border pl-6">
        {evs.length === 0 && <p className="text-muted-foreground">Δεν υπάρχει ακόμη προγραμματισμένο ραντεβού.</p>}
        {evs.map((e) => {
          const Icon = ICON[e.kind as keyof typeof ICON] ?? Stethoscope;
          const d = daysBetween(t, new Date(e.due_on));
          const tone = e.done ? "bg-muted text-muted-foreground" : d < 0 ? "bg-destructive text-destructive-foreground" : d <= 7 ? "bg-warning text-foreground" : "bg-success text-primary-foreground";
          return (
            <li key={e.id} className={`clay flex items-center gap-4 p-4 ${e.done ? "opacity-60" : ""}`}>
              <span className="absolute -left-[14px] size-6 rounded-full border-4 border-background bg-primary" />
              <Icon className="size-7 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="font-bold">{HEALTH_LABELS[e.title] ?? e.title} {e.dog_id && <span className="text-muted-foreground">· {dogs.find((x) => x.id === e.dog_id)?.name}</span>}</p>
                <p className="text-sm text-muted-foreground">{e.due_on}{e.clinic && ` · ${e.clinic}`}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${tone}`}>
                {e.done ? "Ολοκληρώθηκε" : d < 0 ? `${-d}ημ. καθυστέρηση` : d === 0 ? "Σήμερα" : `σε ${d}ημ.`}
              </span>
              <button
                aria-label="Σήμανση ως ολοκληρωμένο"
                onClick={() => {
                  upd.mutate({ id: e.id, done: !e.done });
                  if (!e.done && e.kind === "medication") {
                    const n = new Date(e.due_on); n.setMonth(n.getMonth() + 1);
                    ins.mutate({ kind: e.kind, title: e.title, dog_id: e.dog_id, clinic: e.clinic, due_on: n.toISOString().slice(0, 10) });
                  }
                }}
                className="clay-btn grid size-9 place-items-center bg-secondary text-secondary-foreground"
              >
                <Check className="size-4" />
              </button>
              <button aria-label="Διαγραφή" onClick={() => del.mutate(e.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">Η ολοκλήρωση ενός μηνιαίου φαρμάκου προγραμματίζει αυτόματα την επόμενη δόση.</p>
    </div>
  );
}
