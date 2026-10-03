import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Trees, HeartHandshake, Home } from "lucide-react";
import { PageTitle } from "@/components/Shell";
import { avatarSrc } from "@/lib/dogs";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({ meta: [{ title: "Παρέα και συναντήσεις — My.Skilitsa.com" }, { name: "description", content: "Η κοινότητα του Skilitsa.com, συναντήσεις στο πάρκο και δίκτυα διάσωσης." }, { property: "og:title", content: "Παρέα και συναντήσεις — My.Skilitsa.com" }, { property: "og:description", content: "Η κοινότητα του Skilitsa.com, συναντήσεις στο πάρκο και δίκτυα διάσωσης." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Community,
});

const LINKS = [
  { icon: Home, title: "Η κοινότητα του Skilitsa.com", text: "Το στέκι των ανθρώπων που αγαπούν τους σκύλους — ιστορίες, συμβουλές και εκδηλώσεις.", href: "https://skilitsa.com", tone: "bg-primary text-primary-foreground", av: "golden" },
  { icon: Trees, title: "Συναντήσεις στο πάρκο", text: "Βρες παρέες της γειτονιάς που συναντιούνται τα πρωινά του Σαββατοκύριακου.", href: "https://skilitsa.com", tone: "bg-secondary text-secondary-foreground", av: "beagle" },
  { icon: HeartHandshake, title: "Δίκτυα διάσωσης", text: "Φιλοξένησε, υιοθέτησε ή βοήθησε εθελοντικά τοπικά καταφύγια και ομάδες διάσωσης.", href: "https://skilitsa.com", tone: "bg-accent text-accent-foreground", av: "collie" },
];

function Community() {
  return (
    <div>
       <PageTitle title="Η σκυλοπαρέα" sub="Γιατί κάθε σκύλος αξίζει τη δική του αγέλη." />
      <div className="grid gap-6 md:grid-cols-3">
        {LINKS.map((l) => (
          <a key={l.title} href={l.href} target="_blank" rel="noreferrer" className="clay group overflow-hidden transition hover:-translate-y-1">
            <div className={`relative h-36 ${l.tone}`}>
              <l.icon className="absolute left-5 top-5 size-10" />
              <img src={avatarSrc(l.av)} alt="" className="absolute -bottom-2 right-2 size-32 transition group-hover:scale-110" />
            </div>
            <div className="p-5">
              <h3 className="flex items-center gap-2 text-xl font-bold">{l.title} <ExternalLink className="size-4" /></h3>
              <p className="mt-1 text-muted-foreground">{l.text}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
