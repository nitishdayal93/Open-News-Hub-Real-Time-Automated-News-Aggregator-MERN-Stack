import { GoogleGenAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

let genAI = null;
let model = null;

const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  try {
    // Note: In newer @google/generative-ai versions, initialization is:
    // const genAI = new GoogleGenAI({ apiKey: ... });
    // Let's support standard initialization:
    genAI = new GoogleGenAI({ apiKey });
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.error('Failed to initialize Gemini AI SDK:', error.message);
  }
}

/**
 * Clean and parse JSON block from Gemini output.
 */
const cleanJSON = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse JSON response: ' + text);
  }
};

/**
 * Generate a short summary for an article.
 */
export const generateSummary = async (title, description, content) => {
  const textToAnalyze = `${title}\n\n${description || ''}\n\n${content || ''}`.trim();
  
  if (model) {
    try {
      const prompt = `Write a concise 2-3 sentence summary (under 60 words) for the following news article. Provide ONLY the summary text, no introduction or quotes.\n\nArticle:\n${textToAnalyze}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API generateSummary error:', error.message);
      // Fallback below
    }
  }

  // Robust heuristic fallback
  return fallbackSummary(title, description);
};

/**
 * Generate 3-5 tags for an article.
 */
export const generateTags = async (title, description, content) => {
  const textToAnalyze = `${title}\n\n${description || ''}\n\n${content || ''}`.trim();

  if (model) {
    try {
      const prompt = `Analyze this news article and return 3 to 5 relevant keyword tags. Return the result strictly as a JSON array of strings. Do not include markdown code block syntax.\n\nArticle:\n${textToAnalyze}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      const tags = cleanJSON(text);
      if (Array.isArray(tags)) {
        return tags.map(t => t.toLowerCase().trim()).slice(0, 5);
      }
    } catch (error) {
      console.error('Gemini API generateTags error:', error.message);
      // Fallback below
    }
  }

  // Robust heuristic fallback
  return fallbackTags(title, description);
};

/**
 * Classify article into one of the database categories.
 */
export const classifyCategory = async (title, description, categoriesList) => {
  const textToAnalyze = `${title}\n\n${description || ''}`.trim();
  const categoryNames = categoriesList.map(c => c.name);

  if (model) {
    try {
      const prompt = `Analyze this news article and classify it into exactly one of these categories: ${JSON.stringify(categoryNames)}. Return only the category name, exactly as spelled in the list, with no other punctuation.\n\nArticle:\n${textToAnalyze}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const category = response.text().trim();
      const matched = categoryNames.find(c => c.toLowerCase() === category.toLowerCase());
      if (matched) return matched;
    } catch (error) {
      console.error('Gemini API classifyCategory error:', error.message);
      // Fallback below
    }
  }

  // Robust heuristic fallback
  return fallbackClassify(title, description, categoryNames);
};

// --- Fallback Implementations ---

function fallbackSummary(title, description) {
  if (description && description.length > 20) {
    // Strip HTML if any
    const cleanDesc = description.replace(/<[^>]*>/g, '').trim();
    if (cleanDesc.length > 150) {
      return cleanDesc.split('.').slice(0, 2).join('.') + '.';
    }
    return cleanDesc;
  }
  return `An article discussing: ${title}. Learn more details in the main article body.`;
}

function fallbackTags(title, description) {
  const combined = `${title} ${description || ''}`.toLowerCase();
  // Filter out common stopwords
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'about', 'as', 'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'our', 'we', 'you', 'your', 'has', 'have', 'had', 'been', 'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must', 'no', 'not', 'only', 'new', 'latest', 'news', 'update', 'says', 'said', 'report'
  ]);
  
  const words = combined.replace(/[^a-zA-Z\s]/g, '').split(/\s+/);
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
}

function fallbackClassify(title, description, categoryNames) {
  const combined = `${title} ${description || ''}`.toLowerCase();
  
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
      const matches = combined.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = catName;
    }
  }

  // Fallback to General if no keywords matched
  if (maxScore === 0) {
    // Try to match category name directly
    const directMatch = categoryNames.find(c => combined.includes(c.toLowerCase()));
    if (directMatch) return directMatch;
  }

  return bestCategory;
}
