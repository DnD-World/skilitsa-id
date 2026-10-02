import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { Trash2, Package } from "lucide-react";
import { PageTitle, inputCls } from "@/components/Shell";
import { daysBetween, today, useDelete, useInsert, useRows } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Κάρτες και ανανέωση τροφής — SkilitsaID" }, { name: "description", content: "Κάρτες επιβράβευσης και υπενθυμίσεις ανανέωσης τροφής." }, { property: "og:title", content: "Κάρτες και ανανέωση τροφής — SkilitsaID" }, { property: "og:description", content: "Κάρτες επιβράβευσης και υπενθυμίσεις ανανέωσης τροφής." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: WalletPage,
});

type Card = { id: string; business: string; code: string; format: string };
type Bag = { id: string; brand: string; bag_kg: number; days_lasting: number; opened_on: string };

function WalletPage() {
  return (
    <div>
      <PageTitle title="Πορτοφόλι και τροφή" sub="Κάρτες επιβράβευσης για σάρωση και αυτόματες ειδοποιήσεις τροφής." />
      <Refills />
      <Cards />
    </div>
  );
}

function Refills() {
  const { data: bags = [] } = useRows<Bag>("food_bags");
  const ins = useInsert("food_bags");
  const del = useDelete("food_bags");
  const [f, setF] = useState({ brand: "", bag_kg: "17", days_lasting: "28", opened_on: new Date().toISOString().slice(0, 10) });
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-2xl font-bold">Ανανέωση τροφής</h2>
      <form
        onSubmit={(e) => { e.preventDefault(); ins.mutate({ ...f, bag_kg: Number(f.bag_kg), days_lasting: Number(f.days_lasting) }, { onSuccess: () => setF({ ...f, brand: "" }) }); }}
        className="clay mb-4 grid gap-3 p-5 md:grid-cols-5"
      >
        <input className={inputCls} required placeholder="Μάρκα" value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} />
        <input className={inputCls} required type="number" step="0.1" min="0.1" placeholder="Κιλά σακούλας" value={f.bag_kg} onChange={(e) => setF({ ...f, bag_kg: e.target.value })} />
        <input className={inputCls} required type="number" min="1" placeholder="Διάρκεια (ημέρες)" value={f.days_lasting} onChange={(e) => setF({ ...f, days_lasting: e.target.value })} />
        <input className={inputCls} type="date" value={f.opened_on} onChange={(e) => setF({ ...f, opened_on: e.target.value })} />
        <button className="clay-btn bg-primary py-2 text-primary-foreground">Παρακολούθηση σακούλας</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {bags.map((b) => {
          const elapsed = daysBetween(new Date(b.opened_on), today());
          const alertDay = Math.max(b.days_lasting - 4, 0);
          const left = b.days_lasting - elapsed;
          const pctLeft = Math.max(0, Math.min(100, (left / b.days_lasting) * 100));
          const alert = elapsed >= alertDay;
          const perDay = ((b.bag_kg * 1000) / b.days_lasting).toFixed(0);
          return (
            <div key={b.id} className="clay p-5">
              <div className="flex items-center gap-3">
                <Package className="size-8 text-primary" />
                <div className="flex-1">
                  <p className="font-bold">{b.brand} · {b.bag_kg}kg</p>
                  <p className="text-xs text-muted-foreground">~{perDay} γρ./ημέρα · ειδοποίηση την ημέρα {alertDay}</p>
                </div>
                <button aria-label="Διαγραφή" onClick={() => del.mutate(b.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-muted">
                <div className={`h-full ${alert ? "bg-destructive" : "bg-success"}`} style={{ width: `${pctLeft}%` }} />
              </div>
              <p className={`mt-2 text-sm font-bold ${alert ? "text-destructive" : ""}`}>
                {left <= 0 ? "Άδεια — ώρα για νέα σακούλα!" : alert ? `⚠️ Παράγγειλε τώρα — απομένουν ${left} ημέρες` : `Ημέρα ${elapsed} από ${b.days_lasting} · απομένουν ${left} ημέρες`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Cards() {
  const { data: cards = [] } = useRows<Card>("loyalty_cards");
  const ins = useInsert("loyalty_cards");
  const del = useDelete("loyalty_cards");
  const [f, setF] = useState({ business: "", code: "", format: "CODE128" });
  return (
    <section>
      <h2 className="mb-3 text-2xl font-bold">Κάρτες επιβράβευσης</h2>
      <form onSubmit={(e) => { e.preventDefault(); ins.mutate(f, { onSuccess: () => setF({ ...f, business: "", code: "" }) }); }} className="clay mb-4 grid gap-3 p-5 md:grid-cols-4">
        <input className={inputCls} required placeholder="Κατάστημα, κτηνιατρείο ή κομμωτήριο" value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} />
        <input className={inputCls} required placeholder="Αριθμός κάρτας" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
        <select className={inputCls} value={f.format} onChange={(e) => setF({ ...f, format: e.target.value })}>
          <option value="CODE128">Barcode (CODE128)</option>
          <option value="QR">Κωδικός QR</option>
        </select>
        <button className="clay-btn bg-primary py-2 text-primary-foreground">Προσθήκη κάρτας</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <div key={c.id} className={`clay overflow-hidden ${["bg-primary", "bg-secondary", "bg-accent"][i % 3]}`}>
            <div className="flex items-center justify-between px-5 py-3">
              <p className="font-display text-xl font-bold">{c.business}</p>
              <button aria-label="Διαγραφή" onClick={() => del.mutate(c.id)} className="opacity-70 hover:opacity-100"><Trash2 className="size-4" /></button>
            </div>
            <div className="m-3 grid place-items-center rounded-2xl bg-card p-3">
              {c.format === "QR" ? <QRCodeSVG value={c.code} size={140} /> : <Barcode value={c.code} height={70} width={1.6} fontSize={14} background="transparent" lineColor="currentColor" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
