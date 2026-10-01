import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanFace, Fingerprint, PiggyBank, Syringe, Wallet, Users } from "lucide-react";
import { AVATARS } from "@/lib/dogs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkilitsaID — Scan a lost dog's face, reunite them instantly" },
      { name: "description", content: "Biometric dog passports and a public phone scanner that reunites lost dogs with their parents, plus everyday care tools." },
      { property: "og:title", content: "SkilitsaID — Biometric Dog Registry" },
      { property: "og:description", content: "Any phone becomes a dog face scanner. No wand, no clinic, no account needed to help." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: Fingerprint, title: "896-d fingerprint", text: "Coat, skull and facial landmark geometry fused into one biometric passport." },
  { icon: PiggyBank, title: "Budget tracker", text: "Food, vet and grooming spend with green, amber and red alerts." },
  { icon: Syringe, title: "Health timeline", text: "Rabies, DHPP, Bordetella, Lepto and monthly flea/tick reminders." },
  { icon: Wallet, title: "Loyalty wallet", text: "Barcodes and QR cards plus kibble refill countdowns." },
  { icon: Users, title: "Community", text: "Skilitsa.com, weekend park playdates and rescue networks." },
];

function Index() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
            σκυλίτσα · little dog, big safety net
          </span>
          <h1 className="mt-4 text-5xl font-bold leading-tight md:text-6xl">
            Every phone is now a <span className="text-primary">dog face scanner</span>.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Microchips need a wand. Faces don't. Found a dog in the park? Scan their face and call their parent on the spot — no account needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/scan" className="clay-btn flex items-center gap-2 bg-destructive px-6 py-3 text-lg text-destructive-foreground">
              <ScanFace /> Scan Lost Dog
            </Link>
            <Link to="/dashboard" className="clay-btn bg-primary px-6 py-3 text-lg text-primary-foreground">
              Register my dog
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(AVATARS).map(([k, a], i) => (
            <div key={k} className={`clay animate-floaty p-3 ${i % 2 ? "mt-10" : ""}`} style={{ animationDelay: `${-i * 1.5}s` }}>
              <img src={a.src} alt={a.breed} width={816} height={816} className="aspect-square w-full rounded-2xl bg-muted object-cover" />
              <p className="mt-2 text-center font-display font-semibold">{a.breed}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="clay grid gap-6 p-8 md:grid-cols-3">
        {[
          ["1", "Snap", "Owner photographs their dog's face."],
          ["2", "Fingerprint", "DINO-v2 (384) + DogFace (512) vectors fused & normalized."],
          ["3", "Reunite", "Finder scans, cosine match fires, owner gets the call."],
        ].map(([n, t, d]) => (
          <div key={n} className="flex gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary font-display text-xl font-bold text-primary-foreground">{n}</div>
            <div>
              <h3 className="text-xl font-bold">{t}</h3>
              <p className="text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-6 text-3xl font-bold">Your everyday care hub</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="clay p-5">
              <f.icon className="size-8 text-primary" />
              <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
