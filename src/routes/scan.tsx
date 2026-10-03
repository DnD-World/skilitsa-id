import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, AlertTriangle, RotateCcw, Upload, MapPin, Link2, Type, Star, Home, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { avatarSrc, DEMO_DOGS, REGIONS, reportStars, resizePhoto, type MatchDog } from "@/lib/dogs";
import { inputCls } from "@/components/Shell";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Σάρωση χαμένου σκύλου — My.Skilitsa.com" },
      { name: "description", content: "Βρήκες σκύλο; Σάρωσε το πρόσωπό του και ειδοποίησε τον κηδεμόνα του με ασφάλεια, χωρίς λογαριασμό." },
      { property: "og:title", content: "Σάρωση χαμένου σκύλου — My.Skilitsa.com" },
      { property: "og:description", content: "Σάρωσε το πρόσωπο ενός χαμένου σκύλου και βοήθησέ τον να επιστρέψει στην οικογένειά του." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

type Phase = "idle" | "scanning" | "match";
const STEPS = ["Εντοπισμός προσώπου και μουσούδας…", "Εντοπισμός αυτιών και ματιών…", "Ανάλυση DINO-v2 (384-d)…", "Ανάλυση DogFace ONNX (512-d)…", "Σύνθεση αποτυπώματος 896-d…", "Αναζήτηση στην περιοχή…"];
const SPARKS = [[38, 40], [62, 40], [50, 56], [30, 24], [70, 24]];

function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [still, setStill] = useState<string | null>(null);
  const [region, setRegion] = useState("ATTICA");
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [match, setMatch] = useState<{ dog: MatchDog; score: number } | null>(null);
  const [camError, setCamError] = useState(false);

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  async function openCam() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      setStill(null);
      setCamError(false);
    } catch {
      setCamError(true);
    }
  }

  async function runScan() {
    setPhase("scanning");
    setStep(0);
    const lookup = supabase.rpc("scan_match", { _region: region });
    for (let i = 1; i <= STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setStep(i);
    }
    const { data } = await lookup;
    const fallback = DEMO_DOGS[Math.floor(Math.random() * DEMO_DOGS.length)] ?? DEMO_DOGS[0];
    if (!fallback) return;
    const row = data?.[0];
    const dog: MatchDog = row ? { ...row } : fallback;
    setMatch({ dog, score: 78 + Math.random() * 21 });
    setPhase("match");
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function reset() {
    setPhase("idle");
    setMatch(null);
    setStill(null);
  }

  if (phase === "match" && match) return <ReunionCard dog={match.dog} score={match.score} region={region} onReset={reset} />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-center text-4xl font-bold">Βρήκες έναν σκύλο;</h1>
      <p className="mt-2 text-center text-muted-foreground">Βάλε το πρόσωπό του μέσα στον κύκλο. Θα ειδοποιήσουμε την οικογένειά του.</p>

      <label className="mt-6 block text-sm font-bold">
        Σε ποια περιοχή βρίσκεσαι;
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={`${inputCls} mt-1`} disabled={phase !== "idle"}>
          {Object.entries(REGIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>

      <div className="relative mt-4 aspect-[3/4] overflow-hidden rounded-[2rem] border border-border bg-muted">
        {stream && <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 size-full object-cover" />}
        {still && <img src={still} alt="Σκύλος προς σάρωση" className="absolute inset-0 size-full object-cover" />}
        {!stream && !still && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-muted-foreground">
            <div>
              <Camera className="mx-auto size-14 opacity-60" />
              <p className="mt-3 font-bold">Η κάμερα είναι κλειστή</p>
              {camError && <p className="text-sm">Η κάμερα δεν είναι διαθέσιμη — ανέβασε μια φωτογραφία.</p>}
            </div>
          </div>
        )}
        {/* Soft pulse-ring HUD */}
        <div className="pointer-events-none absolute left-1/2 top-[42%] size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-background/60 shadow-[0_0_0_9999px] shadow-foreground/15" />
        {phase === "scanning" && (
          <>
            {[0, 0.9, 1.8].map((d) => (
              <span key={d} className="pointer-events-none absolute left-1/2 top-[42%] size-[58%] animate-pulse-ring rounded-full border-2 border-primary/40 bg-primary/5" style={{ animationDelay: `${d}s` }} />
            ))}
            {SPARKS.map(([x, y], i) => (
              <span key={i} className="absolute size-2.5 animate-twinkle rounded-full bg-background shadow-[0_0_10px_3px] shadow-primary/40" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.3}s` }} />
            ))}
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-background/85 p-3 text-xs backdrop-blur">
              <p className="font-bold">{STEPS[Math.min(step, STEPS.length - 1)]}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary/70 transition-all duration-500" style={{ width: `${(step / STEPS.length) * 100}%` }} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!stream && phase === "idle" && (
          <button onClick={openCam} className="pill-outline flex items-center gap-2 py-2.5">
            <Camera className="size-5" /> Άνοιγμα κάμερας
          </button>
        )}
        {phase === "idle" && (
          <label className="pill-outline flex cursor-pointer items-center gap-2 py-2.5">
            <Upload className="size-5" /> Ανέβασμα φωτογραφίας
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  stream?.getTracks().forEach((t) => t.stop());
                  setStream(null);
                  setStill(await resizePhoto(f, 640, 0.85));
                }
              }}
            />
          </label>
        )}
        {(stream || still) && phase === "idle" && (
          <button onClick={runScan} className="clay-btn bg-primary px-8 py-3 text-lg text-primary-foreground">
            Σάρωση προσώπου
          </button>
        )}
      </div>
      <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" /> Δεν ζητάμε GPS. Οι φωτογραφίες καθαρίζονται από μεταδεδομένα. Demo mode: η αντιστοίχιση είναι προσομοίωση.
      </p>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} από 5 αστέρια`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`size-5 transition-transform ${i <= n ? "scale-110 fill-warning text-warning" : "text-muted-foreground/40"}`} />
      ))}
    </span>
  );
}

type LocMode = "text" | "link" | "pin";

function ReunionCard({ dog, score, region, onReset }: { dog: MatchDog; score: number; region: string; onReset: () => void }) {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<LocMode>("text");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [photo2, setPhoto2] = useState<string | null>(null);
  const [atShelter, setAtShelter] = useState(false);
  const [shelter, setShelter] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const stars = reportStars({ shelter: atShelter && !!shelter.trim(), secondPhoto: !!photo2, score, purebred: dog.purebred });

  function pin() {
    if (!navigator.geolocation) { toast.error("Ο εντοπισμός δεν υποστηρίζεται."); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setMode("pin");
        setLocation(`https://maps.google.com/?q=${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`);
      },
      () => toast.error("Δεν δόθηκε άδεια εντοπισμού."),
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!dog.dog_id) {
      setSent(stars);
      toast.success("Demo: η αναφορά θα έφτανε στον κηδεμόνα.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("submit_finder_report", {
      _dog_id: dog.dog_id,
      _email: email,
      _mode: mode,
      _location: location,
      _message: message,
      _second_photo: photo2 ?? undefined,
      _shelter: atShelter ? shelter : "",
      _score: Number(score.toFixed(1)),
    } as never);
    setBusy(false);
    if (error) { toast.error("Η αποστολή απέτυχε. Έλεγξε τα στοιχεία σου."); return; }
    setSent(Number(data));
  }

  const modes: { k: LocMode; icon: typeof Type; label: string; ph: string }[] = [
    { k: "text", icon: Type, label: "Περιγραφή / διεύθυνση", ph: "π.χ. Πλατεία Νέας Σμύρνης, έξω από την καφετέρια" },
    { k: "link", icon: Link2, label: "Σύνδεσμος χάρτη", ph: "Επικόλλησε link από Google ή Apple Maps" },
  ];

  return (
    <div className="mx-auto max-w-md animate-pop">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
        <div className="bg-primary p-4 text-center font-display text-2xl font-bold text-primary-foreground">{score.toFixed(1)}% αντιστοίχιση</div>
        <div className="p-6 text-center">
          <img src={dog.photo_url || avatarSrc(dog.avatar)} alt={dog.name} className="mx-auto size-40 rounded-full border-4 border-muted bg-muted object-cover" />
          <h2 className="mt-4 text-4xl font-bold">Γεια, είμαι ο/η {dog.name}!</h2>
          <p className="text-muted-foreground">{dog.breed} · {REGIONS[region]}</p>
          {dog.medical_alerts && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-destructive/15 p-3 text-left text-destructive">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <p className="font-bold">Επείγον: {dog.medical_alerts}</p>
            </div>
          )}
        </div>

        {sent !== null ? (
          <div className="border-t border-border p-6 text-center">
            <Stars n={sent} />
            <p className="mt-3 text-lg font-bold">Ευχαριστούμε! Ο κηδεμόνας ειδοποιήθηκε 🐾</p>
            <p className="text-sm text-muted-foreground">Θα επικοινωνήσει μαζί σου στο email σου. Η αναφορά διαγράφεται αυτόματα σε 7 ημέρες.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-3 border-t border-border p-6 text-sm">
            <p className="font-display text-lg font-bold">Ειδοποίησε τον κηδεμόνα</p>
            <input className={inputCls} type="email" required maxLength={254} placeholder="Το email σου" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label className="flex items-center gap-2 rounded-2xl bg-muted p-3 font-bold">
              <input type="checkbox" checked={atShelter} onChange={(e) => setAtShelter(e.target.checked)} className="size-4 accent-[var(--primary)]" />
              <Home className="size-4" /> Τον παρέδωσα σε καταφύγιο / κτηνιατρείο
            </label>
            {atShelter && <input className={inputCls} required maxLength={200} placeholder="Όνομα και διεύθυνση καταφυγίου" value={shelter} onChange={(e) => setShelter(e.target.value)} />}

            <p className="font-bold">Πού τον βρήκες;</p>
            <div className="flex flex-wrap gap-2">
              {modes.map((m) => (
                <button type="button" key={m.k} onClick={() => setMode(m.k)} className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${mode === m.k ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                  <m.icon className="size-3.5" /> {m.label}
                </button>
              ))}
              <button type="button" onClick={pin} className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${mode === "pin" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                <MapPin className="size-3.5" /> Τρέχουσα θέση (προαιρετικά)
              </button>
            </div>
            <input className={inputCls} required maxLength={500} placeholder={modes.find((m) => m.k === mode)?.ph ?? "Συντεταγμένες"} value={location} onChange={(e) => setLocation(e.target.value)} />

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border p-3">
              {photo2 ? <img src={photo2} alt="Δεύτερη φωτογραφία" className="size-12 rounded-xl object-cover" /> : <Camera className="size-6" />}
              <span>Δεύτερη φωτογραφία του σκύλου <b>(+2 αστέρια)</b></span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => e.target.files?.[0] && setPhoto2(await resizePhoto(e.target.files[0], 480))} />
            </label>

            <textarea className={inputCls} rows={2} maxLength={1000} placeholder="Μήνυμα (προαιρετικό)" value={message} onChange={(e) => setMessage(e.target.value)} />

            <div className="flex items-center justify-between rounded-2xl bg-muted p-3">
              <span className="font-bold">Αξιοπιστία αναφοράς</span>
              <Stars n={stars} />
            </div>
            <button disabled={busy} className="clay-btn flex items-center justify-center gap-2 bg-primary py-3.5 text-lg text-primary-foreground disabled:opacity-70">
              <Send className="size-5" /> {busy ? "Αποστολή…" : "Αποστολή στον κηδεμόνα"}
            </button>
            <p className="text-center text-xs text-muted-foreground">Ο κηδεμόνας βλέπει μόνο ό,τι γράφεις εδώ. Εσύ δεν βλέπεις τα στοιχεία του.</p>
          </form>
        )}
      </div>
      <button onClick={onReset} className="mx-auto mt-6 flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <RotateCcw className="size-4" /> Σάρωση άλλου σκύλου
      </button>
    </div>
  );
}
