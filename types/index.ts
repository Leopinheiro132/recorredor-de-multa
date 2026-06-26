export interface AnalysisResult {
  defenseStage: "defesa_previa" | "jari" | "cetran";
  extractedData: {
    date: string | null;
    time: string | null;
    location: string | null;
    authority: string | null;
    infractionType: string | null;
    legalFraming: string | null;
    vehiclePlate: string | null;
    vehicleModel: string | null;
    renavam: string | null;
    driverName: string | null;
    measuredSpeed: string | null;
    consideredSpeed: string | null;
    roadLimit: string | null;
    radarModel: string | null;
    lastCalibration: string | null;
    inmetroHomologation: string | null;
    hasPhoto: boolean | null;
    hasVideo: boolean | null;
    hasTechnicalReport: boolean | null;
    hasAgentStatement: boolean | null;
    dataConfidence: "high" | "medium" | "low";
  };
  classification: {
    infractionCategory: string;
    applicableRegulations: string[];
  };
  severity: "leve" | "média" | "grave" | "gravíssima" | null;
  points: number | null;
  inconsistencies: string[];
  successProbability: number;
  cnhImpact: {
    points: number | null;
    canBeAvoided: boolean;
    riskLevel: "low" | "medium" | "high";
    suspensionRisk: "low" | "medium" | "high";
  };
  explanation: string;
  appealText: string;
}
