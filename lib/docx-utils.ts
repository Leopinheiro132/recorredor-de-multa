import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

export async function downloadAppealAsDocx(analysis: any) {
  const { extractedData, appealText } = analysis;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "ILUSTRÍSSIMO SENHOR PRESIDENTE DA JARI DO " + (extractedData.authority || "ÓRGÃO AUTUADOR").toUpperCase(),
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "FASE: " + (analysis.defenseStage || "DEFESA PRÉVIA").toUpperCase().replace('_', ' '),
                bold: true,
                size: 18,
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "REQUERENTE: ",
                bold: true,
              }),
              new TextRun({
                text: extractedData.ownerName || "__________________________________________",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "CPF/CNPJ: ",
                bold: true,
              }),
              new TextRun({
                text: extractedData.ownerCpf || "__________________________________________",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "ENDEREÇO: ",
                bold: true,
              }),
              new TextRun({
                text: extractedData.ownerAddress || "__________________________________________",
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }),

          new Paragraph({
            children: [
              new TextRun({
                text: "VEÍCULO: ",
                bold: true,
              }),
              new TextRun({
                text: (extractedData.vehicleModel || "---") + " | PLACA: " + (extractedData.vehiclePlate || "---") + " | RENAVAM: " + (extractedData.renavam || "---"),
              }),
            ],
          }),
          
          extractedData.measuredSpeed ? new Paragraph({
            children: [
              new TextRun({
                text: "VELOCIDADE AFERIDA: ",
                bold: true,
              }),
              new TextRun({
                text: extractedData.measuredSpeed + " | CONSIDERADA: " + (extractedData.consideredSpeed || "---") + " | LIMITE: " + (extractedData.roadLimit || "---"),
              }),
            ],
          }) : new Paragraph({ text: "" }),

          new Paragraph({ text: "", spacing: { after: 400 } }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: "OBJETO: DEFESA PRÉVIA / RECURSO DE INFRAÇÃO",
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Normalize appeal text for docx (handling line breaks)
          ...appealText.split('\n').map((line: string) => {
             return new Paragraph({
               alignment: AlignmentType.JUSTIFIED,
               children: [
                 new TextRun({
                   text: line.trim(),
                   size: 22,
                 }),
               ],
               spacing: { after: 120 },
             });
          }),

          new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Nestes termos,",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Pede Deferimento.",
                size: 22,
              }),
            ],
          }),
          
          new Paragraph({ text: "", spacing: { after: 600 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "__________________________________________",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: extractedData.ownerName || "Assinatura do Requerente",
                size: 18,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `recurso-${extractedData.vehiclePlate || 'multa'}.docx`);
}
