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

  const apiKey = Deno.env.get("GROQ_API_KEY")
  if (!apiKey) {
    return Response.json(
      { merchant: "", amount: 0, date: "", paymentMethod: "Kart", notes: "GROQ_API_KEY yok.", confidence: 0 },
      { headers: corsHeaders }
    )
  }

  try {
    const { imageDataUrl, fileName } = await req.json()
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      throw new Error("imageDataUrl gerekli.")
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("GROQ_RECEIPT_MODEL") || "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content:
              `Sen BudgetFlow için Türkçe fiş ve makbuz okuma yardımcısısın. Görselden sadece satıcı adı, toplam tutar, tarih ve ödeme yöntemini çıkar. Emin olmadığında boş string veya 0 kullan. Tarihi YYYY-MM-DD biçiminde döndür. Yalnızca şu JSON şemasına uyan geçerli JSON döndür: ${JSON.stringify(receiptSchema)}`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Dosya adı: ${fileName || "receipt"}. Toplam tutarı, tarihi ve işletme adını çıkar.` },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(detail)
    }

    const payload = await response.json()
    const outputText = payload.choices?.[0]?.message?.content
    if (!outputText) throw new Error("Groq boş yanıt döndürdü.")
    return Response.json(JSON.parse(outputText), { headers: corsHeaders })
  } catch (error) {
    return Response.json(
      { merchant: "", amount: 0, date: "", paymentMethod: "Kart", notes: error.message || "Fiş okunamadı.", confidence: 0 },
      { headers: corsHeaders, status: 200 }
    )
  }
})
