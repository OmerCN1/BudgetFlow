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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY")
  if (!apiKey) {
    return Response.json(
      {
        reply: "AI Koç şu an yapılandırılmamış. Supabase Edge Function ortamına OPENAI_API_KEY ekleyin.",
        insights: [],
      },
      { headers: corsHeaders }
    )
  }

  try {
    const { message, summary } = await req.json()
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-5.4-mini",
        input: [
          {
            role: "system",
            content:
              "Sen BudgetFlow içinde çalışan Türkçe bir kişisel bütçe koçusun. Yatırım, vergi veya hukuki tavsiye verme. Sadece kullanıcının özet finans verisine dayanarak harcama farkındalığı, bütçe önerisi ve takip edilebilir aksiyonlar sun.",
          },
          {
            role: "user",
            content: JSON.stringify({ question: message, finance_summary: summary }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "budget_coach_response",
            strict: true,
            schema: insightSchema,
          },
        },
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(detail)
    }

    const payload = await response.json()
    const outputText = payload.output_text || payload.output?.[0]?.content?.[0]?.text
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

