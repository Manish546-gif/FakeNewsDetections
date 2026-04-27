/**
 * Live News Cross-Reference Service
 * -----------------------------------
 * Queries Google News RSS (free, no API key) to find real news
 * articles matching the user's input. Results are used to:
 *  - Display corroborating sources
 *  - Adjust credibility score up/down based on what's found
 */

export interface NewsArticle {
  title: string;
  source: string;
  link: string;
  pubDate: string;
  snippet: string;
}

export interface NewsCheckResult {
  articles: NewsArticle[];
  credibleSourcesFound: number;
  topicVerified: boolean;
  scoreAdjustment: number; // negative = lowers risk, positive = raises risk
  status: 'found' | 'not_found' | 'offline' | 'error';
}

// Trusted news domains - finding these reduces risk score
const CREDIBLE_DOMAINS = [
  'reuters.com', 'apnews.com', 'bbc.co.uk', 'bbc.com',
  'ndtv.com', 'thehindu.com', 'hindustantimes.com',
  'theguardian.com', 'nytimes.com', 'washingtonpost.com',
  'aljazeera.com', 'cnn.com', 'abcnews.go.com',
  'timesofindia.com', 'indianexpress.com', 'livemint.com',
  'bloomberg.com', 'ft.com', 'economist.com',
];

// Known misinformation/tabloid domains - finding these raises risk
const LOW_CREDIBILITY_DOMAINS = [
  'beforeitsnews.com', 'worldnewsdailyreport.com', 'empirenews.net',
  'newsbreaker.info', 'theonion.com', 'babylonbee.com',
  'nationalreport.net', 'neonnettle.com',
];

/**
 * Extract the top 5-8 keywords from a message for the search query
 */
function extractSearchQuery(message: string): string {
  // Remove URLs and special characters
  const cleaned = message
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our',
  ]);

  const words = cleaned.split(' ')
    .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()))
    .slice(0, 7); // top 7 keywords

  return words.join(' ');
}

/**
 * Parse Google News RSS XML response manually (no XML library needed)
 */
function parseRSS(xml: string): NewsArticle[] {
  const articles: NewsArticle[] = [];

  // Extract <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && articles.length < 5) {
    const item = match[1];

    const title = extractTag(item, 'title');
    const link = extractTag(item, 'link');
    const pubDate = extractTag(item, 'pubDate');
    const description = extractTag(item, 'description');

    // Extract source from title - Google News format: "Title - Source Name"
    const titleParts = title.split(' - ');
    const cleanTitle = titleParts.slice(0, -1).join(' - ') || title;
    const source = titleParts[titleParts.length - 1] || 'Unknown Source';

    // Extract snippet from description (strip HTML)
    const snippet = description
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
      .substring(0, 120);

    if (cleanTitle && cleanTitle.length > 5) {
      articles.push({
        title: cleanTitle,
        source,
        link,
        pubDate: formatDate(pubDate),
        snippet: snippet || 'No preview available.',
      });
    }
  }

  return articles;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = regex.exec(xml);
  return (match?.[1] || match?.[2] || '').trim();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Unknown date';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Main function — searches Google News RSS for the given message
 */
export async function checkCurrentNews(message: string): Promise<NewsCheckResult> {
  const query = extractSearchQuery(message);

  if (!query || query.trim().length < 5) {
    return {
      articles: [],
      credibleSourcesFound: 0,
      topicVerified: false,
      scoreAdjustment: 0,
      status: 'not_found',
    };
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    // Use a CORS proxy approach for mobile - Google News RSS works directly on mobile (no CORS)
    const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { articles: [], credibleSourcesFound: 0, topicVerified: false, scoreAdjustment: 0, status: 'error' };
    }

    const xml = await response.text();
    const articles = parseRSS(xml);

    if (articles.length === 0) {
      return { articles: [], credibleSourcesFound: 0, topicVerified: false, scoreAdjustment: 0, status: 'not_found' };
    }

    // Score the results
    let credibleCount = 0;
    let lowCredCount = 0;

    articles.forEach(article => {
      const articleLower = (article.link + article.source).toLowerCase();
      if (CREDIBLE_DOMAINS.some(d => articleLower.includes(d))) credibleCount++;
      if (LOW_CREDIBILITY_DOMAINS.some(d => articleLower.includes(d))) lowCredCount++;
    });

    // Score adjustment: credible sources reduce risk, low-credibility raise it
    const scoreAdjustment = (credibleCount * -10) + (lowCredCount * 15);

    return {
      articles,
      credibleSourcesFound: credibleCount,
      topicVerified: credibleCount > 0,
      scoreAdjustment,
      status: 'found',
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return { articles: [], credibleSourcesFound: 0, topicVerified: false, scoreAdjustment: 0, status: 'offline' };
    }
    return { articles: [], credibleSourcesFound: 0, topicVerified: false, scoreAdjustment: 0, status: 'error' };
  }
}
