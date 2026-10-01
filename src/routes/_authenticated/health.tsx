import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Syringe, Stethoscope, Pill, Trash2 } from "lucide-react";
import { PageTitle, inputCls } from "@/components/Shell";
import { daysBetween, today, useDelete, useInsert, useRows, useUpdate } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/health")({
  head: () => ({ meta: [{ title: "Health & Vaccines — SkilitsaID" }, { name: "description", content: "Vaccine timeline, vet checkups and medication reminders." }] }),
  component: Health,
});

type Ev = { id: string; kind: string; title: string; due_on: string; clinic: string | null; done: boolean; dog_id: string | null };
const CORE = ["Rabies", "DHPP", "Bordetella", "Leptospirosis"];
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
      <PageTitle title="Health, Vaccines & Vet" sub="Core immunizations, checkup countdowns and monthly chewables." />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {CORE.map((v) => {
          const next = evs.filter((e) => e.kind === "vaccine" && e.title === v && !e.done)[0];
          const last = evs.filter((e) => e.kind === "vaccine" && e.title === v && e.done).at(-1);
          return (
            <div key={v} className="clay p-4 text-center">
              <Syringe className="mx-auto size-7 text-secondary-foreground" />
              <p className="mt-1 font-display text-lg font-bold">{v}</p>
              <p className="text-xs text-muted-foreground">
                {next ? `Due in ${daysBetween(t, new Date(next.due_on))} days` : last ? `Done ${last.due_on}` : "Not scheduled"}
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
          <option value="vaccine">Vaccine</option>
          <option value="appointment">Vet appointment</option>
          <option value="medication">Medication</option>
        </select>
        {f.kind === "vaccine" ? (
          <select className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })}>{CORE.map((c) => <option key={c}>{c}</option>)}</select>
        ) : (
          <input className={inputCls} required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        )}
        <select className={inputCls} value={f.dog_id} onChange={(e) => setF({ ...f, dog_id: e.target.value })}>
          <option value="">All dogs</option>
          {dogs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input className={inputCls} required type="date" value={f.due_on} onChange={(e) => setF({ ...f, due_on: e.target.value })} />
        <input className={inputCls} placeholder="Clinic" value={f.clinic} onChange={(e) => setF({ ...f, clinic: e.target.value })} />
        <button className="clay-btn bg-primary py-2 text-primary-foreground">Add</button>
      </form>

      <ol className="relative space-y-4 border-l-4 border-dashed border-border pl-6">
        {evs.length === 0 && <p className="text-muted-foreground">Nothing scheduled yet.</p>}
        {evs.map((e) => {
          const Icon = ICON[e.kind as keyof typeof ICON] ?? Stethoscope;
          const d = daysBetween(t, new Date(e.due_on));
          const tone = e.done ? "bg-muted text-muted-foreground" : d < 0 ? "bg-destructive text-destructive-foreground" : d <= 7 ? "bg-warning text-foreground" : "bg-success text-primary-foreground";
          return (
            <li key={e.id} className={`clay flex items-center gap-4 p-4 ${e.done ? "opacity-60" : ""}`}>
              <span className="absolute -left-[14px] size-6 rounded-full border-4 border-background bg-primary" />
              <Icon className="size-7 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="font-bold">{e.title} {e.dog_id && <span className="text-muted-foreground">· {dogs.find((x) => x.id === e.dog_id)?.name}</span>}</p>
                <p className="text-sm text-muted-foreground">{e.due_on}{e.clinic && ` · ${e.clinic}`}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${tone}`}>
                {e.done ? "Done" : d < 0 ? `${-d}d overdue` : d === 0 ? "Today" : `in ${d}d`}
              </span>
              <button
                aria-label="Mark done"
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
              <button aria-label="Delete" onClick={() => del.mutate(e.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">Completing a monthly medication automatically schedules next month's dose.</p>
    </div>
  );
}
