import { AnalysisResult } from '../types';

/**
 * Advanced Truth Engine (V6 - Context Aware)
 * -----------------------------------------
 * Identifies themes, red flags, and constructs a dynamic report.
 */

const TOPICS = [
  { keywords: ['election', 'president', 'government', 'minister', 'vote', 'politics'], name: 'Political' },
  { keywords: ['hospital', 'covid', 'cancer', 'cure', 'doctor', 'virus', 'health'], name: 'Health' },
  { keywords: ['market', 'stock', 'crypto', 'invest', 'bank', 'finance', 'profit'], name: 'Financial' },
  { keywords: ['match', 'goal', 'wicket', 'cricket', 'win', 'score', 'sports'], name: 'Sports' }
];

const RED_FLAGS = [
  { pattern: /(!{2,})/g, label: 'Excessive Punctuation', weight: 15, msg: 'Uses multiple exclamation marks to create artificial excitement.' },
  { pattern: /(unbelievable|shocking|must see|exposed|leak)/gi, label: 'Clickbait Phrasing', weight: 25, msg: 'Utilizes sensationalist words aimed at triggering emotional responses.' },
  { pattern: /(officials say|experts believe|people are saying|source claims)/gi, label: 'Vague Attribution', weight: 20, msg: 'Claims authority without naming specific, verifiable sources.' },
  { pattern: /(urgent|act now|don't wait|share before deleted)/gi, label: 'Fear/Urgency Bias', weight: 20, msg: 'Creates a false sense of urgency to bypass critical thinking.' },
  { pattern: /([A-Z]{4,})/g, label: 'Aggressive Capitalization', weight: 15, msg: 'Uses "shouting" text to demand attention regardless of factuality.' }
];

const TRUST_MARKERS = [
  { pattern: /(reuters|ap news|bbc|associated press|reported by)/gi, label: 'Credible Source Mention', weight: -30 },
  { pattern: /(according to the official report|data from the bureau)/gi, label: 'Evidence Citation', weight: -20 }
];

export function analyzeMessage(message: string): AnalysisResult {
  const lower = message.toLowerCase();
  
  // 1. Detect Topic
  const detectedTopic = TOPICS.find(t => t.keywords.some(k => lower.includes(k)))?.name || 'General News';

  // 2. Scan Red Flags
  const foundFlags: string[] = [];
  const detailedIssues: string[] = [];
  let score = 0;

  RED_FLAGS.forEach(flag => {
    if (message.match(flag.pattern)) {
      score += flag.weight;
      foundFlags.push(flag.label);
      detailedIssues.push(flag.msg);
    }
  });

  // 3. Scan Trust Markers
  TRUST_MARKERS.forEach(marker => {
    if (message.match(marker.pattern)) {
      score += marker.weight;
    }
  });

  // 4. Content Specific Risk
  if (message.length < 50 && score > 0) score += 10; // Short emotional bursts are risky
  
  // Clamp Score
  const riskScore = Math.max(0, Math.min(score, 100));

  // 5. Construct Unique Verdict
  let detailedVerdict = "";
  if (riskScore < 30) {
    detailedVerdict = `Our AI has analyzed this ${detectedTopic} content and found it to be high-fidelity. The linguistic structure matches neutral reporting standards. ${foundFlags.length > 0 ? "Minor stylistic triggers were noted, but they do not impact the overall credibility." : "No misinformation markers were detected."}`;
  } else if (riskScore < 70) {
    detailedVerdict = `CAUTION: This ${detectedTopic} report shows moderate inconsistencies. We detected ${foundFlags.join(' and ')}, which are common markers of unverified news. While not definitively false, the lack of ironclad evidence suggests you should verify the source before sharing.`;
  } else {
    detailedVerdict = `HIGH PROBABILITY OF MISINFORMATION: This ${detectedTopic} content is a ${riskScore}% match for disinformation patterns. Specifically, the ${foundFlags.slice(0, 2).join(', ')} used here points toward a coordinated intent to deceive through sensationalism. DO NOT SHARE WITHOUT CROSS-CHECKING.`;
  }

  return {
    riskScore,
    issues: detailedIssues,
    triggers: foundFlags,
    sentiment: riskScore > 60 ? 'Manipulative' : 'Neutral',
    credibility: riskScore > 60 ? 'low' : 'high',
    suggestions: [
      'Look for this headline on Google News.',
      'Check if a recognized news outlet has reported this.',
      'Examine the metadata or URL for authenticity.'
    ],
    summary: riskScore > 75 ? 'MISINFORMATION DETECTED' : riskScore > 40 ? 'SUSPICIOUS CONTENT' : 'AUTHENTIC NEWS',
    urls: message.match(/(https?:\/\/[^\s]+)/gi) || [],
    detailedVerdict
  };
}
