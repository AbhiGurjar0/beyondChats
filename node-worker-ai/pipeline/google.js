import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv();
export async function searchGoogle(query) {
  const res = await axios.get("https://serpapi.com/search", {
    params: {
      q: query,
      api_key: process.env.SERP_API_KEY,
      engine: "google",
      num: 5
    }
  });

  // Filter only blog/article URLs
  const links = res.data.organic_results
    .filter(r =>
      r.link &&
      !r.link.includes("youtube") &&
      !r.link.includes("ads")
    )
    .slice(0, 2)
    .map(r => r.link);

  return links;
}
