// lib/agents/gemini-client.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const GROQ_MODELS = {
  pro: "llama-3.3-70b-versatile",
  flash: "llama-3.1-8b-instant",
};

const GEMINI_MODELS = {
  pro: "gemini-2.5-pro",
  flash: "gemini-2.5-flash",
};

async function invokeGroqFallback(
  systemPrompt: string,
  userMessage: string,
  tier: "pro" | "flash",
  maxOutputTokens: number
): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing, cannot fallback.");
  }
  
  const modelName = GROQ_MODELS[tier];
  console.log(`[gemini-client] Attempting Groq fallback with model: ${modelName}`);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: maxOutputTokens,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (!data.choices || data.choices.length === 0) {
    throw new Error("Groq returned empty choices array");
  }

  return data.choices[0].message.content;
}

export async function invokeGeminiAgent(
  systemPrompt: string,
  userMessage: string,
  tier: "pro" | "flash" = "flash",
  maxOutputTokens = 1024,
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = GEMINI_MODELS[tier];
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { 
        maxOutputTokens,
        responseMimeType: "application/json"
      },
    });
    
    const prompt = `${systemPrompt}\n\n---\n\n${userMessage}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (geminiError: unknown) {
    const geminiMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
    console.error(`[gemini-client] Gemini Primary Failed: ${geminiMsg}`);
    
    // Fallback: Try Groq immediately without retry ping delays
    try {
      return await invokeGroqFallback(systemPrompt, userMessage, tier, maxOutputTokens);
    } catch (groqError: unknown) {
      const groqMsg = groqError instanceof Error ? groqError.message : String(groqError);
      console.error(`[gemini-client] Groq Fallback Failed: ${groqMsg}`);
      throw new Error(`Both Primary (Gemini) and Fallback (Groq) failed. Gemini: ${geminiMsg}. Groq: ${groqMsg}`);
    }
  }
}

// Alias for new code
export const invokeAI = invokeGeminiAgent;
