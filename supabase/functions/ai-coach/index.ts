import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const insightSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
    insights: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          severity: { type: "string", enum: ["info", "success", "warning", "danger"] },
        },
        required: ["type", "title", "body", "severity"],
      },
    },
  },
  required: ["reply", "insights"],
}

const coachInstructions = [
  "Sen BudgetAssist içinde çalışan Türkçe bir kişisel bütçe koçusun.",
  "Yatırım, vergi veya hukuki tavsiye verme.",
  "Sadece kullanıcının finans özetinde bulunan verilere dayanarak harcama farkındalığı, bütçe önerisi ve takip edilebilir aksiyonlar sun.",
  "Veride olmayan tutar, tarih, kişi, kurum veya işlem bilgisini uydurma; eksikse bunu kısa ve doğal biçimde söyle.",
  "Soruyla ilgili alanlara odaklan: işlemler, bütçeler, hedefler, tekrarlı ödemeler, borçlar, varlıklar ve kredi kartları arasından en alakalı olanları kullan.",
  "reply alanı kullanıcıya gösterilecek asıl sohbet cevabıdır; asla sadece başlık, etiket veya tek cümle yazma.",
  "reply alanını 4-6 kısa cümle veya 3-5 maddelik net bir analiz olarak yaz.",
  "Kullanıcının sorusu 3 öneri istiyorsa tam 3 numaralı öneri ver.",
  "Mümkün olduğunda kategori adı, TL tutarı, kalan bütçe, son işlem, yaklaşan ödeme ve önceki ay farkı gibi somut sayıları kullan.",
  "insights alanı yan panel kartları içindir; 1-3 kısa içgörü döndür ve reply alanını kopyalama.",
  `Yalnızca şu JSON şemasına uyan geçerli JSON döndür: ${JSON.stringify(insightSchema)}`,
].join(" ")

const defaultModel = "openai/gpt-oss-20b"

function buildResponseFormat(model: string) {
  if (model.startsWith("openai/gpt-oss")) {
    return {
      type: "json_schema",
      json_schema: {
        name: "budget_coach_response",
        schema: insightSchema,
        strict: true,
      },
    }
  }

  return { type: "json_object" }
}

function buildModelOptions(model: string) {
  if (!model.startsWith("openai/gpt-oss")) return {}

  return {
    reasoning_effort: Deno.env.get("GROQ_REASONING_EFFORT") || "low",
    include_reasoning: false,
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const apiKey = Deno.env.get("GROQ_API_KEY")
  if (!apiKey) {
    return Response.json(
      {
        reply: "AI Koç şu an yapılandırılmamış. Supabase Edge Function ortamına GROQ_API_KEY ekleyin.",
        insights: [],
      },
      { headers: corsHeaders }
    )
  }

  try {
    const { message, summary } = await req.json()
    const model = Deno.env.get("GROQ_MODEL") || defaultModel
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: coachInstructions,
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Kullanıcının sorusuna BudgetAssist sohbet balonunda gösterilecek detaylı, pratik ve kişiselleştirilmiş bir cevap üret.",
              question: message,
              finance_summary: summary,
            }),
          },
        ],
        response_format: buildResponseFormat(model),
        ...buildModelOptions(model),
        temperature: 0.2,
        max_completion_tokens: 750,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(detail)
    }

    const payload = await response.json()
    const outputText = payload.choices?.[0]?.message?.content
    if (!outputText) throw new Error("Groq boş yanıt döndürdü.")
    const parsed = JSON.parse(outputText)

    return Response.json(parsed, { headers: corsHeaders })
  } catch (error) {
    return Response.json(
      {
        reply: "AI yanıtı alınamadı. Lütfen biraz sonra tekrar deneyin.",
        insights: [
          {
            type: "system",
            title: "AI bağlantı hatası",
            body: error.message || "Bilinmeyen hata",
            severity: "warning",
          },
        ],
      },
      { headers: corsHeaders, status: 200 }
    )
  }
})
