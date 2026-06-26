import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import prisma from '@/lib/prisma';
import { AnalysisResult } from '@/types';
import { checkRateLimit } from '@/lib/rate-limit';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const isLimited = checkRateLimit(ip, 1, 7200000);

    if (isLimited) {
      return new NextResponse("Muitas requisições. Tente novamente mais tarde.", { status: 429 });
    }

    const session = await auth();
    const userId = session.userId;

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const model = (formData.get('model') as string) || "gemini-3-flash-preview";

    if (!file) {
      return new NextResponse("Nenhum arquivo enviado.", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const prompt = `Você é um advogado especialista em Direito de Trânsito brasileiro, com ampla experiência em recursos administrativos (Defesa Prévia, JARI, CETRAN).

            Sua tarefa: analisar autos de infração de trânsito (texto extraído via OCR) e gerar uma análise técnica + recurso administrativo de alta qualidade.

            ---

            ## 1. EXTRAÇÃO DE DADOS (OBRIGATÓRIA)
            Extraia apenas o que estiver presente. NÃO invente dados.
            - stage: "defesa_previa" | "jari" | "cetran"
            - date (YYYY-MM-DD), time (HH:MM), location, authority.
            - infractionType, legalFraming (artigo CTB completo).
            - vehiclePlate, vehicleModel, renavam, driverName.
            - Velocidade: measuredSpeed, consideredSpeed, roadLimit.
            - Radar: radarModel, lastCalibration, inmetroHomologation.
            - Provas: hasPhoto, hasVideo, hasTechnicalReport, hasAgentStatement (boolean).
            - Qualidade: dataConfidence ("high" | "medium" | "low").

            ---

            ## 2. ANÁLISE JURÍDICA E NULIDADES
            Busque vícios formais e materiais baseando-se no CTB e Resoluções CONTRAN:
            - Art. 280, 281, 282 do CTB.
            - Resolução 798/2020 (Radares), 917/22 (Prazos).
            - Inmeto (Aferição anual).

            Estratégia: NÃO use frases genéricas. Foque no ônus da prova do órgão e nulidades formais técnicas.

            ---

            ## 3. GRAVIDADE E PONTOS
            A gravidade DEVE ser baseada no artigo do CTB:
            - leve (3), média (4), grave (5), gravíssima (7).
            Determine: severity e points.

            ---

            ## 4. IMPACTO NA CNH
            - canBeAvoided (true/false)
            - riskLevel e suspensionRisk ("low" | "medium" | "high")

            ---

            ## 5. RECURSO (NÍVEL ADVOGADO)
            Gere um texto técnico, direto e profissional sob o "appealText".

            ---

            ## SAÍDA (STRICT JSON):
            {
              "defenseStage": "string",
              "extractedData": {
                "date": "string|null",
                "time": "string|null",
                "location": "string|null",
                "authority": "string|null",
                "infractionType": "string|null",
                "legalFraming": "string|null",
                "vehiclePlate": "string|null",
                "vehicleModel": "string|null",
                "renavam": "string|null",
                "driverName": "string|null",
                "measuredSpeed": "string|null",
                "consideredSpeed": "string|null",
                "roadLimit": "string|null",
                "radarModel": "string|null",
                "lastCalibration": "string|null",
                "inmetroHomologation": "string|null",
                "hasPhoto": boolean|null,
                "hasVideo": boolean|null,
                "hasTechnicalReport": boolean|null,
                "hasAgentStatement": boolean|null,
                "dataConfidence": "high|medium|low"
              },
              "classification": {
                "infractionCategory": "string",
                "applicableRegulations": ["string"]
              },
              "severity": "leve|média|grave|gravíssima|null",
              "points": number|null,
              "inconsistencies": ["string"],
              "successProbability": number,
              "cnhImpact": {
                "points": number|null,
                "canBeAvoided": boolean,
                "riskLevel": "low|medium|high",
                "suspensionRisk": "low|medium|high"
              },
              "explanation": "string",
              "appealText": "string"
            }`;

    const result = await genAI.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType: file.type
              }
            },
            { text: prompt }
          ]
        }
      ]
    });

    let textoLimpo = result.text || "{}";

    if (textoLimpo.includes("```json")) {
      textoLimpo = textoLimpo.replace("```json", "");
    }
    if (textoLimpo.includes("```")) {
      textoLimpo = textoLimpo.replace("```", "");
    }
    
    textoLimpo = textoLimpo.trim();

    const analysis: AnalysisResult = JSON.parse(textoLimpo);

    if (userId !== null && userId !== undefined && userId !== "") {
      await prisma.analysis.create({
        data: {
          userId: userId,
          defenseStage: analysis.defenseStage || "defesa_previa",
          date: analysis.extractedData.date || "N/A",
          time: analysis.extractedData.time || "N/A",
          location: analysis.extractedData.location || "N/A",
          authority: analysis.extractedData.authority || "N/A",
          infractionType: analysis.extractedData.infractionType || "N/A",
          legalFraming: analysis.extractedData.legalFraming || "N/A",
          vehiclePlate: analysis.extractedData.vehiclePlate || "N/A",
          vehicleModel: analysis.extractedData.vehicleModel || "N/A",
          measuredSpeed: analysis.extractedData.measuredSpeed,
          consideredSpeed: analysis.extractedData.consideredSpeed,
          roadLimit: analysis.extractedData.roadLimit,
          severity: analysis.severity,
          points: analysis.points,
          hasPhoto: !!analysis.extractedData.hasPhoto,
          successProbability: analysis.successProbability,
          explanation: analysis.explanation,
          appealText: analysis.appealText,
          radarModel: analysis.extractedData.radarModel,
          radarCalibration: analysis.extractedData.lastCalibration,
          radarHomologation: analysis.extractedData.inmetroHomologation,
        }
      });

      const statsExistente = await prisma.userStats.findUnique({
        where: { userId: userId }
      });

      const pontosSalvar = analysis.points || 0;

      if (statsExistente) {
        await prisma.userStats.update({
          where: { userId: userId },
          data: {
            totalAnalyses: statsExistente.totalAnalyses + 1,
            avgProbability: (statsExistente.avgProbability + analysis.successProbability) / 2,
            potentialSavings: statsExistente.potentialSavings + 150.00,
            pointsSaved: statsExistente.pointsSaved + pontosSalvar
          }
        });
      } else {
        await prisma.userStats.create({
          data: {
            userId: userId,
            totalAnalyses: 1,
            avgProbability: analysis.successProbability,
            potentialSavings: 150.00,
            pointsSaved: pontosSalvar
          }
        });
      }
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("[ERRO_API_ANALISAR]", error);

    if (error.status === 429) {
      return new NextResponse("O sistema está muito ocupado no momento. Tente de novo em alguns segundos.", { status: 429 });
    }

    return new NextResponse("Ocorreu um problema ao ler a multa: " + (error.message || "Erro desconhecido"), { status: 500 });
  }
}
