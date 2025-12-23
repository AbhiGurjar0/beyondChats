import { configDotenv } from "dotenv";
configDotenv();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateUpdatedArticle(
  originalTitle,
  originalContent,
  competitorContents
) {
  const prompt = `
You are a senior technical content editor and SEO writer.

Your task is to create a HIGH-QUALITY, ORIGINAL article by improving an existing one,
using insights from top-ranking competitor articles.

---

### Original Article
**Title:** ${originalTitle}

**Content:**
${originalContent}

---

### Competitor Articles (for reference only)
- Competitor Article 1:
${competitorContents[0]}

- Competitor Article 2:
${competitorContents[1]}

---

### Instructions (VERY IMPORTANT)
1. Rewrite and enhance the original article using the competitor articles ONLY as inspiration.
2. Do NOT copy sentences or paragraphs from competitors.
3. Improve:
   - Structure (clear sections & logical flow)
   - Readability (short paragraphs, smooth transitions)
   - Depth (add explanations where useful, remove fluff)
   - Formatting (headings, sub-headings, bullet points, tables where relevant)
4. Maintain a professional, practical, and trustworthy tone.
5. Keep the content suitable for a business/technical audience.
6. Avoid repetition and avoid unnecessary verbosity.
7. The output must be fully self-contained and ready for publishing.

---

### Output Requirements
- Output **ONLY the final article**
- Use **clean Markdown**
- Start with a single '#' level title
- Do NOT include explanations, notes, or meta commentary
- Do NOT repeat the article twice
- Do NOT mention “competitor articles” or “original article”
- Do NOT add references inside the article body

---

### Goal
Produce a polished, publication-ready article that is:
- More structured and clearer than the original
- Comparable in quality to top Google-ranking articles
- Original and plagiarism-safe
`;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 8192,
  });

  return completion.choices[0].message.content;
}
