import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const receiptSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    merchant: { type: "string" },
    amount: { type: "number" },
    date: { type: "string" },
    paymentMethod: { type: "string", enum: ["Kart", "Nakit", "Banka", "Dijital"] },
    notes: { type: "string" },
    confidence: { type: "number" },
  },
  required: ["merchant", "amount", "date", "paymentMethod", "notes", "confidence"],
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY")
  if (!apiKey) {
    return Response.json(
      { merchant: "", amount: 0, date: "", paymentMethod: "Kart", notes: "OPENAI_API_KEY yok.", confidence: 0 },
      { headers: corsHeaders }
    )
  }

  try {
    const { imageDataUrl, fileName } = await req.json()
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      throw new Error("imageDataUrl gerekli.")
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_RECEIPT_MODEL") || Deno.env.get("OPENAI_MODEL") || "gpt-5.4-mini",
        input: [
          {
            role: "system",
            content:
              "Sen BudgetFlow için Türkçe fiş ve makbuz okuma yardımcısısın. Görselden sadece satıcı adı, toplam tutar, tarih ve ödeme yöntemini çıkar. Emin olmadığında boş string veya 0 kullan. Tarihi YYYY-MM-DD biçiminde döndür.",
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: `Dosya adı: ${fileName || "receipt"}. Toplam tutarı, tarihi ve işletme adını çıkar.` },
              { type: "input_image", image_url: imageDataUrl },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "budgetflow_receipt",
            strict: true,
            schema: receiptSchema,
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
    return Response.json(JSON.parse(outputText), { headers: corsHeaders })
  } catch (error) {
    return Response.json(
      { merchant: "", amount: 0, date: "", paymentMethod: "Kart", notes: error.message || "Fiş okunamadı.", confidence: 0 },
      { headers: corsHeaders, status: 200 }
    )
  }
})
