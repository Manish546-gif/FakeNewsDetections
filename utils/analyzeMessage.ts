import { AnalysisResult } from '../types';

/**
 * Total Security & Truth Engine V9 — Calibrated Multi-Feature Analyzer
 * ─────────────────────────────────────────────────────────────────────
 * Design goals:
 *  1. No false 100%s — genuine neutral text scores 0–15%
 *  2. Phrase specificity — multi-word patterns outweigh single words
 *  3. Structural features — caps ratio, punctuation, URL density
 *  4. Category boosting — detected type amplifies relevant vectors
 *  5. Calibrated output — score mapped to a meaningful scale
 */

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pattern {
  regex: RegExp;
  label: string;
  points: number;    // raw points — NOT cumulative, ONE match = ONE award
  description: string;
}

// ─── 1. Auto-Classifier ───────────────────────────────────────────────────────
function classify(msg: string): 'email' | 'sms' | 'news' {
  const l = msg.toLowerCase();

  const emailSignals =
    (l.includes('subject:') ? 2 : 0) +
    (l.includes('dear sir') || l.includes('dear madam') || l.includes('dear friend') ? 2 : 0) +
    (l.includes('@') ? 1 : 0) +
    (/sincerely|regards|yours faithfully/i.test(l) ? 1 : 0) +
    (l.includes('kindly') ? 1 : 0);

  const smsSignals =
    (msg.length < 250 ? 1 : 0) +
    (/\d{4,6}/.test(msg) ? 1 : 0) +          // shortcodes
    (l.includes('txt') || l.includes('sms') ? 1 : 0) +
    (l.includes('reply stop') || l.includes('opt out') ? 2 : 0) +
    (l.includes('free msg') ? 2 : 0);

  if (emailSignals >= 3) return 'email';
  if (smsSignals >= 3) return 'sms';
  return 'news';
}

// ─── 2. Pattern Banks ─────────────────────────────────────────────────────────

// HIGH SPECIFICITY — very unlikely in legitimate content (multi-word phrases)
const HIGH_SPECIFICITY: Pattern[] = [
  {
    regex: /next of kin|dormant account|unclaimed funds|swiss bank account/i,
    label: 'Inheritance Fraud Phrase',
    points: 60,
    description: 'Classic "Nigerian Prince" inheritance scam language from fraud_email dataset.',
  },
  {
    regex: /financial (dispute|predicament|crisis) .{0,40}(contact|assist|transfer)/i,
    label: 'Fund Transfer Solicitation',
    points: 55,
    description: 'Requests financial cooperation using a fabricated crisis — a fraud hallmark.',
  },
  {
    regex: /(std|standard) (txt|sms) rate|\d{5} to (win|claim|enter)/i,
    label: 'Premium SMS Exploitation',
    points: 55,
    description: 'Shortcode pattern from spam.csv used to charge victims via hidden SMS fees.',
  },
  {
    regex: /you (have been selected|are the (lucky|chosen)|won.*prize)/i,
    label: 'Fake Prize Announcement',
    points: 58,
    description: 'Lottery/winner scam trigger — no legitimate competition contacts you unsolicited.',
  },
  {
    regex: /(account (will be|is being|has been) (blocked|suspended|terminated|frozen))/i,
    label: 'Account Suspension Threat',
    points: 55,
    description: 'Phishing tactic — real services never threaten suspension via unsolicited messages.',
  },
  {
    regex: /verify your (identity|account|details|credentials) (immediately|now|urgently)/i,
    label: 'Credential Harvesting Demand',
    points: 58,
    description: 'Credential theft request with artificial urgency — a top phishing pattern.',
  },
  {
    regex: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
    label: 'Direct IP Address Link',
    points: 65,
    description: 'Legitimate websites use domain names. IP-based URLs are a strong malware indicator.',
  },
  {
    regex: /(googl?e|faceb|amazon|paypal|micros?oft)[^a-zA-Z][^\s]*\.(tk|ml|ga|cf|gq|xyz|top|club|click|work)/i,
    label: 'Brand Impersonation with Suspicious TLD',
    points: 60,
    description: 'A trusted brand name paired with a high-risk free/disposable top-level domain.',
  },
  {
    regex: /https?:\/\/[^\s]*\.(apk|exe|scr|bat|cmd|vbs|jar)\b/i,
    label: 'Malware File Link',
    points: 70,
    description: 'Link points directly to an executable file — extreme malware risk.',
  },
  {
    regex: /(double|multiply|triple) your (money|investment|bitcoin|crypto)/i,
    label: 'Investment Fraud Promise',
    points: 60,
    description: 'Guaranteed return promises are categorically fraudulent — no exception.',
  },
  {
    regex: /share (this|before it'?s? deleted|before removal|before (they|government) (ban|remove|delete))/i,
    label: 'Engineered Virality Trigger',
    points: 45,
    description: 'Instructs sharing before fake "censorship" — designed to spread misinformation.',
  },
  {
    regex: /they (don.t|do not|won.t) want you to (know|see|hear|find out)/i,
    label: 'Conspiracy Framing',
    points: 45,
    description: 'Manufactured insider narrative designed to create distrust of authoritative sources.',
  },
];

// MEDIUM SPECIFICITY — suspicious in context, but can appear in legitimate content
const MED_SPECIFICITY: Pattern[] = [
  {
    regex: /\bWINNER\b|\bFREE\b.{0,20}\b(prize|gift|reward|cash)\b/i,
    label: 'Prize / Free Offer',
    points: 22,
    description: 'Unsolicited prize or "free" offer language consistent with spam datasets.',
  },
  {
    regex: /(urgent|urgently|immediately).{0,40}(click|reply|contact|call|send)/i,
    label: 'Urgency + Action Combo',
    points: 24,
    description: 'Urgency combined with a call-to-action is a primary psychological manipulation tactic.',
  },
  {
    regex: /(claim|collect).{0,30}(now|today|immediately|before it expires)/i,
    label: 'Time-Pressured Claim',
    points: 22,
    description: 'Artificial expiry pressure designed to prevent rational decision-making.',
  },
  {
    regex: /confidential(ity)?.{0,50}(assistance|co-?operation|secrecy)/i,
    label: 'Confidentiality Pressure',
    points: 20,
    description: 'Demanding secrecy prevents victims from seeking outside advice — a fraud red flag.',
  },
  {
    regex: /(your (package|parcel|shipment|delivery) (has been|is) (held|failed|waiting))/i,
    label: 'Fake Delivery Notification',
    points: 22,
    description: 'Package scam pattern — links to credential-phishing or payment fraud pages.',
  },
  {
    regex: /\b(bitcoin|ethereum|crypto).{0,40}(earn|profit|invest|doubl)/i,
    label: 'Crypto Investment Lure',
    points: 24,
    description: 'Cryptocurrency investment pitch — extremely high correlation with scam content.',
  },
  {
    regex: /(sources say|officials claim|insiders reveal|according to unnamed)/i,
    label: 'Unverifiable Source Citation',
    points: 20,
    description: 'Vague attribution without specific names or institutions — fake news hallmark.',
  },
  {
    regex: /(exclusive|secret|leaked|bombshell|explosive).{0,30}(reveal|expose|truth|proof)/i,
    label: 'Sensationalist Reveal Language',
    points: 22,
    description: 'Clickbait narrative framing creates false sense of insider information.',
  },
  {
    regex: /transfer.{0,30}(million|thousand).{0,20}(dollar|usd|gbp|euro)/i,
    label: 'Large Sum Transfer Request',
    points: 28,
    description: 'Large monetary transfers are a consistent marker across all fraud email samples.',
  },
];

// LOW SPECIFICITY — weak signals, counted only for density scoring
const LOW_SPECIFICITY: Pattern[] = [
  { regex: /!{2,}/g, label: 'Excessive Exclamation', points: 8, description: 'Multiple exclamation marks signal low-quality or emotional content.' },
  { regex: /\bfree\b/gi, label: 'Free Offer', points: 5, description: 'Overuse of "free" is a classic spam indicator.' },
  { regex: /\b(click here|click now|click below)\b/gi, label: 'Generic CTA', points: 10, description: 'Generic call-to-action phrasing common in phishing emails.' },
  { regex: /\b(guaranteed|100%).{0,20}(results|returns|profit|success)\b/i, label: 'Guarantee Claim', points: 12, description: 'Guaranteed results claims are almost universally fraudulent.' },
  { regex: /\bact (now|fast|immediately|quickly)\b/i, label: 'Urgency Trigger', points: 8, description: 'Time pressure designed to override cautious thinking.' },
];

// TRUST REDUCERS — penalty for credible signals
const TRUST_REDUCERS: Array<{ regex: RegExp; reduction: number; label: string }> = [
  { regex: /reuters\.com|apnews\.com|bbc\.co?\.uk|ndtv\.com|thehindu\.com/i, reduction: 30, label: 'Credible Domain Reference' },
  { regex: /(according to the (official|published) (report|study|data|statement))/i, reduction: 20, label: 'Official Report Citation' },
  { regex: /(peer.reviewed|published in .{0,30}journal|national institute|government report)/i, reduction: 25, label: 'Academic / Gov Citation' },
  { regex: /\b(no action required|for your information|fyi)\b/i, reduction: 10, label: 'Non-Action Request' },
];

// ─── 3. Structural Feature Analyzer ──────────────────────────────────────────
function analyzeStructure(msg: string): number {
  let structureScore = 0;
  const words = msg.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length || 1;

  // ALL CAPS ratio — legitimate writing rarely exceeds 10%
  const capsWords = words.filter(w => /^[A-Z]{3,}$/.test(w)).length;
  const capsRatio = capsWords / totalWords;
  if (capsRatio > 0.4) structureScore += 25;
  else if (capsRatio > 0.25) structureScore += 15;
  else if (capsRatio > 0.1) structureScore += 5;

  // Exclamation density — higher threshold to avoid penalizing standard news
  const exclamations = (msg.match(/!/g) || []).length;
  const exclamRatio = exclamations / totalWords;
  if (exclamRatio > 0.15) structureScore += 20;
  else if (exclamRatio > 0.08) structureScore += 10;

  // URL count relative to message length
  const urls = (msg.match(/https?:\/\//gi) || []).length;
  if (urls > 3) structureScore += 15;
  else if (urls > 1) structureScore += 5;

  // Currency + number combinations (transfer amount patterns)
  const currencyPattern = /\$[\d,]+|\d+[\s]*(million|thousand|billion)/gi;
  const currencyMatches = (msg.match(currencyPattern) || []).length;
  if (currencyMatches >= 2) structureScore += 20;

  // Broken/formal English patterns seen in fraud dataset
  const brokenEnglish = /(i am the son of|i presume you are aware|kindly revert|do the needful|remit the sum)/i;
  if (brokenEnglish.test(msg)) structureScore += 30;

  return Math.min(structureScore, 50); // cap structural contribution at 50
}

// ─── 4. Main Engine ────────────────────────────────────────────────────────────
export function analyzeMessage(message: string): AnalysisResult {
  if (!message || message.trim().length === 0) {
    return emptyResult();
  }

  const msgType = classify(message);
  const urls = message.match(/(https?:\/\/[^\s]+)/gi) || [];

  let rawScore = 0;
  const foundIssues: string[] = [];
  const foundTriggers: string[] = [];

  // ── Scan high specificity patterns (each fires once) ──
  HIGH_SPECIFICITY.forEach(p => {
    p.regex.lastIndex = 0;
    if (p.regex.test(message)) {
      rawScore += p.points;
      foundTriggers.push(p.label);
      foundIssues.push(p.description);
    }
    p.regex.lastIndex = 0;
  });

  // ── Scan medium specificity patterns ──
  MED_SPECIFICITY.forEach(p => {
    p.regex.lastIndex = 0;
    if (p.regex.test(message)) {
      rawScore += p.points;
      foundTriggers.push(p.label);
      foundIssues.push(p.description);
    }
    p.regex.lastIndex = 0;
  });

  // ── Scan low specificity patterns (capped at 3 contributions) ──
  let lowContrib = 0;
  LOW_SPECIFICITY.forEach(p => {
    p.regex.lastIndex = 0;
    if (p.regex.test(message) && lowContrib < 3) {
      rawScore += p.points;
      foundTriggers.push(p.label);
      foundIssues.push(p.description);
      lowContrib++;
    }
    p.regex.lastIndex = 0;
  });

  // ── Structural analysis ──
  rawScore += analyzeStructure(message);

  // ── Trust reductions ──
  let reductionTotal = 0;
  TRUST_REDUCERS.forEach(r => {
    r.regex.lastIndex = 0;
    if (r.regex.test(message)) {
      reductionTotal += r.reduction;
    }
    r.regex.lastIndex = 0;
  });
  rawScore -= reductionTotal;

  // ── Category boost — amplify the most relevant vector ──
  if (msgType === 'email') {
    // Phishing patterns matter more for emails
    const phishingBoost = foundTriggers.filter(t =>
      ['Inheritance Fraud Phrase', 'Fund Transfer Solicitation', 'Account Suspension Threat',
      'Credential Harvesting Demand', 'Confidentiality Pressure', 'Large Sum Transfer Request',
      'Personal Data Harvesting'].includes(t)
    ).length * 5;
    rawScore += phishingBoost;
  } else if (msgType === 'sms') {
    const smsBoost = foundTriggers.filter(t =>
      ['Premium SMS Exploitation', 'Fake Prize Announcement', 'Fake Delivery Notification',
      'Prize / Free Offer', 'Time-Pressured Claim'].includes(t)
    ).length * 5;
    rawScore += smsBoost;
  }

  // ── Calibrate to 0–100 scale ──
  // Modified calibration: Lower the floor, sharpen the curve
  // subtract a baseline threshold (12) to ensure clean news hits 0%
  let calibrated = Math.round(Math.max(0, Math.min(((rawScore - 12) / 1.4), 100)));
  
  // Force clean score if no triggers matched and structural was low
  if (foundTriggers.length === 0 && rawScore < 15) {
    calibrated = 0;
  }

  // ── Build unique verdict ──
  const topFlags = foundTriggers.slice(0, 3).join(', ');
  const typeLabel = msgType === 'email' ? 'Email' : msgType === 'sms' ? 'SMS/Text Message' : 'News/Social Content';

  let detailedVerdict = '';
  let summary = '';

  if (calibrated >= 75) {
    summary = '⛔ HIGH RISK — DO NOT ENGAGE';
    detailedVerdict = `CRITICAL: This ${typeLabel} matches ${foundTriggers.length} high-confidence threat pattern${foundTriggers.length !== 1 ? 's' : ''}. Primary indicators: ${topFlags}. This content exhibits coordinated deceptive characteristics consistent with known fraud and scam campaigns from our training datasets. DELETE and report this content immediately. Do not click links, reply, or provide any information.`;
  } else if (calibrated >= 50) {
    summary = '⚠️ SUSPICIOUS — VERIFY BEFORE ACTING';
    detailedVerdict = `WARNING: This ${typeLabel} contains ${foundTriggers.length} suspicious pattern${foundTriggers.length !== 1 ? 's' : ''} including ${topFlags}. While not confirmed fraudulent, the communication style and content structure are inconsistent with legitimate messaging. Do not share personal details or click links until independently verified via an official channel.`;
  } else if (calibrated >= 20) {
    summary = '🔍 LOW RISK — MINOR SIGNALS DETECTED';
    detailedVerdict = `CAUTION: ${foundTriggers.length > 0 ? `This ${typeLabel} contains ${foundTriggers.length} minor indicator${foundTriggers.length !== 1 ? 's' : ''} (${topFlags}). These are low-weight signals and likely benign, but` : `This ${typeLabel} is broadly safe, however`} exercise standard caution — especially if this message arrived unexpectedly.`;
  } else {
    summary = '✅ SECURE — NO THREATS DETECTED';
    detailedVerdict = `CLEAR: Full analysis of this ${typeLabel} found no known misinformation markers, phishing lures, or scam patterns. The linguistic structure, phrasing, and content are consistent with authentic, trustworthy communication.`;
  }

  return {
    riskScore: calibrated,
    issues: foundIssues.length > 0 ? foundIssues : ['No known threat patterns matched.'],
    triggers: foundTriggers.length > 0 ? foundTriggers : ['No flags raised'],
    sentiment: calibrated > 50 ? 'Deceptive' : calibrated > 20 ? 'Suspicious' : 'Neutral',
    credibility: calibrated > 60 ? 'low' : calibrated > 30 ? 'medium' : 'high',
    suggestions: buildSuggestions(calibrated, msgType, foundTriggers),
    summary,
    urls,
    detailedVerdict,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildSuggestions(score: number, type: string, triggers: string[]): string[] {
  const suggestions: string[] = [];

  if (type === 'email') {
    suggestions.push('Check the actual sender email address, not just the display name.');
    if (score > 40) suggestions.push('Never click "Verify Account" links in unsolicited emails.');
  } else if (type === 'sms') {
    suggestions.push('Legitimate couriers never ask for payment via SMS link.');
    if (score > 40) suggestions.push('Never text shortcodes from unsolicited messages — you may be charged.');
  } else {
    suggestions.push('Cross-check this headline on Google News or Reuters.');
    if (score > 40) suggestions.push('Search the exact claim on Snopes.com or FactCheck.org.');
  }

  if (triggers.includes('Malware File Link') || triggers.includes('Direct IP Address Link')) {
    suggestions.push('⛔ DO NOT OPEN THE LINK — it may install malware on your device.');
  }

  if (suggestions.length < 3) {
    suggestions.push('If in doubt, verify via the official website directly (not via the provided link).');
  }

  return suggestions;
}

function emptyResult(): AnalysisResult {
  return {
    riskScore: 0,
    issues: ['No content provided for analysis.'],
    triggers: [],
    sentiment: 'Neutral',
    credibility: 'high',
    suggestions: ['Please paste the news, email, or message you want to scan.'],
    summary: '— AWAITING INPUT —',
    urls: [],
    detailedVerdict: 'No content was provided. Paste the full message, email, or headline into the input field above.',
  };
}
