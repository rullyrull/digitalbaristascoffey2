import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, User } from "lucide-react";
import { BaristaLogo, GoldButton, PhoneFrame } from "@/components/PhoneShell";
import { heroDrink } from "@/lib/barista-images";
import { LanguageToggle } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { FitScale } from "@/components/FitScale";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital Barista by Scoffey — Create Your Coffee. Your Way." },
      {
        name: "description",
        content:
          "Digital Barista by Scoffey: co-creation minuman berbasis AI. Pilih base, rasa, dan bahan — dapatkan resep personal yang seimbang.",
      },
      { property: "og:title", content: "Digital Barista by Scoffey" },
      {
        property: "og:description",
        content: "AI-driven beverage co-creation. Create Your Coffee. Your Way.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  return (
    <PhoneFrame>
      <>
        <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-primary/10 blur-3xl" />
        <FitScale>
        <div className="animate-rise relative mx-auto flex w-full max-w-xl flex-col items-center pt-8 text-center sm:pt-10">
          <div className="mb-4 flex w-full justify-end px-6">
            <LanguageToggle />
          </div>
          <BaristaLogo size="lg" />

          <h2 className="mt-8 px-6 text-[1.7rem] leading-snug font-medium text-foreground">
            Create Your Coffee.
            <span className="block">Your Way.</span>
          </h2>
          <p className="label-caps mt-3 px-6 text-primary">AI-Driven Beverage Co-Creation</p>

          {/* Hero menyatu: gambar full-bleed, tepi memudar ke navy + ring emas putus-putus seperti di PDF */}
          <div className="relative mt-2 w-full">
            <div
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 size-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/25"
            />
            <img
              src={heroDrink}
              alt="Iced caramel latte premium Scoffey di atas meja kayu gelap"
              width={1024}
              height={1280}
              className="mask-hero relative mx-auto h-[400px] w-full object-cover"
            />
          </div>

          {/* Indikator carousel (3 titik) seperti di PDF */}
          <div className="mt-1 flex items-center gap-2" aria-hidden>
            <span className="size-2 rounded-full bg-foreground" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
          </div>

          <div className="mt-6 w-full space-y-3 px-6">
            <Link to="/create/base" className="block">
              <GoldButton>
                <span className="inline-flex items-center justify-center gap-2">
                  <Coffee className="size-4" />
                  {t("Mulai Berkreasi")}
                </span>
              </GoldButton>
            </Link>
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 rounded-2xl border border-primary/60 px-6 py-3.5 text-sm font-semibold tracking-[0.12em] text-primary uppercase transition-colors hover:bg-accent"
            >
              <User className="size-4" />
              {t("Masuk / Daftar")}
            </Link>
          </div>

          <div className="pb-6" />

        </div>
        </FitScale>
        <div className="relative flex shrink-0 justify-center pb-2">
          <span className="h-1 w-32 rounded-full bg-foreground/70" />
        </div>
      </>
    </PhoneFrame>
  );
}
