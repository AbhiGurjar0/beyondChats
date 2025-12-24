import axios from "axios";
import * as cheerio from "cheerio";
async function scrapeArticle(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        Referer: "https://www.google.com/",
      },
      timeout: 12000,
      validateStatus: (status) => status < 500,
    });

    if (response.status !== 200) {
      console.warn(`⚠️ Blocked (${response.status}): ${url}`);
      return null;
    }

    const html = response.data;

    // Detect bot protection
    if (/cloudflare|captcha|access denied/i.test(html)) {
      console.warn("⚠️ Bot protection detected:", url);
      return null;
    }

    return parseHtml(html, url);
  } catch (err) {
    console.warn(`⚠️ Scrape failed: ${url} → ${err.message}`);
    return null;
  }
}

/**
 * Parse HTML using Cheerio (your logic)
 */
function parseHtml(html, url) {
  const $ = cheerio.load(html);

  // Remove noise
  $(
    "script, style, nav, footer, header, noscript, iframe, aside, .ad, .advertisement, .social-share, .comments, [class*=sidebar], [id*=sidebar]"
  ).remove();

  let content = "";
  let title = "";
  let headings = [];
  let images = [];

  // Title
  title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim();

  // Article container detection
  let $article = null;
  const articleSelectors = [
    "article",
    '[role="article"]',
    '[itemtype*="Article"]',
    "main article",
    ".article-content",
    ".post-content",
    ".entry-content",
    "#article-body",
    ".article-body",
    "main",
  ];

  for (const selector of articleSelectors) {
    const el = $(selector).first();
    if (el.length && el.find("p").length > 2) {
      $article = el;
      break;
    }
  }

  if (!$article) $article = $("body");

  // Headings
  $article.find("h1, h2, h3, h4, h5, h6").each((i, el) => {
    const text = $(el).text().trim();
    if (text) {
      headings.push({
        level: el.tagName.toLowerCase(),
        text,
        order: i,
      });
    }
  });

  // Images
  $article.find("img").each((i, el) => {
    let src =
      $(el).attr("src") ||
      $(el).attr("data-src") ||
      $(el).attr("data-lazy-src");

    if (src && !src.startsWith("http")) {
      try {
        const base = new URL(url);
        src = new URL(src, base.origin).href;
      } catch {}
    }

    if (src && !src.startsWith("data:")) {
      images.push({
        src,
        alt: $(el).attr("alt") || "",
        title: $(el).attr("title") || "",
        order: i,
      });
    }
  });

  // OG image fallback
  if (!images.length) {
    const ogImg = $('meta[property="og:image"]').attr("content");
    if (ogImg) {
      images.push({
        src: ogImg,
        alt: "Featured image",
        title: "",
        order: 0,
      });
    }
  }

  // Strategy 1: JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html());
      if (data.articleBody) {
        content = data.articleBody;
        return false;
      }
    } catch {}
  });

  // Strategy 2: Paragraphs
  if (!content) {
    const paragraphs = $article
      .find("p")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((t) => t.length > 20);

    content = paragraphs.join("\n\n");
  }

  // Strategy 3: Score-based fallback
  if (!content || content.length < 200) {
    const paragraphs = $("p")
      .map((_, el) => {
        const text = $(el).text().trim();
        let score = text.length > 50 ? text.length / 10 : 0;
        return { text, score };
      })
      .get()
      .filter((p) => p.score > 10)
      .sort((a, b) => b.score - a.score);

    content = paragraphs
      .slice(0, 30)
      .map((p) => p.text)
      .join("\n\n");
  }

  content = content.replace(/\s+/g, " ").trim();

  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  const author =
    $('meta[name="author"]').attr("content") ||
    $('[rel="author"]').text().trim() ||
    $(".author").first().text().trim() ||
    "";

  const publishDate =
    $('meta[property="article:published_time"]').attr("content") ||
    $("time[datetime]").first().attr("datetime") ||
    "";

  return {
    title,
    description,
    author,
    publishDate,
    content,
    headings,
    images,
    url,
    wordCount: content.split(/\s+/).length,
    headingCount: headings.length,
    imageCount: images.length,
  };
}

export { scrapeArticle };
