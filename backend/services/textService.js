/**
 * Pure local text processing utility service.
 * Handles summary generations, keyword tags extraction, and category matching
 * using 100% free and local rule-based heuristics.
 */

const stopWords = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'about', 'as', 'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'our', 'we', 'you', 'your', 'has', 'have', 'had', 'been', 'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must', 'no', 'not', 'only', 'new', 'latest', 'news', 'update', 'says', 'said', 'report'
]);

/**
 * Generate a short 2-sentence summary locally from description or title.
 */
export const generateSummary = async (title, description) => {
  if (description && description.length > 20) {
    // Strip HTML if any
    const cleanDesc = description.replace(/<[^>]*>/g, '').trim();
    if (cleanDesc.length > 150) {
      // Return first two sentences
      const sentences = cleanDesc.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
      return sentences.slice(0, 2).join('. ') + '.';
    }
    return cleanDesc;
  }
  return `Latest updates: ${title}. Read full coverage in the original article.`;
};

/**
 * Extract 3-5 tags by frequency analysis of title and description.
 */
export const generateTags = async (title, description) => {
  const combinedText = `${title} ${description || ''}`.toLowerCase().replace(/<[^>]*>/g, '');
  const words = combinedText.replace(/[^a-zA-Z\s]/g, '').split(/\s+/);
  const freq = {};
  
  for (const word of words) {
    if (word.length > 3 && !stopWords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  
  // Sort by frequency and return top 4 tags
  return Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, 4);
};

/**
 * Classify category based on title & description keyword lists.
 */
export const classifyCategory = async (title, description, categoriesList) => {
  const combinedText = `${title} ${description || ''}`.toLowerCase().replace(/<[^>]*>/g, '');
  const categoryNames = categoriesList.map(c => c.name);

  // Map category keywords
  const categoryKeywords = {
    'Technology': ['tech', 'software', 'ai', 'cyber', 'google', 'apple', 'microsoft', 'phone', 'chip', 'semiconductor', 'robot', 'app', 'gadget', 'data', 'cloud', 'cybersecurity', 'startup'],
    'Science': ['nasa', 'space', 'astronomy', 'planet', 'mars', 'earth', 'climate', 'research', 'scientific', 'biology', 'physics', 'energy', 'carbon', 'nature'],
    'Sports': ['match', 'cup', 'espn', 'cricket', 'football', 'soccer', 'basketball', 'nba', 'olympics', 'tennis', 'game', 'player', 'league', 'win', 'defeat', 'championship'],
    'Business': ['market', 'stock', 'economy', 'financial', 'inflation', 'trade', 'deal', 'billion', 'company', 'earnings', 'bank', 'ceo', 'shares', 'industry', 'invest'],
    'World': ['global', 'china', 'russia', 'ukraine', 'biden', 'us', 'president', 'summit', 'border', 'un', 'talks', 'nation', 'war', 'peace', 'election'],
    'Entertainment': ['movie', 'film', 'actor', 'hollywood', 'music', 'album', 'song', 'show', 'netflix', 'award', 'celebrity', 'star', 'drama'],
    'Health': ['health', 'medical', 'virus', 'cancer', 'covid', 'study', 'doctor', 'treatment', 'drug', 'vaccine', 'disease', 'wellness', 'diet']
  };

  let bestCategory = categoryNames[0] || 'General';
  let maxScore = -1;

  for (const catName of categoryNames) {
    const keywords = categoryKeywords[catName] || [];
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = combinedText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = catName;
    }
  }

  // Fallback check
  if (maxScore <= 0) {
    const directMatch = categoryNames.find(c => combinedText.includes(c.toLowerCase()));
    if (directMatch) return directMatch;
  }

  return bestCategory;
};
