// lib/agents/gemini-client.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const MODEL_CANDIDATES = {
  pro: ["gemini-3.1-pro", "gemini-3.0-pro", "gemini-2.5-pro", "gemini-pro"],
  flash: ["gemini-3.1-flash", "gemini-3.0-flash", "gemini-2.5-flash", "gemini-flash"],
};

const GROQ_MODELS = {
  pro: "llama-3.3-70b-versatile",
  flash: "llama-3.1-8b-instant",
};

const resolvedModels: Partial<Record<"pro" | "flash", string>> = {};

async function resolveGeminiModel(tier: "pro" | "flash"): Promise<string> {
  if (resolvedModels[tier]) return resolvedModels[tier]!;
  let lastError: any = null;
  for (const candidate of MODEL_CANDIDATES[tier]) {
    try {
      const model = genAI.getGenerativeModel({ model: candidate });
      await model.generateContent("ping");
      resolvedModels[tier] = candidate;
      console.log(`[gemini-client] Resolved Gemini ${tier} model: ${candidate}`);
      return candidate;
    } catch (e: any) {
      console.error(`[gemini-client] Failed Gemini ${candidate}:`, e.message || e);
      lastError = e;
    }
  }
  throw new Error(`No available Gemini ${tier} model found. Last error: ${lastError?.message || 'Unknown'}`);
}

async function invokeGroqFallback(
  systemPrompt: string,
  userMessage: string,
  tier: "pro" | "flash",
  maxOutputTokens: number
): Promise<string> {
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
  maxOutputTokens = 1024
): Promise<string> {
  // Primary: Try Gemini
  try {
    const modelName = await resolveGeminiModel(tier);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { maxOutputTokens },
    });
    const prompt = `${systemPrompt}\n\n---\n\n${userMessage}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (geminiError: any) {
    console.error(`[gemini-client] Gemini Primary Failed: ${geminiError.message || geminiError}`);
    
    // Fallback: Try Groq
    try {
      return await invokeGroqFallback(systemPrompt, userMessage, tier, maxOutputTokens);
    } catch (groqError: any) {
      console.error(`[gemini-client] Groq Fallback Failed: ${groqError.message || groqError}`);
      throw new Error(`Both Primary (Gemini) and Fallback (Groq) failed. Gemini: ${geminiError.message}. Groq: ${groqError.message}`);
    }
  }
}
