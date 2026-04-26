export interface AnalysisResult {
  riskScore: number;
  issues: string[];
  triggers: string[];
  sentiment: 'positive' | 'neutral' | 'fear-based';
  credibility: 'low' | 'medium' | 'high';
  suggestions: string[];
  summary: string;
  urls: string[];
  detailedVerdict: string;
}

export type RootStackParamList = {
  Home: undefined;
  Result: { result: AnalysisResult; message: string };
};
