import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  base: z.string(),
  baseDesc: z.string(),
  taste: z.record(z.string()),
  ingredients: z.array(z.string()),
  adjust: z.object({
    sweet: z.number(),
    strength: z.number(),
    milk: z.number(),
    ice: z.number(),
  }),
  seed: z.number().optional(),
  lang: z.enum(["en", "id"]).optional(),
});

export type AiVariant = {
  name: string;
  style: string;
  tagline: string;
  note: string;
  matchScore: number;
  compatibility: number;
  profile: { label: string; value: number }[];
  steps: string[];
  flavorNotes: string[];
};

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["variants"],
  properties: {
    variants: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "style",
          "tagline",
          "note",
          "matchScore",
          "compatibility",
          "profile",
          "steps",
          "flavorNotes",
        ],
        properties: {
          name: { type: "string" },
          style: { type: "string" },
          tagline: { type: "string" },
          note: { type: "string" },
          matchScore: { type: "integer" },
          compatibility: { type: "integer" },
          profile: {
            type: "array",
            minItems: 5,
            maxItems: 5,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "value"],
              properties: {
                label: { type: "string" },
                value: { type: "integer" },
              },
            },
          },
          steps: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
          flavorNotes: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
        },
      },
    },
  },
} as const;

/**
 * Pilih penyedia AI berdasarkan env yang tersedia di server.
 *
 * - Di hosting Lovable, LOVABLE_API_KEY di-inject otomatis → pakai AI Gateway.
 * - Di hosting lain (mis. Vercel) kunci Gateway tidak bisa diekspor, jadi
 *   pakai kunci provider langsung yang diisi di environment variable hosting.
 *
 * Semua provider di bawah memakai bentuk request OpenAI-compatible yang sama,
 * jadi body, prompt, dan json_schema-nya identik.
 */
function resolveAiProvider() {
  const gatewayKey = process.env["LOVABLE_API_KEY"];
  if (gatewayKey) {
    return {
      name: "Lovable AI Gateway",
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      model: process.env["AI_MODEL"] || "google/gemini-3.7-flash",
      headers: { "Lovable-API-Key": gatewayKey, "X-Lovable-AIG-SDK": "fetch" },
    };
  }

  const geminiKey = process.env["GEMINI_API_KEY"];
  if (geminiKey) {
    return {
      name: "Google AI Studio",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      model: process.env["AI_MODEL"] || "gemini-2.5-flash",
      headers: { Authorization: `Bearer ${geminiKey}` },
    };
  }

  const openaiKey = process.env["OPENAI_API_KEY"];
  if (openaiKey) {
    return {
      name: "OpenAI",
      url: "https://api.openai.com/v1/chat/completions",
      model: process.env["AI_MODEL"] || "gpt-4.1-mini",
      headers: { Authorization: `Bearer ${openaiKey}` },
    };
  }

  return null;
}

export const generateAiRecipe = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const provider = resolveAiProvider();
    if (!provider)
      throw new Error(
        "Kunci AI belum diset di server ini. Di hosting Lovable kunci terisi otomatis. " +
          "Di hosting lain (mis. Vercel), tambahkan environment variable GEMINI_API_KEY " +
          "(atau OPENAI_API_KEY) di pengaturan project hosting, lalu redeploy.",
      );


    const prompt = [
      `Base minuman: ${data.base} (${data.baseDesc})`,
      `Preferensi rasa: ${Object.entries(data.taste)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}`,
      `Bahan tambahan yang dipilih: ${
        data.ingredients.length ? data.ingredients.join(", ") : "tidak ada"
      }`,
      `Penyesuaian slider (0-100): sweet=${data.adjust.sweet}, strength=${data.adjust.strength}, milk=${data.adjust.milk}, ice=${data.adjust.ice}`,
      data.seed ? `Variasi eksplorasi #${data.seed} — beri sudut rasa yang berbeda.` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...provider.headers,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah Digital Barista milik Scoffey: head barista + food scientist. " +
              "Buat 3 variasi resep minuman yang benar-benar bisa dibuat di coffee shop, " +
              "berdasarkan base, preferensi rasa, bahan, dan slider penyesuaian pengguna. " +
              "Variasi 1 = 'Best Match' paling setia pada preferensi; variasi 2 dan 3 = variasi rasa " +
              "yang berbeda karakternya (mis. lebih bold, lebih segar, lebih dessert) tapi tetap memakai base yang sama. " +
              "Field 'style' berisi label variasi singkat (1-2 kata, mis. 'Best Match', 'Bolder', 'Fresh Twist'). " +
              "Nama minuman kreatif maksimal 3 kata dalam bahasa Inggris, dan HARUS berbeda antar variasi. " +
              "DILARANG memakai kata klise berikut di nama: Velvet, Silky, Smooth, Bliss, Dream, Magic. " +
              "Ambil inspirasi dari base, bahan yang dipilih, atau nuansa lokal Indonesia. " +
              (data.lang === "en"
                ? "Write tagline, note, and steps in warm, concise English. "
                : "tagline, note, dan steps ditulis dalam Bahasa Indonesia yang hangat dan ringkas. ") +
              "profile WAJIB berisi 5 item dengan label: Sweetness, Strength, Creaminess, Aroma, Body (value 0-100). " +
              "matchScore dan compatibility antara 70-99, variasi 1 punya matchScore tertinggi.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "recipe_variants", strict: true, schema: jsonSchema },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("AI sedang sibuk, coba lagi sebentar lagi.");
      if (res.status === 401 || res.status === 403)
        throw new Error(
          `Kunci AI untuk ${provider.name} ditolak. Periksa nilai environment variable-nya di hosting, lalu redeploy.`,
        );
      if (res.status === 402)
        throw new Error(
          provider.name === "Lovable AI Gateway"
            ? "Kredit AI habis. Tambahkan kredit di workspace Lovable."
            : `Kuota/billing ${provider.name} habis. Periksa akun provider-mu.`,
        );
      if (res.status === 400 && /model/i.test(body))
        throw new Error(
          `Model "${provider.model}" tidak dikenali ${provider.name}. Set environment variable AI_MODEL ke nama model yang valid, lalu redeploy.`,
        );
      throw new Error(`AI error ${res.status} (${provider.name}): ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI tidak mengembalikan resep.");

    const parsed = JSON.parse(content) as { variants: AiVariant[] };
    return parsed.variants.slice(0, 3);
  });
