// lib/agents/gemini-client.ts
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { logAgentCall, type AILogEntry } from "@/lib/ai-logger";

const GROQ_MODELS = {
  pro: "llama-3.3-70b-versatile",
  flash: "llama-3.3-70b-versatile",
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

// Track which agent is calling — set by callers before invoking
let _currentAgentContext: AILogEntry["agent"] = "cart-curator";

export function setAgentContext(agent: AILogEntry["agent"]) {
  _currentAgentContext = agent;
}

export async function invokeGeminiAgent(
  systemPrompt: string,
  userMessage: string,
  tier: "pro" | "flash" = "flash",
  maxOutputTokens = 1024,
  imageBase64?: string | null
): Promise<string> {
  const startTime = Date.now();
  let usedModel = GEMINI_MODELS[tier];

  try {
    let output: string;

    if (imageBase64) {
      // IMAGE SCANNING MUST USE GEMINI
      const API_KEY = process.env.GEMINI_API_KEY;
      if (!API_KEY) throw new Error("GEMINI_API_KEY is missing.");

      const genAI = new GoogleGenerativeAI(API_KEY);
      usedModel = GEMINI_MODELS[tier];
      const model = genAI.getGenerativeModel({
        model: usedModel,
        systemInstruction: systemPrompt,
      });

      const parts: Part[] = [{ text: userMessage }];

      // Clean base64 string if it has data url prefix
      const base64Data = imageBase64.includes('base64,')
        ? imageBase64.split('base64,')[1]
        : imageBase64;

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: imageBase64.match(/data:([^;]+);/)?.[1] || "image/jpeg"
        }
      });

      console.log(`[gemini-client] Invoking Google Gemini ${usedModel} with Image...`);
      const response = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: {
          maxOutputTokens,
          temperature: 0.2,
        },
      });
      output = response.response.text();
    } else {
      // FORCE GROQ ONLY MODE FOR TEXT AS REQUESTED
      usedModel = GROQ_MODELS[tier];
      output = await invokeGroqFallback(systemPrompt, userMessage, tier, maxOutputTokens);
    }

    // Log successful call
    logAgentCall({
      agent: _currentAgentContext,
      status: "success",
      latencyMs: Date.now() - startTime,
      input: userMessage.substring(0, 500),
      output: output.substring(0, 1000),
      model: usedModel,
      tokenEstimate: Math.round((systemPrompt.length + userMessage.length + output.length) / 4),
    });

    return output;
  } catch (geminiError: unknown) {
    const geminiMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
    console.error(`[gemini-client] Gemini Primary Failed: ${geminiMsg}`);
    
    // Fallback: Try Groq immediately
    try {
      usedModel = GROQ_MODELS[tier];
      const output = await invokeGroqFallback(systemPrompt, userMessage, tier, maxOutputTokens);

      // Log fallback call
      logAgentCall({
        agent: _currentAgentContext,
        status: "fallback",
        latencyMs: Date.now() - startTime,
        input: userMessage.substring(0, 500),
        output: output.substring(0, 1000),
        model: usedModel,
        tokenEstimate: Math.round((systemPrompt.length + userMessage.length + output.length) / 4),
        metadata: { primaryError: geminiMsg },
      });

      return output;
    } catch (groqError: unknown) {
      const groqMsg = groqError instanceof Error ? groqError.message : String(groqError);
      console.error(`[gemini-client] Groq Fallback Failed: ${groqMsg}`);

      // Log error
      logAgentCall({
        agent: _currentAgentContext,
        status: "error",
        latencyMs: Date.now() - startTime,
        input: userMessage.substring(0, 500),
        output: "",
        model: usedModel,
        errorMessage: `Gemini: ${geminiMsg}. Groq: ${groqMsg}`,
      });

      throw new Error(`Both Primary (Gemini) and Fallback (Groq) failed. Gemini: ${geminiMsg}. Groq: ${groqMsg}`);
    }
  }
}

// Alias for new code
export const invokeAI = invokeGeminiAgent;
