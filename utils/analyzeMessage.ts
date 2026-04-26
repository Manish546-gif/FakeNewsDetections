import { AnalysisResult } from '../types';

/**
 * Total Security & Truth Engine (V7 - Multi-Vector)
 * -----------------------------------------------
 * Detects News, Phishing Emails, SMS Scams, and Deceptive Traps.
 */

const THREAT_TYPES = {
  NEWS: 'News Analysis',
  PHISHING: 'Phishing Attempt',
  TRAP: 'SMS/Chat Scam',
  LEGIT: 'Likely Authentic'
};

const PHISHING_LURES = [
  { pattern: /(account|login|verify|update|blocked|suspended|security)/gi, weight: 15 },
  { pattern: /(official|bank|support|admin|security-team)/gi, weight: 10 },
  { pattern: /(action required|immediately|within 24 hours|final notice)/gi, weight: 20 },
  { pattern: /(click here|validate|sign in below|next of kin|dormant account)/gi, weight: 25 },
  { pattern: /(late president|financial dispute|swiss bank|frozen account)/gi, weight: 30 }
];

const TRAP_PATTERNS = [
  { pattern: /(won|winner|lottery|prize|reward|gift card|unclaimed|comp to win)/gi, weight: 30 },
  { pattern: /(amazon package|fedex|unpaid shipping|delivery failed)/gi, weight: 25 },
  { pattern: /(verification code|otp|don't share|someone logged into)/gi, weight: 25 },
  { pattern: /(bitcoin|crypto|investment|easy profit|double your|royalties)/gi, weight: 30 },
  { pattern: /(std txt rate|claim code|txt to \d{5}|\d+)/gi, weight: 35 }
];

const SUSPICIOUS_URL_TRAITS = [
  { pattern: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, label: 'Direct IP Link', weight: 40 },
  { pattern: /(@)/, label: 'Masked URL Pattern', weight: 30 },
  { pattern: /(\.zip|\.apk|\.exe|\.rar)$/i, label: 'Executable Content', weight: 50 },
  { pattern: /(googIe|faceb0ok|paypa1|micros0ft)/i, label: 'Typosquatting Attempt', weight: 45 }
];

export function analyzeMessage(message: string): AnalysisResult {
  const lower = message.toLowerCase();
  const urls = message.match(/(https?:\/\/[^\s]+)/gi) || [];
  
  let score = 0;
  let issues: string[] = [];
  let triggers: string[] = [];
  let detectedType = THREAT_TYPES.NEWS;

  // 1. Classification
  const isEmail = lower.includes('subject:') || lower.includes('dear') || lower.includes('sincerely');
  const isSMS = message.length < 200 && (lower.includes('reply') || lower.includes('opt out') || lower.includes('msg'));

  if (isEmail) detectedType = THREAT_TYPES.PHISHING;
  else if (isSMS) detectedType = THREAT_TYPES.TRAP;

  // 2. Vector Analysis
  if (detectedType === THREAT_TYPES.PHISHING) {
    PHISHING_LURES.forEach(l => {
      if (message.match(l.pattern)) score += l.weight;
    });
    issues.push('Linguistic pattern matches credential theft lures.');
  } else if (detectedType === THREAT_TYPES.TRAP) {
    TRAP_PATTERNS.forEach(t => {
      if (message.match(t.pattern)) score += t.weight;
    });
    issues.push('Highly suspicious "Prize/Urgency" trap detected.');
  }

  // 3. Global URL Security Check
  urls.forEach(url => {
    SUSPICIOUS_URL_TRAITS.forEach(trait => {
      if (url.match(trait.pattern)) {
        score += trait.weight;
        triggers.push(trait.label);
      }
    });
  });

  // 4. Default News Risk (Heuristics from previous version)
  if (lower.includes('shocking') || lower.includes('exposed')) score += 20;

  const riskScore = Math.min(score, 100);

  // 5. Build Advanced Verdict
  let detailedVerdict = "";
  if (riskScore > 70) {
    detailedVerdict = `CRITICAL THREAT: This ${detectedType} is a high-confidence trap. We detected ${triggers.join(', ') || 'patterned deceptive language'}. Interacting with this content could lead to credential theft or malware infection. DELETE IMMEDIATELY.`;
  } else if (riskScore > 30) {
    detailedVerdict = `SUSPICIOUS CONTENT: This ${detectedType} uses aggressive psychological tactics. The links and phrasing are inconsistent with official communications. Proceed with extreme caution and do not provide any personal data.`;
  } else {
    detailedVerdict = `SAFE PROFILE: Analysis confirms this ${detectedType} follows standard, non-deceptive communication patterns. No phishing lures or malicious traps were identified.`;
  }

  return {
    riskScore,
    issues: issues.length > 0 ? issues : ['No structural anomalies detected.'],
    triggers: triggers.length > 0 ? triggers : ['Neutral Phrasing'],
    sentiment: riskScore > 50 ? 'Deceptive' : 'Safe',
    credibility: riskScore > 60 ? 'low' : 'high',
    suggestions: [
      riskScore > 50 ? 'DO NOT CLICK ANY LINKS.' : 'Standard message profile.',
      'Check the actual sender address, not just the name.',
      'If it asks for money or login, it is likely a scam.'
    ],
    summary: riskScore > 75 ? 'DANGEROUS TRAP' : riskScore > 40 ? 'SUSPICIOUS' : 'SECURE CONTENT',
    urls,
    detailedVerdict
  };
}
