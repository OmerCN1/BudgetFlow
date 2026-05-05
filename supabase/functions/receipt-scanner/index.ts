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
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          qty: { type: "number" },
          unitPrice: { type: "number" },
          totalPrice: { type: "number" },
        },
        required: ["name", "qty", "unitPrice", "totalPrice"],
      },
    },
  },
  required: ["merchant", "amount", "date", "paymentMethod", "notes", "confidence", "items"],
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const apiKey = Deno.env.get("GROQ_API_KEY")
  if (!apiKey) {
    return Response.json(
      { merchant: "", amount: 0, date: "", paymentMethod: "Kart", notes: "GROQ_API_KEY yok.", confidence: 0, items: [] },
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
            content: `Sen BudgetAssist için Türkçe fiş ve makbuz okuma uzmanısın.

Görseldeki fişten şu bilgileri çıkar:
- merchant: İşletme/mağaza adı (fişteki header'dan al, net değilse tahmin et)
- amount: KDV dahil toplam tutar (TOPLAM, GENEL TOPLAM, ÖDENECEK TUTAR satırından al)
- date: Tarih, YYYY-MM-DD formatında
- paymentMethod: "Kart" (kredi/banka kartı), "Nakit" (cash), "Banka" (havale/EFT), "Dijital" (online ödeme)
- notes: Varsa indirim, kampanya veya özel bilgi; yoksa boş string
- confidence: Okumanın güven skoru 0-100 arası (net görüntü=90+, bulanık=50-)
- items: Fişteki her ürün/kalem için dizi. Her kalem için:
  - name: Ürün adı (kısaltmaları açmaya çalış, Türkçe karakter düzelt)
  - qty: Adet/miktar (varsayılan 1)
  - unitPrice: Birim fiyat
  - totalPrice: Toplam fiyat (qty * unitPrice)

ÖNEMLİ KURALLAR:
1. items dizisi boş olabilir ama mutlaka döndür
2. Ürün satırları genellikle: [ürün adı] [adet] x [birim fiyat] = [toplam] formatındadır
3. İNDİRİM, KDV, TOPLAM gibi satırları items'a ekleme
4. amount alanı her zaman fişin en alt satırındaki toplam olmalı
5. Emin olmadığın alanlarda boş string veya 0 kullan, asla uydurma
6. Yalnızca şu JSON şemasına uyan geçerli JSON döndür: ${JSON.stringify(receiptSchema)}`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Dosya adı: ${fileName || "receipt"}. Fişi kalem kalem analiz et ve tüm ürünleri items dizisine ekle.` },
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
      { merchant: "", amount: 0, date: "", paymentMethod: "Kart", notes: error.message || "Fiş okunamadı.", confidence: 0, items: [] },
      { headers: corsHeaders, status: 200 }
    )
  }
})
