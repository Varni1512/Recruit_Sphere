/**
 * Simple heuristic simulated AI keyword generator for Job Descriptions.
 * In a real-world scenario, you might hook this up to Python SpaCy algorithms or LLMs.
 */
export function extractKeywordsFromText(text: string): string[] {
    if (!text) return [];

    const KNOWN_SKILLS = new Set([
        "html", "html5", "css", "css3", "js", "javascript", "typescript", "ts",
        "react", "reactjs", "react.js", "next", "nextjs", "next.js", "vue", "vuejs",
        "angular", "node", "nodejs", "node.js", "express", "expressjs", "nest", "nestjs",
        "python", "django", "flask", "fastapi", "numpy", "pandas", "pytorch", "tensorflow", "keras",
        "java", "spring", "springboot", "c++", "cpp", "c#", "csharp", "dotnet", ".net",
        "go", "golang", "rust", "ruby", "rails", "php", "laravel",
        "sql", "mysql", "postgresql", "postgres", "mongodb", "mongo", "redis", "firebase", "supabase",
        "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "git", "github", "gitlab", "bitbucket",
        "linux", "bash", "shell", "graphql", "rest", "api", "tailwind", "tailwindcss", "sass", "less",
        "scikit-learn", "ai", "nlp", "opencv", "prisma", "mongoose", "figma"
    ]);

    // Common filler words we shouldn't map
    const stopWords = new Set(["about", "these", "their", "there", "where", "would", "could", "should", "which", "while", "under", "after", "before", "during", "other", "every", "anyone", "anything", "everything", "something", "nothing", "this", "that", "will", "with", "from", "your", "have", "more", "most", "some", "such", "into", "over", "only", "then", "than", "very"]);

    // Strip out Markdown formatting and punctuation
    const cleanText = text.replace(/[*_~`#>+-]/g, ' ').replace(/[.,!?()[\]{}:;"']/g, ' ').replace(/\n/g, ' ');

    // Normalize and tokenize by whitespace
    const words = cleanText.split(/\s+/).filter(word => word.length > 3); // Discard very short words unless they're specific

    // Score words by frequency, but prioritize fully capitalized words (like ATS, API, UI, UX)
    const wordCounts: Record<string, { count: number, original: string }> = {};

    for (const w of words) {
        const lower = w.toLowerCase();
        if (stopWords.has(lower)) continue;

        // If it's pure capital letters -> usually an acronym
        const isAcronym = w === w.toUpperCase() && w.length > 2;

        // Give bonus weight to acronyms and words > 5 letters
        let weight = 1;
        if (KNOWN_SKILLS.has(lower)) weight += 50; // Vastly prioritize known tech stack terms
        else {
            if (isAcronym) weight += 3;
            if (lower.length >= 6) weight += 1;
        }

        if (!wordCounts[lower]) {
            wordCounts[lower] = { count: 0, original: w };
        }
        wordCounts[lower].count += weight;
    }

    // Sort by computed weight/frequency combinations
    const sortedWords = Object.values(wordCounts)
        .sort((a, b) => b.count - a.count)
        .map(entry => entry.original)
        .slice(0, 10); // Return top 10 candidates

    return sortedWords;
}
