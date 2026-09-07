import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, Heart, Star } from "lucide-react";
import { PhoneShell, SectionLabel } from "@/components/PhoneShell";
import { useBarista } from "@/lib/barista-store";
import { REGULAR_MENU, SCOFFEY_MENU, formatIDR } from "@/lib/barista-data";
import {
  BASE_IMAGES,
  avatarUser,
  drinkCaramelNutty,
  drinkCinnamonCaramel,
  drinkImage,
  promoSummer,
} from "@/lib/barista-images";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Digital Barista by Scoffey" },
      {
        name: "description",
        content:
          "Pusat navigasi Digital Barista: mulai co-creation, lihat rekomendasi AI, kreasi terakhir, dan promo Scoffey.",
      },
      { property: "og:title", content: "Home — Digital Barista by Scoffey" },
      {
        property: "og:description",
        content: "Mulai berkreasi, lihat rekomendasi AI, kreasi terakhir, dan promo Scoffey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const RECOMMENDED = [
  { name: "Cinnamon Caramel Cloud", rating: 4.8, img: drinkCinnamonCaramel },
  { name: "Hazelnut Cream Latte", rating: 4.7, img: BASE_IMAGES.latte },
  { name: "Strawberry Espresso Fizz", rating: 4.6, img: BASE_IMAGES.espresso },
  { name: "Matcha Cloud", rating: 4.6, img: BASE_IMAGES.matcha },
];

function HomePage() {
  const { userName, orders, saved, selectMenuItem } = useBarista();
  const navigate = useNavigate();
  const lastName = orders[0]?.name ?? saved[0] ?? "Vanilla Sea Salt Latte";
  const lastPrice = orders[0]?.price;

  return (
    <PhoneShell nav>
      {/* Greeting */}
      <div className="flex items-start justify-between pt-2 md:items-center md:rounded-2xl md:border md:border-border md:bg-card/40 md:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={avatarUser}
            alt={`Foto profil ${userName}`}
            width={512}
            height={512}
            className="size-11 shrink-0 rounded-full border border-primary/40 object-cover md:size-14"
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-foreground md:text-2xl">
              {t("Hi")}, {userName}!
            </p>
            <p className="text-[0.84rem] leading-tight text-muted-foreground md:text-sm">
              {t("Ready to create your perfect coffee today?")}
            </p>
          </div>
        </div>
        <Bell className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
      </div>

      {/* Hero banner */}
      <div className="surface-wood shadow-gold relative mt-4 overflow-hidden rounded-2xl border border-primary/25 md:mt-6">
        <img
          src={drinkCinnamonCaramel}
          alt="Iced caramel latte Scoffey"
          width={768}
          height={768}
          className="absolute top-0 right-0 h-full w-2/5 object-cover opacity-90"
        />
        <div className="relative w-3/5 p-4 md:py-10 md:pl-8 lg:py-14 lg:pl-12">
          <h2 className="text-[0.95rem] leading-snug font-bold tracking-[0.04em] text-cream uppercase md:text-xl lg:text-3xl">
            {t("Create your drink")}
            <br />
            {t("with Digital Barista")}
          </h2>
          <p className="mt-2 text-[0.8rem] leading-tight text-cream/85 md:mt-3 md:text-sm">
            AI-Driven Beverage Co-Creation
          </p>
          <Link
            to="/create/base"
            className="surface-gold shadow-gold mt-3 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[0.82rem] md:mt-6 md:px-6 md:py-3 md:text-sm font-bold tracking-[0.08em] text-primary-foreground uppercase"
          >
            ☕ {t("Create Your Drink")}
          </Link>
        </div>
      </div>

      {/* Menu Reguler */}
      <section className="mt-5">
        <SectionLabel>{t("Menu Reguler")}</SectionLabel>
        <p className="mt-1 text-[0.8rem] text-muted-foreground">
          {t("Pesan langsung tanpa proses meracik — siap dibuat barista.")}
        </p>
        <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
          {t("Harga belum termasuk pajak 11% dan biaya layanan Rp2.000.")}
        </p>

        <div className="-mx-5 mt-2.5 flex gap-2.5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {REGULAR_MENU.map((m) => (
            <article
              key={m.id}
              className="flex w-[8.5rem] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card/60 md:w-auto md:rounded-2xl"
            >
              <img
                src={drinkImage(m.imageId)}
                alt={`Foto ${m.name}`}
                loading="lazy"
                width={768}
                height={768}
                className="aspect-square w-full object-cover md:h-32 lg:h-40"
              />
              <div className="flex flex-1 flex-col p-2.5 md:p-4">
                <p className="text-[0.84rem] leading-tight font-semibold text-foreground md:text-base">
                  {m.name}
                </p>
                <p className="mt-1 line-clamp-2 text-[0.72rem] leading-tight text-muted-foreground md:text-xs">
                  {t(m.desc)}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 md:mt-auto md:pt-3">
                  <span className="text-[0.8rem] font-semibold text-primary md:text-sm">
                    {formatIDR(m.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      selectMenuItem({ id: m.id, name: m.name, price: m.price });
                      navigate({ to: "/checkout" });
                    }}
                    className="surface-gold rounded-lg px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.08em] text-primary-foreground uppercase md:text-xs"
                  >
                    {t("Pesan")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Menu Scoffey */}
      <section className="mt-5">
        <SectionLabel>{t("Menu Scoffey")}</SectionLabel>
        <p className="mt-1 text-[0.8rem] text-muted-foreground">
          {t("Daftar minuman lengkap Scoffey — pilih favoritmu dan pesan langsung.")}
        </p>
        <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
          {t("Harga belum termasuk pajak 11% dan biaya layanan Rp2.000.")}
        </p>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
          {SCOFFEY_MENU.map((m) => (
            <article
              key={m.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/60"
            >
              <img
                src={drinkImage(m.imageId)}
                alt={`Foto ${m.name}`}
                loading="lazy"
                width={768}
                height={768}
                className="aspect-square w-full object-cover md:h-28 lg:h-32"
              />
              <div className="flex flex-1 flex-col p-2.5 md:p-3.5">
                <p className="text-[0.84rem] leading-tight font-semibold text-foreground md:text-base">
                  {m.name}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[0.72rem] leading-tight text-muted-foreground md:text-xs">
                  {t(m.desc)}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 md:mt-auto md:pt-2">
                  <span className="text-[0.8rem] font-semibold text-primary md:text-sm">
                    {formatIDR(m.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      selectMenuItem({ id: m.id, name: m.name, price: m.price });
                      navigate({ to: "/checkout" });
                    }}
                    className="surface-gold rounded-lg px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.08em] text-primary-foreground uppercase md:text-xs"
                  >
                    {t("Pesan")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section className="mt-5">
        <SectionLabel
          action={
            <Link to="/creations" className="flex items-center text-[0.8rem] text-primary">
              {t("Lihat semua")} <ChevronRight className="size-3" />
            </Link>
          }
        >
          {t("Recommended for you")}
        </SectionLabel>
        <div className="-mx-5 mt-2.5 flex gap-2.5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-5">
          {RECOMMENDED.map((r) => (
            <article
              key={r.name}
              className="flex w-[7.5rem] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card/60 transition-colors md:w-auto md:rounded-2xl md:hover:border-primary/50"
            >
              <img
                src={r.img}
                alt={`Foto ${r.name}`}
                loading="lazy"
                width={768}
                height={768}
                className="aspect-square w-full object-cover md:aspect-auto md:h-32 lg:h-40"
              />
              <div className="flex flex-1 flex-col p-2 md:p-4">
                <p className="text-[0.82rem] leading-tight font-medium text-foreground md:text-sm lg:text-base">
                  {r.name}
                </p>
                <div className="mt-1.5 flex items-center justify-between md:mt-auto md:pt-3">
                  <span className="flex items-center gap-1 text-[0.8rem] text-foreground">
                    <Star className="size-3 fill-primary text-primary" /> {r.rating}
                  </span>
                  <Heart className="size-3.5 text-muted-foreground" aria-hidden="true" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Last creations */}
      <div className="md:mt-6 md:grid md:grid-cols-2 md:items-start md:gap-6">
        <section className="mt-4 md:mt-0">
          <SectionLabel
            action={
              <Link to="/creations" className="flex items-center text-[0.8rem] text-primary">
                {t("Lihat semua")} <ChevronRight className="size-3" />
              </Link>
            }
          >
            {t("Your last creations")}
          </SectionLabel>
          <div className="mt-2.5 flex gap-3 rounded-xl border border-border bg-card/60 p-2.5">
            <img
              src={drinkCaramelNutty}
              alt={`Foto ${lastName}`}
              loading="lazy"
              width={768}
              height={768}
              className="size-[4.5rem] shrink-0 rounded-lg object-cover md:size-24"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[0.92rem] font-semibold text-foreground">{lastName}</p>
                <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[0.72rem] text-primary">
                  Iced
                </span>
              </div>
              <p className="mt-0.5 text-[0.78rem] text-muted-foreground">
                Dibuat 2 hari lalu • Rating 4.9
                {lastPrice ? ` • ${formatIDR(lastPrice)}` : ""}
              </p>
              <div className="mt-2 flex gap-2">
                <Link
                  to="/checkout"
                  className="surface-gold rounded-lg px-3 py-1.5 text-[0.76rem] font-bold tracking-[0.1em] text-primary-foreground uppercase"
                >
                  Reorder
                </Link>
                <Link
                  to="/create/recipe"
                  className="rounded-lg border border-border px-3 py-1.5 text-[0.76rem] font-bold tracking-[0.1em] text-foreground uppercase"
                >
                  Detail
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What's new */}
        <section className="mt-4 md:mt-0">
          <SectionLabel>{t("What's new")}</SectionLabel>
          <div className="relative mt-2.5 overflow-hidden rounded-xl border border-primary/30 bg-card/60">
            <span className="absolute top-0 left-0 z-10 rounded-br-lg bg-primary px-2 py-0.5 text-[0.68rem] font-bold text-primary-foreground">
              NEW
            </span>
            <img
              src={promoSummer}
              alt="Promo Summer Breeze Series"
              loading="lazy"
              width={1024}
              height={576}
              className="absolute top-0 right-0 h-full w-2/5 object-cover"
            />
            <div
              className="absolute inset-y-0 right-0 w-2/5 bg-gradient-to-r from-card/95 to-transparent"
              aria-hidden="true"
            />
            <div className="relative w-3/5 p-3 pt-4 md:p-5 md:pt-6">
              <p className="text-[0.92rem] font-semibold text-foreground md:text-base">
                Summer Breeze Series
              </p>
              <p className="mt-1 text-[0.76rem] leading-snug text-muted-foreground md:text-xs">
                {t("Rasakan kesegaran buah-buahan pilihan dalam racikan kopi spesial Scoffey.")}
              </p>

              <Link
                to="/community"
                className="surface-gold mt-2 inline-block rounded-lg px-3 py-1.5 text-[0.73rem] font-bold tracking-[0.1em] text-primary-foreground uppercase"
              >
                {t("Lihat Promo")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PhoneShell>
  );
}
