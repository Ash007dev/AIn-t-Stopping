// app/api/vision-intent/route.ts — Use Gemini Vision to extract shopping intent from an image
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    // Use Gemini Vision to analyze the image
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a shopping assistant for Amazon quick-commerce. Analyze this image and determine what the user wants to buy or accomplish.

Rules:
- If it's a photo of a recipe, dish, or food: describe what ingredients/items are needed to make it.
- If it's a photo of a product: identify the product and any complementary items.
- If it's a photo of a situation (party setup, messy room, empty kitchen): describe what the user needs.
- If it's a photo of a shopping list: extract all items from the list.

Return a single clear shopping intent sentence that can be used as a search query. Examples:
- "Aglio olio pasta recipe for 3 people"
- "Birthday party supplies for 10 kids"
- "Kitchen cleaning supplies"
- "Movie night snacks for 5"

Return ONLY the intent sentence, nothing else. No quotes, no explanation.`
                },
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Vision error:", errText);
      return NextResponse.json({ error: "Vision API failed" }, { status: 502 });
    }

    const data = await response.json();
    const intentText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!intentText) {
      return NextResponse.json({ error: "Could not understand the image" }, { status: 400 });
    }

    return NextResponse.json({ intentText });
  } catch (error: any) {
    console.error("Vision intent error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
