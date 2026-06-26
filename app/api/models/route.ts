import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit } from '@/lib/rate-limit';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const isLimited = checkRateLimit(ip, 1, 7200000);

  if (isLimited) {
    return new NextResponse("Muitas requisições. Tente novamente mais tarde.", { status: 429 });
  }

  const modelsToTest = [
    "gemini-3-flash-preview",
    "gemini-flash-latest",
    "gemini-2.5-flash"
  ];

  const results = [];

  for (const modelName of modelsToTest) {
    try {
      await genAI.models.generateContent({
        model: modelName,
        contents: "Oi"
      });
      results.push({ name: modelName, available: true });
    } catch (error: any) {
      results.push({ name: modelName, available: false, error: error.message });
    }
  }

  return NextResponse.json(results);
}
