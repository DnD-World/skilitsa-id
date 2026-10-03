import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, Fingerprint, Star, Info, Mail, MapPin, Home } from "lucide-react";
import { PageTitle, inputCls } from "@/components/Shell";
import { AVATARS, avatarSrc, fakeVector, resizePhoto, REGIONS } from "@/lib/dogs";
import { useDelete, useInsert, useRows, useUpdate } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Τα διαβατήρια των σκύλων μου — SkilitsaID" }, { name: "description", content: "Τα βιομετρικά διαβατήρια των σκύλων σου." }, { property: "og:title", content: "Τα διαβατήρια των σκύλων μου — SkilitsaID" }, { property: "og:description", content: "Τα βιομετρικά διαβατήρια των σκύλων σου." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

type Dog = { id: string; name: string; breed: string; avatar: string; photo_url: string | null; microchip: string | null; medical_alerts: string | null; owner_name: string; region: string; purebred: boolean; fingerprint_id: string; scannable: boolean; created_at: string };

function Dashboard() {
  const { data: dogs = [], isLoading } = useRows<Dog>("dogs");
  const [open, setOpen] = useState(false);
  const del = useDelete("dogs");
  const upd = useUpdate("dogs");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
         <PageTitle title="Βιομετρικά διαβατήρια σκύλων" sub="Κάθε διαβατήριο περιέχει ένα αποτύπωμα προσώπου 896 διαστάσεων." />
        <button onClick={() => setOpen(!open)} className="clay-btn mb-6 flex items-center gap-2 bg-primary px-5 py-3 text-primary-foreground">
           <Plus className="size-5" /> Εγγραφή σκύλου
        </button>
      </div>
      <div className="mb-6 flex gap-3 rounded-2xl border border-border p-4 text-sm">
        <Info className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>Το SkilitsaID είναι βοηθητικό εργαλείο επανένωσης και <b>δεν αντικαθιστά</b> το υποχρεωτικό microchip και την εγγραφή στο Εθνικό Μητρώο Ζώων Συντροφιάς (Ν. 4830/2021). Το αποτύπωμα αφορά τον σκύλο, όχι εσένα. Δεν δημοσιεύουμε ποτέ τηλέφωνο ή email σου.</p>
      </div>
      <Reports />
      {open && <RegisterForm onDone={() => setOpen(false)} />}
      {isLoading ? (
         <p>Φόρτωση…</p>
      ) : dogs.length === 0 && !open ? (
        <div className="clay p-10 text-center">
          <img src={avatarSrc("beagle")} alt="" className="mx-auto size-32" />
           <p className="mt-3 text-lg font-bold">Δεν υπάρχει ακόμη διαβατήριο. Πρόσθεσε τον πρώτο σου σκύλο!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {dogs.map((d) => (
            <div key={d.id} className="clay overflow-hidden">
              <div className="flex items-center justify-between bg-primary px-5 py-2 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground">
                 <span>Βιομετρικό διαβατήριο σκύλου</span>
                <Fingerprint className="size-5" />
              </div>
              <div className="flex gap-5 p-5">
                <img src={d.photo_url || avatarSrc(d.avatar)} alt={d.name} className="size-28 shrink-0 rounded-2xl bg-muted object-cover" />
                <div className="min-w-0 flex-1 text-sm">
                  <h3 className="text-2xl font-bold">{d.name}</h3>
                  <p className="text-muted-foreground">{d.breed}</p>
                   <p className="mt-1">Microchip: <b>{d.microchip || "—"}</b></p>
                   <p>Κηδεμόνας: <b>{d.owner_name}</b> · {REGIONS[d.region] ?? d.region}</p>
                  <p>{d.purebred ? "Καθαρόαιμο" : "Ημίαιμο"}</p>
                  <p className="font-mono text-xs text-muted-foreground">ID #{d.fingerprint_id}</p>
                </div>
              </div>
              {d.medical_alerts && (
                <p className="mx-5 flex items-center gap-2 rounded-xl bg-destructive/15 px-3 py-2 text-sm font-bold text-destructive">
                  <AlertTriangle className="size-4" /> {d.medical_alerts}
                </p>
              )}
              <div className="mx-5 mt-3 flex h-8 items-end gap-px" title="Προεπισκόπηση αποτυπώματος (24 από 896 διαστάσεις)">
                {fakeVector(d.fingerprint_id, 64).map((v, i) => (
                  <div key={i} className={`flex-1 rounded-sm ${i < 27 ? "bg-secondary" : "bg-chart-3"}`} style={{ height: `${15 + v * 85}%` }} />
                ))}
              </div>
              <div className="flex items-center justify-between p-5 pt-3 text-sm">
                 <label className="flex items-center gap-2 font-bold">
                  <input type="checkbox" checked={d.scannable} onChange={(e) => upd.mutate({ id: d.id, scannable: e.target.checked })} className="size-4 accent-[var(--primary)]" />
                   Ορατός στη δημόσια σάρωση
                </label>
                 <button aria-label="Διαγραφή διαβατηρίου" onClick={() => confirm(`Να διαγραφεί το διαβατήριο του ${d.name};`) && del.mutate(d.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const ins = useInsert("dogs");
  const [avatar, setAvatar] = useState("golden");
  const [photo, setPhoto] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [f, setF] = useState({ name: "", microchip: "", medical_alerts: "", owner_name: "", region: "ATTICA", purebred: "1" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setExtracting(true);
    await new Promise((r) => setTimeout(r, 1400)); // simulated vector extraction
    ins.mutate(
      { ...f, purebred: f.purebred === "1", microchip: f.microchip || null, medical_alerts: f.medical_alerts || null, avatar, breed: AVATARS[avatar]?.breed ?? "Σκύλος", photo_url: photo },
      {
        onSuccess: () => {
           toast.success(`Το διαβατήριο του ${f.name} εκδόθηκε! 🐾`);
          onDone();
        },
        onSettled: () => setExtracting(false),
      },
    );
  }

  return (
    <form onSubmit={submit} className="clay mb-8 grid gap-4 p-6 md:grid-cols-2">
      <div className="md:col-span-2">
         <p className="mb-2 font-bold">Εικονίδιο ράτσας</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(AVATARS).map(([k, a]) => (
            <button type="button" key={k} onClick={() => setAvatar(k)} className={`rounded-2xl border-4 p-1 ${avatar === k ? "border-primary" : "border-transparent"}`}>
              <img src={a.src} alt={a.breed} className="size-16 rounded-xl bg-muted" />
            </button>
          ))}
          <label className="clay-btn grid size-[76px] cursor-pointer place-items-center overflow-hidden bg-muted text-xs">
             {photo ? <img src={photo} alt="Φωτογραφία σκύλου" className="size-full object-cover" /> : "Φωτογραφία προσώπου"}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => e.target.files?.[0] && setPhoto(await resizePhoto(e.target.files[0]))} />
          </label>
        </div>
      </div>
       <input className={inputCls} required placeholder="Όνομα σκύλου" value={f.name} onChange={set("name")} />
       <input className={inputCls} placeholder="Αριθμός microchip" value={f.microchip} onChange={set("microchip")} />
       <input className={inputCls} required maxLength={50} placeholder="Το μικρό σου όνομα" value={f.owner_name} onChange={set("owner_name")} />
       <select className={inputCls} value={f.region} onChange={set("region")}>
         {Object.entries(REGIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
       </select>
       <select className={inputCls} value={f.purebred} onChange={set("purebred")}>
         <option value="1">Καθαρόαιμο</option>
         <option value="0">Ημίαιμο / μιγάς</option>
       </select>
       <input className={`${inputCls} md:col-span-2`} placeholder="Ιατρικές ανάγκες (π.χ. χρειάζεται καθημερινά ινσουλίνη)" value={f.medical_alerts} onChange={set("medical_alerts")} />
      <button disabled={extracting} className="clay-btn bg-primary py-3 text-primary-foreground disabled:opacity-70 md:col-span-2">
         {extracting ? "Δημιουργία αποτυπώματος προσώπου 896-d…" : "Έκδοση βιομετρικού διαβατηρίου"}
      </button>
    </form>
  );
}

type Report = { id: string; dog_id: string; finder_email: string; location_mode: string; location: string; message: string | null; second_photo: string | null; shelter_name: string | null; match_score: number; stars: number; created_at: string; expires_at: string };

function Reports() {
  const { data: reports = [] } = useRows<Report>("finder_reports");
  const { data: dogs = [] } = useRows<Dog>("dogs");
  const del = useDelete("finder_reports");
  if (!reports.length) return null;
  const sorted = [...reports].sort((a, b) => b.stars - a.stars || b.created_at.localeCompare(a.created_at));
  return (
    <div className="mb-8">
      <h2 className="mb-3 text-2xl font-bold">Αναφορές ευρετών</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((r) => {
          const dog = dogs.find((d) => d.id === r.dog_id);
          const isLink = /^https?:\/\//.test(r.location);
          return (
            <div key={r.id} className="rounded-[1.5rem] border border-border bg-card p-5 text-sm">
              <div className="flex items-center justify-between">
                <b className="font-display text-lg">{dog?.name ?? "Σκύλος"}</b>
                <span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`size-4 ${i <= r.stars ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />)}</span>
              </div>
              {r.shelter_name && <p className="mt-2 flex items-center gap-1 font-bold text-success"><Home className="size-4" /> Σε καταφύγιο: {r.shelter_name}</p>}
              <p className="mt-2 flex items-start gap-1"><MapPin className="mt-0.5 size-4 shrink-0" />{isLink ? <a href={r.location} target="_blank" rel="noreferrer" className="underline">Άνοιγμα στον χάρτη</a> : r.location}</p>
              {r.message && <p className="mt-1 italic">«{r.message}»</p>}
              {r.second_photo && <img src={r.second_photo} alt="Φωτογραφία ευρετή" className="mt-2 h-28 rounded-xl object-cover" />}
              <p className="mt-2 flex items-center gap-1"><Mail className="size-4" /><a href={`mailto:${r.finder_email}`} className="font-bold underline">{r.finder_email}</a></p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{r.match_score}% · λήγει {new Date(r.expires_at).toLocaleDateString("el-GR")}</span>
                <button aria-label="Διαγραφή αναφοράς" onClick={() => del.mutate(r.id)} className="hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
