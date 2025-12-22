import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  FileText,
  Clock,
  Plus,
  Sparkles,
  MoreVertical,
  Copy,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ArticleManagementDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Enhancement view state
  const [enhanceView, setEnhanceView] = useState(false);
  const [enhancingArticle, setEnhancingArticle] = useState(null);
  const [enhancedContent, setEnhancedContent] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        console.log("Fetching articles...");
        const response = await fetch("http://127.0.0.1:8000/articles");
        const data = await response.json();
        console.log("Fetched articles:", data);
        setArticles(data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const stats = {
    total: articles.length,
    original: articles.filter((a) => !a.is_generated).length,
    generated: articles.filter((a) => a.is_generated).length,
    withParent: articles.filter((a) => a.parent_id !== null).length,
  };

  const filteredArticles = articles
    .filter((article) => {
      if (activeTab === "all") return true;
      if (activeTab === "original") return !article.is_generated;
      if (activeTab === "generated") return article.is_generated;
      if (activeTab === "versions") return article.parent_id !== null;
      return true;
    })
    .filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.content &&
          article.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleEnhanceArticle = (articleId) => {
    const article = articles.find((a) => a.id === articleId);
    setEnhancingArticle(article);
    setEnhancedContent(null);
    setEnhanceView(true);
  };

  const handleStartEnhancement = async () => {
    setIsEnhancing(true);

    // Simulate API call to enhance article
    setTimeout(() => {
      setEnhancedContent({
        title: enhancingArticle.title + " (Enhanced)",
        content:
          enhancingArticle.content +
          "\n\nThis is the AI-enhanced version with improved clarity, structure, and engagement.",
      });
      setIsEnhancing(false);
    }, 3000);
  };

  const handleSaveEnhanced = () => {
    setArticles([
      {
        id: Date.now(),
        ...enhancedContent,
        created_at: new Date(),
        updated_at: new Date(),
        is_generated: true,
        parent_id: enhancingArticle.id,
      },
      ...articles,
    ]);
    setEnhanceView(false);
    setEnhancingArticle(null);
    setEnhancedContent(null);
  };

  const handleCancelEnhancement = () => {
    setEnhanceView(false);
    setEnhancingArticle(null);
    setEnhancedContent(null);
    setIsEnhancing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ArticleCard = ({ article }) => (
    <div
      className={`bg-white rounded-xl border ${
        article.is_generated ? "border-purple-100" : "border-blue-100"
      } hover:shadow-lg transition-all duration-300`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            {article.is_generated ? (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium rounded-full flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                Generated
              </span>
            ) : (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                Original
              </span>
            )}
            {article.parent_id && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                v2.0
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!article.is_generated && (
              <button
                onClick={() => navigate(`/enhance/${article.id}`)}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Enhance with AI"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            )}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenuId(openMenuId === article.id ? null : article.id)
                }
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {openMenuId === article.id && (
                <div className="absolute right-0 mt-2 w-36 bg-white border rounded-xl shadow-xl z-50">
                  <button
                    onClick={() => {
                      setSelectedArticle(article);
                      setShowEditModal(true);
                      setOpenMenuId(null);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-2 text-green-600" />
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setSelectedArticle(article);
                      setShowDeleteModal(true);
                      setOpenMenuId(null);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {article.content || "No content available"}
        </p>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(article.created_at)}
          </div>
          {article.updated_at !== article.created_at && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Updated {formatDate(article.updated_at)}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(`/article/${article.id}`)}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          See More
        </button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Article
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Generated</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.generated}
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
                <p className="text-sm font-medium text-gray-600">Versions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.withParent}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <RefreshCw className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6">
              <div className="flex space-x-1">
                {["all", "original", "generated", "versions"].map((tab) => (
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
                    {tab === "generated" && ` (${stats.generated})`}
                    {tab === "versions" && ` (${stats.withParent})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-3 text-gray-600">Loading articles...</span>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No articles found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      {showCreateModal && (
        <ArticleFormModal
          title="Create New Article"
          onClose={() => setShowCreateModal(false)}
          onSave={(data) => {
            setArticles([
              {
                id: Date.now(),
                ...data,
                created_at: new Date(),
                updated_at: new Date(),
                is_generated: false,
              },
              ...articles,
            ]);
            setShowCreateModal(false);
          }}
        />
      )}

      {showEditModal && selectedArticle && (
        <ArticleFormModal
          title="Edit Article"
          article={selectedArticle}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => {
            setArticles(
              articles.map((a) =>
                a.id === selectedArticle.id
                  ? { ...a, ...data, updated_at: new Date() }
                  : a
              )
            );
            setShowEditModal(false);
          }}
        />
      )}

      {showDeleteModal && selectedArticle && (
        <DeleteModal
          article={selectedArticle}
          onClose={() => setShowDeleteModal(false)}
          onDelete={(id) => {
            setArticles(articles.filter((a) => a.id !== id));
            setShowDeleteModal(false);
          }}
        />
      )}
    </div>
  );
};

//edit
const ArticleFormModal = ({ title, article, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: article?.title || "",
    content: article?.content || "",
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>

        <input
          className="w-full mb-4 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
          placeholder="Article title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full h-40 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
          placeholder="Article content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
//delete
const DeleteModal = ({ article, onClose, onDelete }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
      <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
        <Trash2 className="w-7 h-7 text-red-600" />
      </div>
      <h2 className="text-xl font-bold mb-2">Delete Article?</h2>
      <p className="text-gray-600 mb-6">
        "{article.title}" will be permanently deleted.
      </p>

      <div className="flex justify-center space-x-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">
          Cancel
        </button>
        <button
          onClick={() => onDelete(article.id)}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default ArticleManagementDashboard;
