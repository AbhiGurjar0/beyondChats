![WhatsApp Image 2025-12-21 at 22 27 59](https://github.com/user-attachments/assets/5658fce4-825a-42d0-a2bf-7c75de736f87)# 🚀 BeyondChats – Article Intelligence Platform

An end-to-end **AI-powered article enhancement system** that scrapes blog articles, analyzes top Google-ranking content, rewrites articles using LLMs, and displays both original and enhanced versions in a modern React UI.

This project was built as part of a technical assignment and demonstrates **full-stack engineering, AI integration, and production-ready architecture**.

---

## 📌 Project Objective

To automate the workflow of:
- Scraping existing blog articles
- Storing them in a database
- Enhancing articles using insights from top Google results
- Publishing AI-generated content
- Displaying everything in a professional frontend

## Live URL:
👉 https://<your-live-link-here>


## 🧩 Phase-wise Implementation

## 🟢 Phase 1: Article Scraping & Backend APIs  
**(Moderate Difficulty)**

### ✅ Implemented Features
- Scraped articles from the **last page of BeyondChats blogs**
- Extracted the **5 oldest articles**
- Stored articles in **PostgreSQL**
- Built **CRUD APIs** using Laravel

### 🔗 Source
- Blog URL: https://beyondchats.com/blogs/

### 🔧 Tech Used
- Laravel
- PostgreSQL
- Server-side HTML parsing

### 📦 APIs
| Method | Endpoint | Description |
|------|--------|------------|
| GET | `/articles` | Fetch all articles |
| GET | `/articles/{id}` | Fetch article by ID |
| POST | `/api/articles` | Create article |
| PUT | `/api/articles/{id}` | Update article |
| DELETE | `/api/articles/{id}` | Delete article |

---

## 🟠 Phase 2: AI-Powered Article Enhancement  
**(Very Difficult)**

### ✅ Implemented Features
A **Node.js AI worker** that:

1. Fetches the latest article from Laravel API  
2. Searches the article title on Google  
3. Extracts the **top 2 competitor blog links**  
4. Scrapes the main content from those blogs  
5. Uses an **LLM API** to rewrite the article  
6. Improves structure, clarity, and formatting  
7. Publishes the new article via Laravel APIs  
8. Appends **reference links** at the bottom  

### 🧠 AI Strategy
- Prompt-engineered to:
  - Avoid plagiarism
  - Maintain originality
  - Output clean **Markdown**
- Original article is never overwritten
- Generated article is linked via `parent_id`

### 🛠️ Tech Used
- Node
- SerpApi 
- cheerio (for scraping)
- groq-sdk (for llm)

---

## 🔵 Phase 3: Frontend Dashboard  
**(Very Easy)**

### ✅ Implemented Features
- React-based responsive UI
- Fetches articles from Laravel APIs
- Displays:
  - Original articles
  - AI-generated versions
- Modern UI with:
  - Grid views
  - Status badges
  - References section
  - “Enhance with AI” action

### 🛠️ Tech Used
- React
- Tailwind CSS
- Lucide Icons
- Markdown rendering

---

## 🏗️ Data Flow / Architecture Diagram

![Architecture Diagram](docs/images/architecture.png)

## 🗃️ Database Schema (Articles)

| Column         | Description |
|----------------|------------ |
| id             | Primary key |
| title          | Article title |
| content        | Markdown content |
| is_generated   | Original / AI-generated |
| parent_id      | Links generated article to original |
| created_at     | Timestamp |
| updated_at     | Timestamp |


## 🗃️ Database Schema (JobGeneration)

| Column              | Description |
|---------------------|------------ |
| id                  | Primary key |
| job_id              |
| job_status          |
| enhanced_article_id |
| created_at          | Timestamp   |
| updated_at          | Timestamp   |


---

## ⚙️ Local Setup Instructions

### Backend (Laravel)
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

### Worker (Node)
cd node-worker-ai
npm install
cp .env.example .env
node index.js

### Frontend (React)
cd frontend
npm install
npm run dev


