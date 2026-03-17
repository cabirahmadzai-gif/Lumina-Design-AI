export enum AnalysisMode {
  GEMSTONE = 'gemstone',
  ANTIQUE = 'antique',
  COIN = 'coin'
}

export interface ItemType {
  id: string;
  name: string;
  description: string;
  image: string;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface GemstoneAnalysis {
  stoneName: string;
  mineralFamily: string;
  hardness: string;
  refractiveIndex: string;
  crystalSystem: string;
  authenticity: string;
  cutType: string;
  colorGrade: string;
  clarity: string;
  estimatedCarat: string;
  estimatedValue: string;
  confidenceScore: number;
  furtherTests: string[];
  detectionTips: string[];
}

export interface AntiqueAnalysis {
  itemName: string;
  originCountry: string;
  estimatedAge: string;
  era: string;
  material: string;
  authenticity: string;
  condition: string;
  historicalSignificance: string;
  estimatedValue: string;
  confidenceScore: number;
  furtherTests: string[];
  detectionTips: string[];
}

export interface CoinAnalysis {
  coinName: string;
  originCountry: string;
  mintYear: string;
  rulerOrEra: string;
  composition: string;
  weightAndSize: string;
  authenticity: string;
  grade: string; // e.g., MS-65, VF-20
  obverseDescription: string;
  reverseDescription: string;
  estimatedValue: string;
  confidenceScore: number;
  furtherTests: string[];
  detectionTips: string[];
}

export type AnalysisResult = GemstoneAnalysis | AntiqueAnalysis | CoinAnalysis;

export interface SavedAnalysis {
  id: string;
  name: string;
  timestamp: number;
  image: string;
  itemType: string | null;
  mode: AnalysisMode;
  analysis: AnalysisResult;
}

export interface AppState {
  originalImage: string | null;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  activeItemType: string | null;
  mode: AnalysisMode;
}