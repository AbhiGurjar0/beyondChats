import axios from "axios";
dotenv.config();
import dotenv from "dotenv";
import { searchGoogle } from "./pipeline/google.js";
import { scrapeArticle } from "./pipeline/scraper.js";
import { generateUpdatedArticle } from "./pipeline/llm.js";
const LARAVEL_API = process.env.LARAVEL_API;
async function startHeavyGeneration(jobId, article_id) {
  try {
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
    console.log("Article fetched:", title);

    const links = await searchGoogle(title);
    console.log("Found links:", links);
    // // 3️⃣ Scrape competitor content
    // const links = [
    //   //   "https://medium.com/@S3CloudHub./choosing-the-right-ai-chatbot-a-comprehensive-guide-47fd478fe0ce",
    //   "https://beyondchats.com/blogs/choosing-the-right-ai-chatbot-a-guide/",
    // ];
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
    let created = await axios.post(`${LARAVEL_API}/api/articles`, {
      title: `${title} (Updated)`,
      content: finalContent,
      is_generated: true,
      parent_id: article_id,
    });

    // TEMP simulation (replace with real logic later)
    console.log("Generated article for ID in Worker:", created.data);
    //set job id Status to completed in Laravel
    await axios.put(`${LARAVEL_API}/api/generation-jobs/update-status`, {
      job_id: jobId,
      job_status: "completed",
      enhanced_article_id: created.data.article.id,
    });

    return {
      message: "Generation started",
      article_id: article_id,
      enhanced_article_id: created.data.article.id,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Worker error",
      error: error.message,
    };
  }
}

export default startHeavyGeneration ;
