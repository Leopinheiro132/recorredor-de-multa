import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TicketData {
  date: string;
  time: string;
  location: string;
  authority: string;
  infractionType: string;
  legalFraming: string;
  vehiclePlate: string;
  vehicleModel: string;
  hasPhoto: boolean;
  radarInfo?: {
    model: string;
    lastCalibration: string;
    homologation: string;
  };
}

export interface AnalysisResult {
  extractedData: TicketData;
  inconsistencies: string[];
  successProbability: number;
  explanation: string;
  appealText: string;
}

export async function analyzeTicket(fileBase64: string, mimeType: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Analise esta multa de trânsito brasileira de forma extremamente detalhada. 
            
            Extraia os seguintes dados:
            - Data e hora
            - Local da infração
            - Órgão autuador (Detran, STTU, PRF, etc.)
            - Tipo de infração e enquadramento legal (Artigo do CTB)
            - Placa e modelo do veículo
            - Presença de registro fotográfico
            - Informações do radar (se aplicável): modelo, última aferição/calibração, homologação.

            Realize uma análise jurídica e técnica buscando inconsistências:
            1. Ausência de prova material (foto).
            2. Validade da aferição do radar (deve ser anual pelo INMETRO).
            3. Conformidade da sinalização (se mencionada ou implícita).
            4. Erros formais no preenchimento (campos obrigatórios).
            5. Legalidade do agente ou sistema.

            Com base nisso:
            - Estime a probabilidade de sucesso (0 a 100).
            - Explique os motivos da análise.
            - Gere um recurso administrativo completo, estruturado juridicamente, endereçado ao órgão correto, com argumentos baseados no CTB e resoluções do CONTRAN.

            Retorne a resposta estritamente em formato JSON seguindo este esquema:
            {
              "extractedData": {
                "date": "string",
                "time": "string",
                "location": "string",
                "authority": "string",
                "infractionType": "string",
                "legalFraming": "string",
                "vehiclePlate": "string",
                "vehicleModel": "string",
                "hasPhoto": boolean,
                "radarInfo": { "model": "string", "lastCalibration": "string", "homologation": "string" } (opcional)
              },
              "inconsistencies": ["string"],
              "successProbability": number,
              "explanation": "string",
              "appealText": "string (texto formatado do recurso)"
            }`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) throw new Error("Falha na análise da IA");
  
  return JSON.parse(text) as AnalysisResult;
}
