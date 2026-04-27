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
  newsCheck?: {
    articles: any[];
    topicVerified: boolean;
    status: string;
  };
  factChecks?: any[];
  wikiResult?: any;
  domainStats?: any;
  duplicateCount?: number;
  resolvedUrls?: string[];
}

export type RootStackParamList = {
  Home: undefined;
  Result: { result: AnalysisResult; message: string };
};
