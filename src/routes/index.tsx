import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanFace, Fingerprint, PiggyBank, Syringe, Wallet, Users } from "lucide-react";
import { AVATARS } from "@/lib/dogs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My.Skilitsa.com — Σάρωσε έναν χαμένο σκύλο και βρες την οικογένειά του" },
      { name: "description", content: "Βιομετρικά διαβατήρια σκύλων, δημόσια σάρωση από κινητό και εργαλεία καθημερινής φροντίδας." },
      { property: "og:title", content: "My.Skilitsa.com — Βιομετρικό μητρώο σκύλων" },
      { property: "og:description", content: "Κάθε κινητό γίνεται σαρωτής προσώπου σκύλων. Χωρίς ειδικό μηχάνημα, κλινική ή λογαριασμό." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: Fingerprint, title: "Βιομετρικό αποτύπωμα 896-d", text: "Τρίχωμα, σχήμα κρανίου και χαρακτηριστικά προσώπου σε ένα ψηφιακό διαβατήριο." },
  { icon: PiggyBank, title: "Έλεγχος εξόδων", text: "Τροφή, κτηνίατρος και περιποίηση με πράσινες, πορτοκαλί και κόκκινες ενδείξεις." },
  { icon: Syringe, title: "Ιστορικό υγείας", text: "Λύσσα, DHPP, Bordetella, λεπτοσπείρωση και μηνιαίες υπενθυμίσεις προστασίας." },
  { icon: Wallet, title: "Κάρτες επιβράβευσης", text: "Barcode και QR κάρτες, μαζί με αντίστροφη μέτρηση για την τροφή." },
  { icon: Users, title: "Η παρέα μας", text: "Skilitsa.com, συναντήσεις στο πάρκο και δίκτυα διάσωσης." },
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
             Κάθε κινητό γίνεται <span className="text-primary">σαρωτής προσώπου σκύλου</span>.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
             Τα microchip χρειάζονται ειδικό σαρωτή. Τα πρόσωπα όχι. Βρήκες σκύλο στο πάρκο; Σάρωσέ τον και κάλεσε αμέσως την οικογένειά του — χωρίς λογαριασμό.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/scan" className="clay-btn flex items-center gap-2 bg-primary px-6 py-3 text-lg text-primary-foreground">
               <ScanFace /> Σάρωση χαμένου σκύλου
            </Link>
            <Link to="/dashboard" className="clay-btn bg-primary px-6 py-3 text-lg text-primary-foreground">
               Εγγραφή του σκύλου μου
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
           ["1", "Φωτογραφία", "Ο κηδεμόνας φωτογραφίζει το πρόσωπο του σκύλου."],
           ["2", "Αποτύπωμα", "Τα διανύσματα DINO-v2 (384) και DogFace (512) ενώνονται και κανονικοποιούνται."],
           ["3", "Επανένωση", "Ο άνθρωπος που τον βρήκε σαρώνει, γίνεται η αντιστοίχιση και καλεί τον κηδεμόνα."],
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
         <h2 className="mb-6 text-3xl font-bold">Όλη η καθημερινή φροντίδα σε ένα μέρος</h2>
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
