import express from "express";
import axios from "axios";
dotenv.config();
import dotenv from "dotenv";
import { searchGoogle } from "./pipeline/google.js";
import { scrapeArticle } from "./pipeline/scraper.js";
import { generateUpdatedArticle } from "./pipeline/llm.js";
const app = express();
app.use(express.json());

const LARAVEL_API = "http://127.0.0.1:8000";

app.post("/generate", async (req, res) => {
  try {
    const { article_id } = req.body;

    if (!article_id) {
      return res.status(400).json({
        message: "article_id missing",
      });
    }
    let response = await axios.get(`${LARAVEL_API}/articles/${article_id}`);
    // console.log(response.articles);
    // console.log("Fetched article data for ID:", response.data);
    let title = response.data.title;
    let content = response.data.content;

    // const links = await searchGoogle(title);
    // console.log("Found links:", links);
    // 3️⃣ Scrape competitor content
    const links = [
      //   "https://medium.com/@S3CloudHub./choosing-the-right-ai-chatbot-a-comprehensive-guide-47fd478fe0ce",
      "https://beyondchats.com/blogs/choosing-the-right-ai-chatbot-a-guide/",
    ];
    const competitorContents = [];
    for (const link of links) {
      competitorContents.push(await scrapeArticle(link));
    }
    // console.log("Scraped competitor contents.", competitorContents);

    // // 4️⃣ Generate updated article
    const updatedContent = await generateUpdatedArticle(
      title,
      content,
      competitorContents
    );
    console.log("Generated updated content.", updatedContent);
    // 5️⃣ Append references
        const finalContent = `
    ${updatedContent}

    ---

    ### References
    1. ${links[0]}
    2. ${links[1]}
    `;
    console.log("Final content ready.", finalContent);

    // // 6️⃣ Save to Laravel
    await axios.post(`${LARAVEL_API}/api/articles`, {
      title: `${title} (Updated)`,
      content: finalContent,
      is_generated: true,
      parent_id: article_id,
    });

    // TEMP simulation (replace with real logic later)
    console.log("Generating article for ID:", article_id);

    return res.status(200).json({
      message: "Generation started",
      article_id: article_id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Worker error",
      error: error.message,
    });
  }
});

app.listen(4000, () => {
  console.log("AI worker running on port 4000");
});
