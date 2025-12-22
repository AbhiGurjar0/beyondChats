import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
  BarChart3,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  Globe,
  Copy,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MoreVertical,
} from "lucide-react";

const ArticleManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios
          .get("http://127.0.0.1:8000/articles")
          .then((res) => res.data);
        setArticles(response);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    fetchArticles();
  }, []);

  // Mock data for articles
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: "The Future of AI in Modern Business",
      slug: "future-of-ai-modern-business",
      original_content: "Original content about AI in business...",
      updated_content: "Enhanced and optimized content about AI...",
      status: "published",
      source: "beyondchats",
      category: "Technology",
      tags: ["AI", "Business", "Innovation"],
      views: 1245,
      likes: 89,
      published_date: "2024-12-15",
      updated_date: "2024-12-20",
      citations: [
        { url: "https://example.com/ai-article1", title: "Top AI Trends 2024" },
        { url: "https://example.com/ai-article2", title: "Business AI Guide" },
      ],
      original: true,
      version: "v2.0",
    },
    {
      id: 2,
      title: "Sustainable Energy Solutions",
      slug: "sustainable-energy-solutions",
      original_content: "Original energy solutions content...",
      updated_content: "Enhanced sustainable energy article...",
      status: "processing",
      source: "beyondchats",
      category: "Environment",
      tags: ["Energy", "Sustainability", "Green"],
      views: 892,
      likes: 45,
      published_date: "2024-12-10",
      updated_date: "2024-12-18",
      citations: [
        {
          url: "https://example.com/energy-article1",
          title: "Renewable Energy Report",
        },
      ],
      original: false,
      version: "v1.5",
    },
    {
      id: 3,
      title: "Web Development Best Practices",
      slug: "web-development-best-practices",
      original_content: "Original web dev content...",
      updated_content: null,
      status: "published",
      source: "beyondchats",
      category: "Development",
      tags: ["Web", "Development", "React"],
      views: 2103,
      likes: 156,
      published_date: "2024-12-05",
      updated_date: null,
      citations: [],
      original: true,
      version: "v1.0",
    },
    {
      id: 4,
      title: "Digital Marketing Strategies 2024",
      slug: "digital-marketing-strategies-2024",
      original_content: "Original marketing content...",
      updated_content: "Updated marketing strategies...",
      status: "published",
      source: "beyondchats",
      category: "Marketing",
      tags: ["Marketing", "Digital", "SEO"],
      views: 1789,
      likes: 102,
      published_date: "2024-11-28",
      updated_date: "2024-12-22",
      citations: [
        { url: "https://example.com/marketing1", title: "Marketing Trends" },
        { url: "https://example.com/marketing2", title: "SEO Guide 2024" },
      ],
      original: false,
      version: "v2.1",
    },
  ]);

  const stats = {
    total: articles.length,
    original: articles.filter((a) => a.original).length,
    updated: articles.filter((a) => !a.original).length,
    processing: articles.filter((a) => a.status === "processing").length,
    published: articles.filter((a) => a.status === "published").length,
  };

  const filteredArticles = articles
    .filter((article) => {
      if (activeTab === "all") return true;
      if (activeTab === "original") return article.original;
      if (activeTab === "updated") return !article.original;
      if (activeTab === "processing") return article.status === "processing";
      return article.status === activeTab;
    })
    .filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

  const handleSelectArticle = (id) => {
    setSelectedArticles((prev) =>
      prev.includes(id)
        ? prev.filter((articleId) => articleId !== id)
        : [...prev, id]
    );
  };

  const handleEnhanceArticle = (articleId) => {
    alert(`Initiating enhancement process for article ${articleId}`);
    // This would call the NodeJS script API
  };

  const ArticleCard = ({ article }) => (
    <div
      className={`bg-white rounded-xl border ${
        article.original ? "border-blue-100" : "border-purple-100"
      } hover:shadow-lg transition-all duration-300`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            {article.original ? (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                Original
              </span>
            ) : (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium rounded-full flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                Enhanced
              </span>
            )}
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                article.status === "published"
                  ? "bg-green-100 text-green-700"
                  : article.status === "processing"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {article.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {article.original && (
              <button
                onClick={() => handleEnhanceArticle(article.id)}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Enhance with AI"
              >
                <TrendingUp className="w-5 h-5" />
              </button>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {article.updated_content || article.original_content}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {article.category}
          </span>
          {article.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 2 && (
            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-full">
              +{article.tags.length - 2} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {article.views}
            </div>
            <div className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-1" />
              {article.likes}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {article.version}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Eye className="w-5 h-5" />
            </button>
            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {article.citations.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-700 mb-2">
            <Globe className="w-4 h-4 mr-2" />
            <span className="font-medium">References:</span>
          </div>
          <div className="space-y-2">
            {article.citations.map((citation, index) => (
              <a
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group"
              >
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 truncate">
                    {citation.title}
                  </span>
                </div>
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Article Intelligence
                </h1>
                <p className="text-sm text-gray-600">
                  Manage and enhance your articles with AI
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                New Article
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Articles
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Original</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.original}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Copy className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enhanced</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.updated}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.processing}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <RefreshCw className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.published}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6">
              <div className="flex space-x-1">
                {["all", "original", "updated", "processing", "published"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-all ${
                        activeTab === tab
                          ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {tab === "all" && ` (${articles.length})`}
                      {tab === "original" && ` (${stats.original})`}
                      {tab === "updated" && ` (${stats.updated})`}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid" ? "bg-white shadow" : ""
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-1 w-6 h-6">
                      <div className="bg-gray-400 rounded"></div>
                      <div className="bg-gray-400 rounded"></div>
                      <div className="bg-gray-400 rounded"></div>
                      <div className="bg-gray-400 rounded"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list" ? "bg-white shadow" : ""
                    }`}
                  >
                    <div className="space-y-1 w-6 h-6">
                      <div className="bg-gray-400 h-1 rounded"></div>
                      <div className="bg-gray-400 h-1 rounded"></div>
                      <div className="bg-gray-400 h-1 rounded"></div>
                    </div>
                  </button>
                </div>

                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Articles Grid/List */}
          <div className="p-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {article.original ? (
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <Copy className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                              <Sparkles className="w-6 h-6 text-purple-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {article.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-600">
                              {article.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {article.published_date}
                            </span>
                            <span className="text-sm text-gray-500">
                              {article.views} views
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleEnhanceArticle(article.id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                          Enhance with AI
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArticleManagementDashboard;
