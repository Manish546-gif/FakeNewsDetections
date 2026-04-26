import { AnalysisResult } from '../types';

/**
 * Total Security & Truth Engine (V8 - Universal Scan)
 * ---------------------------------------------------
 * ALL patterns are scanned on EVERY message.
 * Classification is used only for labeling the report.
 */

// ─── Classifier ────────────────────────────────────────
function classifyMessage(message: string): string {
  const lower = message.toLowerCase();
  const isEmail =
    lower.includes('subject:') ||
    lower.includes('dear sir') ||
    lower.includes('dear madam') ||
    lower.includes('sincerely') ||
    lower.includes('next of kin') ||
    lower.includes('@') && lower.includes('bank');
  const isSMS =
    message.length < 300 &&
    (lower.includes('free msg') ||
      lower.includes('txt') ||
      lower.includes('std rate') ||
      lower.includes('opt out') ||
      lower.includes('reply stop'));
  if (isEmail) return 'Phishing Email';
  if (isSMS) return 'SMS Scam';
  return 'News / Message';
}

// ─── Red Flag Definitions ───────────────────────────────
const RED_FLAGS = [
  // --- Fake News Markers ---
  {
    label: 'Sensationalist Language',
    pattern: /(SHOCKING|EXPOSED|UNBELIEVABLE|YOU WON'T BELIEVE|MUST SEE|BREAKING|BOMBSHELL)/gi,
    weight: 20,
    msg: 'Uses emotionally charged clickbait words designed to bypass critical thinking.',
    category: 'Fake News',
  },
  {
    label: 'Vague Source Attribution',
    pattern: /(officials say|sources claim|people are saying|experts believe|insiders reveal)/gi,
    weight: 18,
    msg: 'Makes claims without citing specific, verifiable sources or institutions.',
    category: 'Fake News',
  },
  {
    label: 'Urgency / Fear Bias',
    pattern: /(act now|share before deleted|limited time|they don't want you to know|censored|banned)/gi,
    weight: 22,
    msg: 'Creates a false sense of urgency or censorship to pressure immediate action.',
    category: 'Fake News',
  },
  {
    label: 'Aggressive Capitalization',
    pattern: /\b([A-Z]{5,})\b/g,
    weight: 12,
    msg: '"Shouting" text is a common tactic in low-credibility misinformation.',
    category: 'Fake News',
  },

  // --- Email Phishing Markers ---
  {
    label: 'Account Threat Lure',
    pattern: /(your account (has been|will be) (blocked|suspended|terminated|frozen)|verify your account|confirm your identity)/gi,
    weight: 28,
    msg: 'Classic credential theft trigger — real services never demand this over email.',
    category: 'Phishing',
  },
  {
    label: 'Urgency Deadline',
    pattern: /(within 24 hours|action required|final notice|immediately or|your access will)/gi,
    weight: 25,
    msg: 'Artificial deadline pressure is the #1 phishing manipulation tactic.',
    category: 'Phishing',
  },
  {
    label: 'Inheritance / Fund Transfer Scam',
    pattern: /(next of kin|dormant account|late president|unclaimed funds|transfer.*million|beneficiary|swiss bank|bank of africa)/gi,
    weight: 40,
    msg: 'Classic "Nigerian Prince" inheritance fraud pattern from fraud_email dataset.',
    category: 'Phishing',
  },
  {
    label: 'Suspicious Confidentiality Request',
    pattern: /(treat.*secrecy|confidential.*assistance|utmost confidence|do not disclose)/gi,
    weight: 30,
    msg: 'Fraudsters ask for secrecy to prevent victims from seeking advice.',
    category: 'Phishing',
  },
  {
    label: 'Personal Data Harvesting',
    pattern: /(your full name|your bank account|your mobile number|send.*details|forward.*information)/gi,
    weight: 32,
    msg: 'Directly soliciting personal data — a hallmark of identity theft operations.',
    category: 'Phishing',
  },

  // --- SMS / Trap Markers ---
  {
    label: 'Prize / Lottery Trap',
    pattern: /(you have (won|been selected)|claim your prize|prize reward|lottery winner|gift card|chosen.*winner)/gi,
    weight: 35,
    msg: 'Fake prize alerts from spam.csv — designed to steal info or premium SMS charges.',
    category: 'Trap',
  },
  {
    label: 'SMS Shortcode Exploitation',
    pattern: /(txt.*to \d{4,6}|text.*\d{4,6}|std (txt|sms) rate|call \d{10,}|claim code)/gi,
    weight: 30,
    msg: 'Shortcode exploitation harvests premium SMS charges from unsuspecting victims.',
    category: 'Trap',
  },
  {
    label: 'Delivery / Package Scam',
    pattern: /(your (package|parcel|delivery) (is|has)|fedex|dhl|failed delivery|reschedule.*delivery)/gi,
    weight: 28,
    msg: 'Fake delivery notifications phish for address, credit card, and login data.',
    category: 'Trap',
  },
  {
    label: 'Investment / Crypto Scam',
    pattern: /(guaranteed (profit|return)|double your (money|investment)|easy (profit|money)|bitcoin.*earn|passive income.*crypto)/gi,
    weight: 35,
    msg: 'Investment fraud pattern — no legitimate investment guarantees returns.',
    category: 'Trap',
  },

  // --- URL / Link Safety ---
  {
    label: 'Direct IP Address Link',
    pattern: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/gi,
    weight: 45,
    msg: 'Legitimate websites use domain names, not raw IP addresses.',
    category: 'URL Threat',
  },
  {
    label: 'Typosquatting Domain',
    pattern: /(googIe\.|faceb0ok\.|paypa1\.|arnazon\.|micros0ft\.)/gi,
    weight: 50,
    msg: 'Domain mimics a trusted brand with subtle letter substitutions.',
    category: 'URL Threat',
  },
  {
    label: 'Executable / Malicious File Link',
    pattern: /https?:\/\/\S+\.(apk|exe|zip|rar|bat|scr)/gi,
    weight: 50,
    msg: 'Link points to an executable file — extremely high malware risk.',
    category: 'URL Threat',
  },
];

// ─── Trust Score Reducers ───────────────────────────────
const TRUST_REDUCERS = [
  { pattern: /(reuters|associated press|bbc\.com|ap news|ndtv\.com)/gi, weight: -25 },
  { pattern: /(according to the official statement|government press release)/gi, weight: -20 },
];

// ─── Main Analyzer ──────────────────────────────────────
export function analyzeMessage(message: string): AnalysisResult {
  const urls = message.match(/(https?:\/\/[^\s]+)/gi) || [];
  let score = 0;
  const foundIssues: string[] = [];
  const foundTriggers: string[] = [];

  // Scan ALL red flags on every message
  RED_FLAGS.forEach(flag => {
    if (flag.pattern.test(message)) {
      score += flag.weight;
      foundTriggers.push(`[${flag.category}] ${flag.label}`);
      foundIssues.push(flag.msg);
    }
    flag.pattern.lastIndex = 0; // reset stateful regex
  });

  // Apply trust reducers
  TRUST_REDUCERS.forEach(r => {
    if (r.pattern.test(message)) score += r.weight;
    r.pattern.lastIndex = 0;
  });

  const riskScore = Math.max(0, Math.min(Math.round(score), 100));
  const detectedType = classifyMessage(message);

  // Build a unique, descriptive verdict
  let detailedVerdict = '';
  const topFlags = foundTriggers.slice(0, 3).join(', ');

  if (riskScore >= 70) {
    detailedVerdict = `⚠️ HIGH RISK DETECTED: This ${detectedType} matches ${foundTriggers.length} known threat pattern${foundTriggers.length !== 1 ? 's' : ''}. Key triggers: ${topFlags || 'multiple deceptive signals'}. This content exhibits strong characteristics of a deliberate deception campaign. DO NOT interact, click links, or share personal information.`;
  } else if (riskScore >= 35) {
    detailedVerdict = `⚡ SUSPICIOUS CONTENT: This ${detectedType} shows ${foundTriggers.length} warning sign${foundTriggers.length !== 1 ? 's' : ''} including ${topFlags || 'ambiguous phrasing'}. While not definitively fraudulent, the patterns used are inconsistent with trustworthy communication. Verify with an independent source before taking any action.`;
  } else if (riskScore > 0) {
    detailedVerdict = `🔍 MINOR SIGNALS: This ${detectedType} contains ${foundTriggers.length} low-weight indicator${foundTriggers.length !== 1 ? 's' : ''}. Overall profile is low-risk but exercise normal caution — especially if this message was unexpected.`;
  } else {
    detailedVerdict = `✅ CLEAN PROFILE: No known misinformation, phishing, or scam markers were detected in this ${detectedType}. The linguistic structure is consistent with authentic, non-deceptive communication.`;
  }

  return {
    riskScore,
    issues: foundIssues.length > 0 ? foundIssues : ['No known threat patterns detected.'],
    triggers: foundTriggers.length > 0 ? foundTriggers : ['No flags raised'],
    sentiment: riskScore > 50 ? 'Deceptive' : riskScore > 20 ? 'Suspicious' : 'Neutral',
    credibility: riskScore > 60 ? 'low' : riskScore > 30 ? 'medium' : 'high',
    suggestions: [
      riskScore > 50
        ? 'Do NOT click any links or provide personal info.'
        : 'Exercise standard caution — verify unexpected claims.',
      'Check if a recognized outlet or official source has reported this.',
      'If asking for money or credentials, treat as fraudulent.',
    ],
    summary:
      riskScore >= 70
        ? 'DANGEROUS — HIGH RISK'
        : riskScore >= 35
        ? 'SUSPICIOUS CONTENT'
        : riskScore > 0
        ? 'LOW RISK'
        : 'SECURE CONTENT',
    urls,
    detailedVerdict,
  };
}
