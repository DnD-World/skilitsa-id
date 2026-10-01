import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, Fingerprint } from "lucide-react";
import { PageTitle, inputCls } from "@/components/Shell";
import { AVATARS, avatarSrc, fakeVector, resizePhoto } from "@/lib/dogs";
import { useDelete, useInsert, useRows, useUpdate } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dog Passports — SkilitsaID" }, { name: "description", content: "Your dogs' biometric passports." }] }),
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
        <PageTitle title="Biometric Pet Passports" sub="Each passport carries an 896-dimension facial fingerprint." />
        <button onClick={() => setOpen(!open)} className="clay-btn mb-6 flex items-center gap-2 bg-primary px-5 py-3 text-primary-foreground">
          <Plus className="size-5" /> Register a dog
        </button>
      </div>
      {open && <RegisterForm onDone={() => setOpen(false)} />}
      {isLoading ? (
        <p>Loading…</p>
      ) : dogs.length === 0 && !open ? (
        <div className="clay p-10 text-center">
          <img src={avatarSrc("beagle")} alt="" className="mx-auto size-32" />
          <p className="mt-3 text-lg font-bold">No passports yet. Register your first dog!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {dogs.map((d) => (
            <div key={d.id} className="clay overflow-hidden">
              <div className="flex items-center justify-between bg-primary px-5 py-2 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground">
                <span>Biometric Pet Passport</span>
                <Fingerprint className="size-5" />
              </div>
              <div className="flex gap-5 p-5">
                <img src={d.photo_url || avatarSrc(d.avatar)} alt={d.name} className="size-28 shrink-0 rounded-2xl bg-muted object-cover" />
                <div className="min-w-0 flex-1 text-sm">
                  <h3 className="text-2xl font-bold">{d.name}</h3>
                  <p className="text-muted-foreground">{d.breed}</p>
                  <p className="mt-1">Chip: <b>{d.microchip || "—"}</b></p>
                  <p>Contact: <b>{d.owner_name}</b> · {d.owner_phone}</p>
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
                  Findable by public scanner
                </label>
                <button aria-label="Delete passport" onClick={() => confirm(`Delete ${d.name}'s passport?`) && del.mutate(d.id)} className="text-muted-foreground hover:text-destructive">
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
      { ...f, microchip: f.microchip || null, medical_alerts: f.medical_alerts || null, avatar, breed: AVATARS[avatar].breed, photo_url: photo },
      {
        onSuccess: () => {
          toast.success(`${f.name}'s passport is issued! 🐾`);
          onDone();
        },
        onSettled: () => setExtracting(false),
      },
    );
  }

  return (
    <form onSubmit={submit} className="clay mb-8 grid gap-4 p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <p className="mb-2 font-bold">Breed avatar</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(AVATARS).map(([k, a]) => (
            <button type="button" key={k} onClick={() => setAvatar(k)} className={`rounded-2xl border-4 p-1 ${avatar === k ? "border-primary" : "border-transparent"}`}>
              <img src={a.src} alt={a.breed} className="size-16 rounded-xl bg-muted" />
            </button>
          ))}
          <label className="clay-btn grid size-[76px] cursor-pointer place-items-center overflow-hidden bg-muted text-xs">
            {photo ? <img src={photo} alt="Uploaded" className="size-full object-cover" /> : "Face photo"}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => e.target.files?.[0] && setPhoto(await resizePhoto(e.target.files[0]))} />
          </label>
        </div>
      </div>
      <input className={inputCls} required placeholder="Dog's name" value={f.name} onChange={set("name")} />
      <input className={inputCls} placeholder="Microchip number" value={f.microchip} onChange={set("microchip")} />
      <input className={inputCls} required placeholder="Emergency contact name" value={f.owner_name} onChange={set("owner_name")} />
      <input className={inputCls} required type="tel" placeholder="Emergency phone" value={f.owner_phone} onChange={set("owner_phone")} />
      <input className={`${inputCls} md:col-span-2`} placeholder="Medical needs (e.g. Requires daily insulin)" value={f.medical_alerts} onChange={set("medical_alerts")} />
      <button disabled={extracting} className="clay-btn bg-primary py-3 text-primary-foreground disabled:opacity-70 md:col-span-2">
        {extracting ? "Extracting 896-d facial fingerprint…" : "Issue Biometric Passport"}
      </button>
    </form>
  );
}
