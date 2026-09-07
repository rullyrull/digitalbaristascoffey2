import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Coffee, RefreshCw, Timer } from "lucide-react";
import { PhoneShell, SectionLabel } from "@/components/PhoneShell";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/barista-data";
import { useBarista } from "@/lib/barista-store";
import { getLang, t } from "@/lib/i18n";

export const Route = createFileRoute("/barista")({
  head: () => ({
    meta: [
      { title: "Panel Barista — Antrian Pesanan | Digital Barista by Scoffey" },
      {
        name: "description",
        content:
          "Panel kerja barista Scoffey: antrian pesanan masuk, takaran bahan, pesan manis pelanggan, dan status penyajian.",
      },
      { property: "og:title", content: "Panel Barista — Antrian Pesanan" },
      {
        property: "og:description",
        content: "Kelola antrian pesanan: baru, diproses, dan selesai disajikan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BaristaPanel,
});

type Row = {
  id: string;
  code: string;
  customer: string;
  name: string;
  total: number;
  tip: number;
  payment: string;
  option: string;
  note: string;
  status: string;
  lines: unknown;
  created_at: string;
};

type Line = { label?: string; name?: string; amount?: string; value?: string };

const STATUSES = ["baru", "diproses", "selesai"] as const;
type Status = (typeof STATUSES)[number];

function BaristaPanel() {
  const { isBarista, isAdmin, authReady } = useBarista();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Status>("baru");

  const load = useCallback(() => {
    setLoading(true);
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else {
          setError(null);
          setRows((data ?? []) as unknown as Row[]);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isBarista) load();
  }, [isBarista, load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { baru: 0, diproses: 0, selesai: 0 };
    rows.forEach((r) => (c[r.status] = (c[r.status] ?? 0) + 1));
    return c;
  }, [rows]);

  const list = rows.filter((r) => (r.status || "baru") === tab);
  const locale = getLang() === "id" ? "id-ID" : "en-US";

  async function setStatus(id: string, status: Status) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error: err } = await supabase.from("orders").update({ status }).eq("id", id);
    if (err) {
      setError(err.message);
      load();
    }
  }

  if (!authReady) {
    return (
      <PhoneShell title={t("Panel Barista")} back="/profile">
        <p className="mt-4 text-sm text-muted-foreground">{t("Memuat…")}</p>
      </PhoneShell>
    );
  }

  if (!isBarista) {
    return (
      <PhoneShell title={t("Panel Barista")} back="/profile">
        <p className="mt-4 text-sm text-muted-foreground">
          {t("Halaman ini khusus untuk barista dan admin Scoffey.")}
        </p>
        <Link
          to="/auth"
          className="mt-4 inline-flex rounded-2xl border border-primary/60 px-4 py-2.5 text-sm font-semibold text-primary"
        >
          {t("Masuk sebagai staf")}
        </Link>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell title={t("Panel Barista")} back="/profile">
      <SectionLabel
        action={
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[0.68rem] uppercase text-muted-foreground"
          >
            <RefreshCw className="size-3" /> {t("Muat ulang")}
          </button>
        }
      >
        {t("Antrian pesanan")}
      </SectionLabel>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div className="mt-3 grid grid-cols-3 gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTab(s)}
            className={`rounded-2xl border px-2 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${
              tab === s
                ? "border-primary/60 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {s === "baru" ? t("Baru") : s === "diproses" ? t("Diproses") : t("Selesai")} ·{" "}
            {counts[s] ?? 0}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("Memuat…")}</p>
      ) : list.length ? (
        <ul className="mt-4 space-y-3">
          {list.map((o) => {
            const lines = Array.isArray(o.lines) ? (o.lines as Line[]) : [];
            return (
              <li key={o.id} className="rounded-2xl border border-border bg-card/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{o.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      #{o.code} · {o.customer} · {o.option} · {o.payment}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString(locale)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-primary">{formatIDR(o.total)}</p>
                </div>

                {lines.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    {lines.map((l, i) => (
                      <li key={i} className="flex justify-between gap-3">
                        <span>{l.label ?? l.name}</span>
                        <span className="text-foreground">{l.amount ?? l.value}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {o.note?.trim() && (
                  <p className="mt-3 rounded-xl border border-primary/30 bg-accent/30 px-3 py-2 text-xs text-foreground">
                    “{o.note}”{o.tip > 0 ? ` · ${t("tip")} ${formatIDR(o.tip)}` : ""}
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  {o.status !== "diproses" && (
                    <button
                      type="button"
                      onClick={() => void setStatus(o.id, "diproses")}
                      className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      <Timer className="size-3" /> {t("Proses")}
                    </button>
                  )}
                  {o.status !== "selesai" && (
                    <button
                      type="button"
                      onClick={() => void setStatus(o.id, "selesai")}
                      className="inline-flex items-center gap-1 rounded-xl border border-primary/60 px-3 py-1.5 text-xs font-semibold text-primary"
                    >
                      <CheckCircle2 className="size-3" /> {t("Selesai")}
                    </button>
                  )}
                  {o.status === "selesai" && (
                    <button
                      type="button"
                      onClick={() => void setStatus(o.id, "baru")}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {t("Buka lagi")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Coffee className="size-4" /> {t("Tidak ada pesanan pada status ini.")}
        </p>
      )}

      {isAdmin && (
        <div className="mt-6">
          <Link
            to="/admin"
            className="flex items-center justify-center rounded-2xl border border-border py-3.5 text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            {t("Laporan transaksi")}
          </Link>
        </div>
      )}
    </PhoneShell>
  );
}
