import { API_KEYS } from '../config/apiKeys';
import { getHistory } from './history';

export interface FactCheck {
  claim: string;
  claimant: string;
  textualRating: string;
  reviewUrl: string;
}

export interface WikiResult {
  title: string;
  extract: string;
  url: string;
}

export interface DomainStats {
  firstSeen: string;
  isNew: boolean;
}

/**
 * 1. Google Fact Check API
 * Searches for existing professional fact checks.
 */
export async function fetchFactCheck(query: string): Promise<FactCheck[]> {
  if (!API_KEYS.GOOGLE_FACT_CHECK) return [];
  try {
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query)}&key=${API_KEYS.GOOGLE_FACT_CHECK}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.claims) return [];
    
    return data.claims.slice(0, 3).map((c: any) => ({
      claim: c.text,
      claimant: c.claimant || 'Unknown',
      textualRating: c.claimReview?.[0]?.textualRating || 'Unrated',
      reviewUrl: c.claimReview?.[0]?.url || ''
    }));
  } catch (e) {
    return [];
  }
}

/**
 * 2. Wikipedia Entity Lookup
 * Checks if mentioned entities have real-world verification.
 */
export async function wikipediaLookup(term: string): Promise<WikiResult | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title,
      extract: data.extract,
      url: data.content_urls.desktop.page
    };
  } catch (e) {
    return null;
  }
}

/**
 * 3. Wayback Machine / Domain Age
 * Checks when a site was first seen on the web.
 */
export async function getDomainAge(domain: string): Promise<DomainStats | null> {
  try {
    const url = `https://archive.org/wayback/available?url=${encodeURIComponent(domain)}`;
    const response = await fetch(url);
    const data = await response.json();
    const timestamp = data.archived_snapshots?.closest?.timestamp;
    
    if (!timestamp) return { firstSeen: 'New/Untrusted', isNew: true };
    
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const date = `${year}-${month}`;
    
    const firstDate = new Date(year, parseInt(month) - 1);
    const now = new Date();
    const monthsOld = (now.getFullYear() - firstDate.getFullYear()) * 12 + (now.getMonth() - firstDate.getMonth());
    
    return {
      firstSeen: date,
      isNew: monthsOld < 6
    };
  } catch (e) {
    return null;
  }
}

/**
 * 4. URL Expander
 * Reveals the true destination of shortened links.
 */
export async function expandUrl(shortUrl: string): Promise<string> {
  try {
    // We use a free unshorten API
    const response = await fetch(`https://unshorten.me/json/${encodeURIComponent(shortUrl)}`);
    const data = await response.json();
    return data.resolved_url || shortUrl;
  } catch (e) {
    return shortUrl;
  }
}

/**
 * 5. Duplicate Claim Detector
 * Compares against local history to catch spam/coordinated attacks.
 */
export async function checkDuplicates(text: string): Promise<number> {
  try {
    const history = await getHistory();
    const normalized = text.toLowerCase().substring(0, 100);
    const count = history.filter(item => 
      item.message.toLowerCase().includes(normalized)
    ).length;
    return count;
  } catch (e) {
    return 0;
  }
}
