import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeArticle(url) {
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      Referer: "https://www.google.com/",
    },
    timeout: 15000,
  });

  const html = response.data;
  const $ = cheerio.load(html);

  // Remove noise elements
  $(
    "script, style, nav, footer, header, noscript, iframe, aside, .ad, .advertisement, .social-share, .comments, [class*=sidebar], [id*=sidebar]"
  ).remove();

  let content = "";
  let title = "";
  let headings = [];
  let images = [];

  // Extract main title
  title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim();

  // Find the main article container
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
    const elem = $(selector).first();
    if (elem.length && elem.find("p").length > 2) {
      $article = elem;
      break;
    }
  }

  // Fallback to body if no article container found
  if (!$article) {
    $article = $("body");
  }

  // Extract all headings from article (h1-h6)
  $article.find("h1, h2, h3, h4, h5, h6").each((i, elem) => {
    const $heading = $(elem);
    const level = elem.tagName.toLowerCase();
    const text = $heading.text().trim();

    if (text && text.length > 0) {
      headings.push({
        level,
        text,
        order: i,
      });
    }
  });

  // Extract all images from article
  $article.find("img").each((i, elem) => {
    const $img = $(elem);
    let src =
      $img.attr("src") || $img.attr("data-src") || $img.attr("data-lazy-src");
    const alt = $img.attr("alt") || "";
    const title = $img.attr("title") || "";

    // Handle relative URLs
    if (src && !src.startsWith("http")) {
      try {
        const baseUrl = new URL(url);
        src = new URL(src, baseUrl.origin).href;
      } catch (e) {}
    }

    if (src && !src.startsWith("data:")) {
      images.push({
        src,
        alt,
        title,
        order: i,
      });
    }
  });

  // Also check for Open Graph image if no images found in content
  if (images.length === 0) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) {
      images.push({
        src: ogImage,
        alt: "Featured image",
        title: "",
        order: 0,
      });
    }
  }

  // Strategy 1: Look for JSON-LD structured data
  const jsonLd = $('script[type="application/ld+json"]');
  jsonLd.each((i, elem) => {
    try {
      const data = JSON.parse($(elem).html());
      if (data.articleBody) {
        content = data.articleBody;
        return false;
      }
    } catch (e) {}
  });

  // Strategy 2: Extract paragraphs from article container
  if (!content) {
    const paragraphs = $article
      .find("p")
      .map((i, el) => $(el).text().trim())
      .get()
      .filter((text) => text.length > 20);

    if (paragraphs.length > 0) {
      content = paragraphs.join("\n\n");
    }
  }

  // Strategy 3: Score-based paragraph extraction
  if (!content || content.length < 200) {
    const paragraphs = $("p")
      .map((i, el) => {
        const $p = $(el);
        const text = $p.text().trim();
        const parent = $p.parent().attr("class") || "";
        const parentId = $p.parent().attr("id") || "";

        let score = 0;
        if (text.length > 50) score += text.length / 10;
        if (text.split(" ").length > 20) score += 10;
        if (/article|content|post|entry|body/i.test(parent + parentId))
          score += 20;
        if (/sidebar|comment|ad|share|widget/i.test(parent + parentId))
          score -= 50;

        return { text, score };
      })
      .get()
      .filter((p) => p.score > 10)
      .sort((a, b) => b.score - a.score);

    content = paragraphs
      .slice(0, Math.min(30, paragraphs.length))
      .map((p) => p.text)
      .join("\n\n");
  }

  // Clean up whitespace
  content = content.replace(/\s+/g, " ").replace(/\n\s+/g, "\n").trim();

  // Extract metadata
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
