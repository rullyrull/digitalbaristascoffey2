import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Download, MessageCircle } from "lucide-react";
import { GoldButton, InfoCard, PhoneShell, ProgressDots } from "@/components/PhoneShell";
import {
  BASES,
  DEFAULT_BASE,
  INGREDIENTS,
  REGULAR_MENU,
  formatIDR,
} from "@/lib/barista-data";
import { heroDrink, qrisCode } from "@/lib/barista-images";
import { useBarista, type Order, type OrderLine } from "@/lib/barista-store";
import { downloadReceipt, sendReceiptViaWhatsApp } from "@/lib/receipt";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Order Summary & Checkout — Digital Barista by Scoffey" },
      {
        name: "description",
        content:
          "Konfirmasi racikanmu: opsi dine-in atau takeaway, metode pembayaran QRIS/e-wallet/tunai, tip barista, dan nota PDF via WhatsApp.",
      },
      { property: "og:title", content: "Order Summary & Checkout — Digital Barista" },
      {
        property: "og:description",
        content: "Ringkasan pesanan yang jelas sebelum diproses oleh barista Scoffey.",
      },
    ],
  }),
  component: CheckoutPage,
});

const OPTIONS = ["Dine In", "Takeaway"];

const PAYMENTS = [
  { id: "QRIS", label: "QRIS", hint: "Scan sekali, semua aplikasi bisa" },
  { id: "E-Wallet", label: "E-Wallet", hint: "DANA atau GoPay" },
  { id: "Tunai di Kasir", label: "Tunai di Kasir", hint: "Bayar langsung ke barista" },
];

const EWALLETS = [
  { id: "DANA", emoji: "💙" },
  { id: "GoPay", emoji: "💚" },
];

const TIPS = [0, 2000, 5000, 10000];

function CheckoutPage() {
  const { recipe, placeOrder, baseId, ingredients, menuItem } = useBarista();
  const [option, setOption] = useState(OPTIONS[0]!);
  const [payment, setPayment] = useState(PAYMENTS[0]!.id);
  const [ewallet, setEwallet] = useState(EWALLETS[0]!.id);
  const [note, setNote] = useState("");
  const [tip, setTip] = useState(0);
  const [phone, setPhone] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [paid, setPaid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const regular = menuItem ? REGULAR_MENU.find((m) => m.id === menuItem.id) : undefined;
  const base = BASES.find((b) => b.id === baseId) ?? DEFAULT_BASE;
  const chosen = INGREDIENTS.filter((i) => ingredients.includes(i.id));

  const itemName = regular ? regular.name : recipe.name;
  const itemTagline = regular ? regular.desc : recipe.tagline;
  const subtotal = regular ? regular.price : recipe.price;

  const lines: OrderLine[] = regular
    ? [{ name: regular.name, amount: "1 gelas (regular)", price: regular.price }]
    : [
        { name: `${t(base.name)} (base)`, amount: base.amount, price: base.price },
        ...chosen.map((c) => ({ name: c.name, amount: c.amount, price: c.price })),
      ];

  const tax = Math.round(subtotal * 0.11);
  const service = 2000;
  const total = subtotal + tax + service + tip;

  const paymentLabel = payment === "E-Wallet" ? `E-Wallet · ${ewallet}` : payment;

  if (placed && !paid) {
    const cash = placed.payment.startsWith("Tunai");
    return (
      <PhoneShell step={t("Halaman 10")} title={t("MENUNGGU PEMBAYARAN")}>
        <div className="mx-auto flex max-w-xl flex-col items-center py-8 text-center md:py-12">
          <p className="text-sm text-muted-foreground">
            {t("Pesanan")} <span className="text-primary">#{placed.id}</span> · {placed.name}
          </p>
          <p className="display-title mt-2 text-3xl font-bold text-primary">
            {formatIDR(placed.total)}
          </p>
          <p className="mt-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">
            {t(placed.payment)}
          </p>

          {placed.payment === "QRIS" && (
            <img
              src={qrisCode}
              alt="Kode QRIS pembayaran Scoffey"
              width={512}
              height={512}
              className="mt-5 size-52 rounded-2xl border border-border bg-background object-contain p-2"
            />
          )}

          <p className="mt-5 max-w-sm text-sm text-muted-foreground">
            {cash
              ? t("Bayar ke barista di kasir, lalu tekan tombol di bawah untuk melihat struk.")
              : t("Selesaikan pembayaran, lalu tekan tombol di bawah. Struk keluar setelah pembayaran berhasil.")}
          </p>

          <div className="mt-6 w-full">
            <GoldButton
              disabled={verifying}
              onClick={() => {
                setVerifying(true);
                setTimeout(() => {
                  setVerifying(false);
                  setPaid(true);
                }, 1600);
              }}
            >
              {verifying ? t("Memeriksa pembayaran…") : t("Saya sudah bayar")}
            </GoldButton>
          </div>
        </div>
      </PhoneShell>
    );
  }

  if (placed) {
    return (
      <PhoneShell step={t("Halaman 10")} title={t("PESANAN DITERIMA")}>
        <div className="mx-auto flex max-w-xl flex-col items-center py-8 text-center md:py-16">
          <CheckCircle2 className="size-16 text-primary" />
          <h3 className="display-title mt-4 text-2xl font-bold text-foreground">
            {t("Barista sedang meracik")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Pesanan")} <span className="text-primary">#{placed.id}</span> · {placed.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(placed.option)} · {placed.payment} · {formatIDR(placed.total)}
          </p>

          <section className="mt-6 w-full rounded-2xl border border-border bg-card/60 p-4 text-left">
            <h4 className="label-caps text-primary">{t("Nota pembelian")}</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              {t(
                "Unduh nota dalam bentuk PDF, atau kirim ringkasannya lewat WhatsApp lalu lampirkan file PDF-nya.",
              )}
            </p>
            <label className="mt-3 flex items-center gap-3 rounded-2xl border border-input bg-background/40 px-4 py-3">
              <span className="text-xs text-muted-foreground">+62</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                placeholder={t("Nomor WhatsApp (opsional)")}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => downloadReceipt(placed)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-primary/60 py-3 text-xs font-semibold tracking-[0.1em] text-primary uppercase"
              >
                <Download className="size-4" /> {t("Nota PDF")}
              </button>
              <button
                type="button"
                onClick={() =>
                  sendReceiptViaWhatsApp(placed, phone ? `62${phone.replace(/^0+/, "")}` : "")
                }
                className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-xs font-semibold tracking-[0.1em] text-foreground uppercase"
              >
                <MessageCircle className="size-4" /> {t("Kirim via WA")}
              </button>
            </div>
          </section>

          <div className="mt-6 w-full">
            <Link to="/home" className="block">
              <GoldButton>{t("Kembali ke Home")}</GoldButton>
            </Link>
          </div>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell step={t("Halaman 10")} title={t("ORDER SUMMARY")} back="/create/recipe">
      <ProgressDots current={7} />
      <p className="mt-3 text-sm text-muted-foreground">
        {t(
          "Konfirmasi detail pesananmu sebelum diproses oleh barista. Pastikan semua sudah sesuai seleramu.",
        )}
      </p>

      <div className="md:mt-2 md:grid md:grid-cols-[1.4fr_1fr] md:items-start md:gap-8">
        <div>
          <section className="mt-5 rounded-2xl border border-primary/40 bg-card/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{itemName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{itemTagline}</p>
              </div>
              <img
                src={heroDrink}
                alt="Visual racikan pesanan"
                loading="lazy"
                width={1024}
                height={1280}
                className="size-12 rounded-xl border border-primary/30 object-cover"
              />
            </div>
            {regular ? (
              <p className="mt-3 text-xs text-primary">{t("Menu Reguler")}</p>
            ) : (
              <p className="mt-3 text-xs text-primary">AI Match Score {recipe.matchScore}%</p>
            )}
            <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
              {lines.map((l) => (
                <li key={l.name} className="flex justify-between gap-3">
                  <span>
                    {t(l.name)} · <span className="text-foreground">{t(l.amount)}</span>
                  </span>
                  <span>{formatIDR(l.price)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-4">
            <h3 className="label-caps text-primary">{t("Opsi pesanan")}</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 md:gap-3">
              {OPTIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOption(o)}
                  className={`rounded-2xl border py-3 text-xs font-semibold uppercase transition-all ${
                    option === o
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card/60 text-muted-foreground"
                  }`}
                >
                  {t(o)}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <h3 className="label-caps text-primary">{t("Metode pembayaran")}</h3>
            <div className="mt-2 space-y-2">
              {PAYMENTS.map((p) => (
                <div key={p.id}>
                  <button
                    type="button"
                    onClick={() => setPayment(p.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all ${
                      payment === p.id
                        ? "border-primary bg-accent text-foreground"
                        : "border-border bg-card/60 text-muted-foreground"
                    }`}
                  >
                    <span className="text-left">
                      {t(p.label)}
                      <span className="block text-[0.7rem] text-muted-foreground">{t(p.hint)}</span>
                    </span>
                    <span
                      className={`size-3.5 shrink-0 rounded-full border ${
                        payment === p.id ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    />
                  </button>

                  {p.id === "QRIS" && payment === "QRIS" && (
                    <div className="mt-2 flex flex-col items-center rounded-2xl border border-primary/40 bg-card/60 p-4">
                      <img
                        src={qrisCode}
                        alt="Kode QRIS pembayaran Scoffey"
                        loading="lazy"
                        width={768}
                        height={768}
                        className="w-40 rounded-xl border border-primary/30 object-cover"
                      />
                      <p className="mt-3 text-center text-xs text-muted-foreground">
                        {t("Scan kode QRIS ini dengan aplikasi bank atau e-wallet apa pun.")}
                      </p>
                      <p className="mt-1 text-center text-sm font-semibold text-primary">
                        {formatIDR(total)}
                      </p>
                    </div>
                  )}

                  {p.id === "E-Wallet" && payment === "E-Wallet" && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {EWALLETS.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setEwallet(w.id)}
                          className={`rounded-2xl border px-4 py-3 text-sm transition-all ${
                            ewallet === w.id
                              ? "border-primary bg-accent text-foreground"
                              : "border-border bg-card/60 text-muted-foreground"
                          }`}
                        >
                          <span className="mr-2">{w.emoji}</span>
                          {w.id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <h3 className="label-caps text-primary">{t("Pesan Manis untuk Barista")}</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={t("Contoh: semangat terus ya, kopimu selalu bikin hari lebih baik!")}
              className="mt-2 w-full rounded-2xl border border-input bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </section>

          <section className="mt-4">
            <h3 className="label-caps text-primary">{t("Tip untuk Barista")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("Tip ditambahkan ke total pembayaran dan dicatat terpisah untuk barista.")}
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {TIPS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTip(amount)}
                  className={`rounded-2xl border py-3 text-xs font-semibold transition-all ${
                    tip === amount
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card/60 text-muted-foreground"
                  }`}
                >
                  {amount === 0 ? t("Tanpa tip") : `${amount / 1000}k`}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="md:sticky md:top-6">
          <section className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm md:mt-0">
            <h3 className="label-caps text-primary">{t("Ringkasan harga")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("Harga menu belum termasuk pajak 11% dan biaya layanan Rp2.000.")}
            </p>
            <dl className="mt-3 space-y-2 text-muted-foreground">

              <div className="flex justify-between">
                <dt>{t("Subtotal racikan")}</dt>
                <dd className="text-foreground">{formatIDR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("Pajak (11%)")}</dt>
                <dd className="text-foreground">{formatIDR(tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("Biaya layanan")}</dt>
                <dd className="text-foreground">{formatIDR(service)}</dd>
              </div>
              {tip > 0 && (
                <div className="flex justify-between">
                  <dt>{t("Tip untuk Barista")}</dt>
                  <dd className="text-foreground">{formatIDR(tip)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="label-caps text-foreground">{t("Total")}</dt>
                <dd className="display-title text-xl font-bold text-primary">{formatIDR(total)}</dd>
              </div>
            </dl>
          </section>

          <div className="mt-4">
            <InfoCard title={t("Transparan")}>
              {t("Tanpa biaya tersembunyi. Kamu tahu persis apa yang kamu bayar.")}
            </InfoCard>
          </div>

          <div className="mt-5">
            <GoldButton
              onClick={() => {
                const order = placeOrder({
                  name: itemName,
                  price: subtotal,
                  tax,
                  service,
                  tip,
                  matchScore: regular ? 0 : recipe.matchScore,
                  payment: paymentLabel,
                  option,
                  note,
                  kind: regular ? "regular" : "signature",
                  lines,
                });
                setPlaced(order);
                navigate({ to: "/checkout" });
              }}
            >
              {t("Konfirmasi Pesanan")}
            </GoldButton>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
