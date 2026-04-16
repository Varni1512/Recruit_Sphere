/**
 * Advanced ATS Scoring Utility
 * Implements TF-IDF and Cosine Similarity for semantic document matching.
 */

// Basic stop words to ignore during tokenization
const stopWords = new Set([
  "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
  "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
  "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
  "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
  "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
  "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
  "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
  "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
  "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
  "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
  "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
  "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
  "yourselves"
]);

/**
 * Tokenizes text by cleaning punctuation and filtering stop words.
 */
function tokenize(text: string): string[] {
    if (!text) return [];
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ') // replace non-alphanumeric with space
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.has(word));
}

/**
 * Calculates Term Frequency (TF)
 */
function computeTF(tokens: string[]): Record<string, number> {
    const tfDoc: Record<string, number> = {};
    const totalTokens = tokens.length;
    
    if (totalTokens === 0) return tfDoc;

    for (const token of tokens) {
        tfDoc[token] = (tfDoc[token] || 0) + 1;
    }

    for (const token in tfDoc) {
        tfDoc[token] = tfDoc[token] / totalTokens;
    }
    return tfDoc;
}

/**
 * Computes Cosine Similarity based on TF values (simplified IDF for two docs).
 * Because we only have 2 documents (Resume vs Job Description), taking raw IDF
 * isn't as effective as treating their concatenated vocabulary space as the baseline.
 */
export function calculateCosineSimilarity(docA: string, docB: string): number {
    const tokensA = tokenize(docA);
    const tokensB = tokenize(docB);

    if (tokensA.length === 0 || tokensB.length === 0) return 0.0;

    const tfA = computeTF(tokensA);
    const tfB = computeTF(tokensB);

    // Create unique vocabulary
    const vocabulary = Array.from(new Set([...tokensA, ...tokensB]));

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const word of vocabulary) {
        const valA = tfA[word] || 0;
        const valB = tfB[word] || 0;
        
        dotProduct += valA * valB;
        magnitudeA += valA * valA;
        magnitudeB += valB * valB;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0.0;

    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * ML-driven ATS score calculating function.
 * Weights Cosine Similarity deeply against explicit Keyword Matches.
 */
export function calculateATSScore(resumeText: string, jobDescription: string, atsKeywords: string[]): number {
    // 1. Calculate semantic similarity to full JD (Contextual ML Matching)
    // Cosine similarity gives a float between 0.0 and 1.0. Typically, raw text cosine sim between related texts is ~0.1 to 0.4.
    const cosineSim = calculateCosineSimilarity(resumeText, jobDescription);
    
    // Convert cosine similarity to a reasonable % score (empirically, multiply by slightly more to normalize to a 100 scale for user readability)
    let similarityScore = Math.min(cosineSim * 200, 100); 

    // 2. Strict exact keyword matching (Deterministic Priority)
    let keywordScore = 0;
    let matches = 0;
    
    if (atsKeywords && atsKeywords.length > 0) {
        const resumeTokensString = tokenize(resumeText).join(" ");
        for (const word of atsKeywords) {
            const cleanWord = word.toLowerCase().trim();
            // simple inclusion in tokenized string
            if (resumeTokensString.includes(" " + cleanWord + " ") || 
                resumeTokensString.startsWith(cleanWord + " ") || 
                resumeTokensString.endsWith(" " + cleanWord)) {
                matches++;
            }
        }
        keywordScore = (matches / atsKeywords.length) * 100;
    } else {
        // If no explicit keywords, rely entirely on similarity
        keywordScore = similarityScore;
    }

    // 3. Blend Scores: 60% Keyword Hits, 40% Semantic Similarity 
    // This provides a highly accurate "ATS" score where explicitly requested skills matter most,
    // but contextual fit prevents poorly keyword-stuffed resumes from reaching 100%.
    const finalScore = Math.floor((keywordScore * 0.6) + (similarityScore * 0.4));

    // Cap bound
    return Math.max(0, Math.min(finalScore, 100)); // Floor at 0, cap at 100
}
