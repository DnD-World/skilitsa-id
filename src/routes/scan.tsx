import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Phone, MessageSquare, AlertTriangle, RotateCcw, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { avatarSrc, DEMO_DOGS, fakeVector, type MatchDog } from "@/lib/dogs";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Σάρωση χαμένου σκύλου — SkilitsaID" },
      { name: "description", content: "Βρήκες σκύλο; Στρέψε την κάμερα στο πρόσωπό του και επικοινώνησε αμέσως με τον κηδεμόνα του, χωρίς λογαριασμό." },
      { property: "og:title", content: "Σάρωση χαμένου σκύλου — SkilitsaID" },
      { property: "og:description", content: "Σάρωσε το πρόσωπο ενός χαμένου σκύλου και βοήθησέ τον να επιστρέψει στην οικογένειά του." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

type Phase = "idle" | "scanning" | "match";
const STEPS = ["Εντοπισμός προσώπου και μουσούδας…", "Εντοπισμός αυτιών και ματιών…", "Ανάλυση DINO-v2 (384-d)…", "Ανάλυση DogFace ONNX (512-d)…", "Σύνθεση αποτυπώματος 896-d…", "Αναζήτηση στο μητρώο…"];

function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [still, setStill] = useState<string | null>(null);
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
    const lookup = supabase.rpc("scan_match");
    for (let i = 1; i <= STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 550));
      setStep(i);
    }
    const { data } = await lookup;
    const dog: MatchDog = (data && data[0]) || DEMO_DOGS[Math.floor(Math.random() * DEMO_DOGS.length)]!;
    setMatch({ dog, score: 94 + Math.random() * 5.5 });
    setPhase("match");
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function reset() {
    setPhase("idle");
    setMatch(null);
    setStill(null);
  }

  if (phase === "match" && match) return <ReunionCard dog={match.dog} score={match.score} onReset={reset} />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-center text-4xl font-bold">Βρήκες έναν σκύλο;</h1>
      <p className="mt-2 text-center text-muted-foreground">Βάλε το πρόσωπό του μέσα στο πλαίσιο. Θα βρούμε την οικογένειά του.</p>

      <div className="clay relative mt-6 aspect-[3/4] overflow-hidden bg-foreground/90">
        {stream && <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 size-full object-cover" />}
        {still && <img src={still} alt="Σκύλος προς σάρωση" className="absolute inset-0 size-full object-cover" />}
        {!stream && !still && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-background">
            <div>
              <Camera className="mx-auto size-14 opacity-70" />
              <p className="mt-3 font-bold">Η κάμερα είναι κλειστή</p>
              {camError && <p className="text-sm opacity-70">Η κάμερα δεν είναι διαθέσιμη — ανέβασε μια φωτογραφία.</p>}
            </div>
          </div>
        )}
        {/* HUD */}
        <div className="pointer-events-none absolute inset-[12%] rounded-[40%] border-4 border-dashed border-primary/80" />
        {["left-4 top-4 border-l-4 border-t-4", "right-4 top-4 border-r-4 border-t-4", "left-4 bottom-4 border-l-4 border-b-4", "right-4 bottom-4 border-r-4 border-b-4"].map((c) => (
          <div key={c} className={`absolute size-10 rounded-md border-primary ${c}`} />
        ))}
        {phase === "scanning" && (
          <>
            <div className="absolute inset-x-0 h-1 animate-sweep bg-secondary shadow-[0_0_24px_6px] shadow-secondary" />
            {[[38, 40], [62, 40], [50, 55], [30, 22], [70, 22]].map(([x, y], i) => (
              <span key={i} className="absolute size-3 animate-ping rounded-full bg-primary" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.2}s` }} />
            ))}
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-background/90 p-3 font-mono text-xs">
              <p className="font-bold text-primary">{STEPS[Math.min(step, STEPS.length - 1)]}</p>
              <div className="mt-2 flex h-6 items-end gap-0.5">
                {fakeVector(String(step), 48).map((v, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-secondary" style={{ height: `${v * 100}%` }} />
                ))}
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${(step / STEPS.length) * 100}%` }} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!stream && phase === "idle" && (
          <button onClick={openCam} className="clay-btn flex items-center gap-2 bg-secondary px-5 py-3 text-secondary-foreground">
            <Camera className="size-5" /> Άνοιγμα κάμερας
          </button>
        )}
        {phase === "idle" && (
          <label className="clay-btn flex cursor-pointer items-center gap-2 bg-muted px-5 py-3">
            <Upload className="size-5" /> Ανέβασμα φωτογραφίας
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  stream?.getTracks().forEach((t) => t.stop());
                  setStream(null);
                  setStill(URL.createObjectURL(f));
                }
              }}
            />
          </label>
        )}
        {(stream || still) && phase === "idle" && (
          <button onClick={runScan} className="clay-btn bg-destructive px-8 py-3 text-lg text-destructive-foreground">
            Σάρωση προσώπου
          </button>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Demo mode: η αντιστοίχιση είναι προσομοίωση.</p>
    </div>
  );
}

function ReunionCard({ dog, score, onReset }: { dog: MatchDog; score: number; onReset: () => void }) {
  const tel = dog.owner_phone.replace(/\s/g, "");
  return (
    <div className="mx-auto max-w-md animate-pop">
      <div className="clay overflow-hidden">
        <div className="bg-success p-4 text-center font-display text-2xl font-bold text-primary-foreground">
          {score.toFixed(1)}% αντιστοίχιση 🎉
        </div>
        <div className="p-6 text-center">
          <img src={dog.photo_url || avatarSrc(dog.avatar)} alt={dog.name} className="mx-auto size-44 rounded-full border-8 border-muted bg-muted object-cover" />
          <h2 className="mt-4 text-4xl font-bold">Γεια, είμαι ο/η {dog.name}!</h2>
          <p className="text-muted-foreground">{dog.breed} · Διαβατήριο #{dog.fingerprint_id}</p>
          <p className="mt-3">Ευχαριστώ που με βρήκες. Ο άνθρωπός μου, <b>{dog.owner_name}</b>, με περιμένει.</p>
          {dog.medical_alerts && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-destructive/15 p-3 text-left text-destructive">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <p className="font-bold">Επείγον: {dog.medical_alerts}</p>
            </div>
          )}
          <div className="mt-6 grid gap-3">
            <a href={`tel:${tel}`} className="clay-btn flex items-center justify-center gap-2 bg-success py-4 text-lg text-primary-foreground">
              <Phone /> Κάλεσε τώρα τον κηδεμόνα
            </a>
            <a href={`sms:${tel}?body=${encodeURIComponent(`Γεια σας! Βρήκα τον/τη ${dog.name}. Είναι ασφαλής μαζί μου.`)}`} className="clay-btn flex items-center justify-center gap-2 bg-secondary py-4 text-lg text-secondary-foreground">
              <MessageSquare /> Αποστολή SMS
            </a>
          </div>
        </div>
      </div>
      <button onClick={onReset} className="mx-auto mt-6 flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <RotateCcw className="size-4" /> Σάρωση άλλου σκύλου
      </button>
    </div>
  );
}
