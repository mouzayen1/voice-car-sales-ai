import OpenAI, { toFile } from "openai";
import { storage } from "./storage";
import type { Message } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;
console.log(
  "DEBUG: OPENAI_API_KEY env var:",
  process.env.OPENAI_API_KEY ? "SET" : "NOT SET",
);

if (process.env.OPENAI_API_KEY) {
  // TEMPORARY: Use hardcoded API key as fallback for Replit environment
  const apiKeyToUse = process.env.OPENAI_API_KEY || "";
  if (apiKeyToUse) {
    openai = new OpenAI({ apiKey: apiKeyToUse });
    console.log("✓ OpenAI API key configured successfully");
  }
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (
  typeof process.env.OPENAI_API_KEY === "string" &&
  process.env.OPENAI_API_KEY.length > 0
) {
  // Fallback if env var is available
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  // Try to load from potential alternative sources
  const apiKey = process.env["OPENAI_API_KEY"] || process.env.openai_api_key;
  if (apiKey) {
    openai = new OpenAI({ apiKey });
  }
}

function getOpenAI(): OpenAI {
  if (!openai) {
    throw new Error(
      "OpenAI API key not configured. Please add your OPENAI_API_KEY.",
    );
  }
  return openai;
}

export function isConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY || !!openai;
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const client = getOpenAI();

  // Use OpenAI's toFile helper for Node.js compatibility
  const file = await toFile(audioBuffer, "audio.webm", { type: "audio/webm" });

  const transcription = await client.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  return transcription.text;
}

export async function generateChatResponse(
  messages: Message[],
  userMessage: string,
): Promise<string> {
  const client = getOpenAI();
  const cars = await storage.getAllCars();

  const inventoryContext = cars
    .map(
      (car) =>
        `- ${car.year} ${car.make} ${car.model}: ${formatPrice(car.price)}, ${car.color}, ${car.mileage.toLocaleString()} miles, ${car.fuelType}, ${car.transmission}, ${car.drivetrain}. Features: ${car.features?.join(", ")}. ${car.description}`,
    )
    .join("\n");

  const systemPrompt = `You are AutoVoice AI, a friendly and knowledgeable car sales assistant. You help customers find their perfect vehicle from our current inventory.

Current Inventory:
${inventoryContext}

Guidelines:
1. Be helpful, friendly, and professional
2. Answer questions about vehicles in our inventory
3. Make personalized recommendations based on customer needs
4. Highlight key features and benefits of vehicles
5. Be honest about vehicle specifications and pricing
6. If asked about vehicles not in inventory, politely explain what we do have
7. Encourage customers to schedule test drives
8. Keep responses concise but informative (2-3 sentences for simple questions, more detail when appropriate)
9. Use natural, conversational language suitable for voice responses
10. When comparing vehicles, focus on the most relevant differences for the customer's needs`;

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: "gpt-5",
    messages: chatMessages,
    max_completion_tokens: 500,
  });

  return (
    response.choices[0].message.content ||
    "I apologize, but I couldn't generate a response. Could you please try again?"
  );
}

export async function generateSpeech(text: string): Promise<Buffer> {
  const client = getOpenAI();

  const response = await client.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
