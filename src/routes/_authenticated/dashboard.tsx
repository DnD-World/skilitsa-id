import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, Fingerprint } from "lucide-react";
import { PageTitle, inputCls } from "@/components/Shell";
import { AVATARS, avatarSrc, fakeVector, resizePhoto } from "@/lib/dogs";
import { useDelete, useInsert, useRows, useUpdate } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Τα διαβατήρια των σκύλων μου — SkilitsaID" }, { name: "description", content: "Τα βιομετρικά διαβατήρια των σκύλων σου." }, { property: "og:title", content: "Τα διαβατήρια των σκύλων μου — SkilitsaID" }, { property: "og:description", content: "Τα βιομετρικά διαβατήρια των σκύλων σου." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

type Dog = { id: string; name: string; breed: string; avatar: string; photo_url: string | null; microchip: string | null; medical_alerts: string | null; owner_name: string; owner_phone: string; fingerprint_id: string; scannable: boolean; created_at: string };

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
                   <p>Επικοινωνία: <b>{d.owner_name}</b> · {d.owner_phone}</p>
                  <p className="font-mono text-xs text-muted-foreground">ID #{d.fingerprint_id}</p>
                </div>
              </div>
              {d.medical_alerts && (
                <p className="mx-5 flex items-center gap-2 rounded-xl bg-destructive/15 px-3 py-2 text-sm font-bold text-destructive">
                  <AlertTriangle className="size-4" /> {d.medical_alerts}
                </p>
              )}
              <div className="mx-5 mt-3 flex h-8 items-end gap-px" title="Fingerprint preview (24 of 896 dims)">
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
  const [f, setF] = useState({ name: "", microchip: "", medical_alerts: "", owner_name: "", owner_phone: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setExtracting(true);
    await new Promise((r) => setTimeout(r, 1400)); // simulated vector extraction
    ins.mutate(
      { ...f, microchip: f.microchip || null, medical_alerts: f.medical_alerts || null, avatar, breed: AVATARS[avatar]?.breed ?? "Dog", photo_url: photo },
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
       <input className={inputCls} required placeholder="Όνομα επικοινωνίας έκτακτης ανάγκης" value={f.owner_name} onChange={set("owner_name")} />
       <input className={inputCls} required type="tel" placeholder="Τηλέφωνο έκτακτης ανάγκης" value={f.owner_phone} onChange={set("owner_phone")} />
       <input className={`${inputCls} md:col-span-2`} placeholder="Ιατρικές ανάγκες (π.χ. χρειάζεται καθημερινά ινσουλίνη)" value={f.medical_alerts} onChange={set("medical_alerts")} />
      <button disabled={extracting} className="clay-btn bg-primary py-3 text-primary-foreground disabled:opacity-70 md:col-span-2">
         {extracting ? "Δημιουργία αποτυπώματος προσώπου 896-d…" : "Έκδοση βιομετρικού διαβατηρίου"}
      </button>
    </form>
  );
}
