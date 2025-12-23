import React, { useEffect } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  Copy,
  Share2,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const ArticleViewPage = ({ onEnhance }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const onBack = () => {
    navigate("/");
  };
  const [article, setArticle] = React.useState([]);
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // setLoading(true);
        console.log("Fetching articles...");
        const response = await fetch(`http://127.0.0.1:8000/articles/${id}`);
        const data = await response.json();
        console.log("Fetched articles:", data);
        setArticle(data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCopyContent = () => {
    const textToCopy = article.content || article.title;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to dashboard"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Article View
                  </h1>
                  <p className="text-sm text-gray-600">Reading mode</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!article.is_generated && (
                <button
                  onClick={() => navigate(`/enhance/${article.id}`)}
                  className="px-4 py-2 flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhance with AI
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        {article && (
          <article className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Article Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-8 border-b border-gray-200">
              {/* Badges */}
              <div className="flex items-center space-x-3 mb-4">
                {article.is_generated ? (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium rounded-full flex items-center">
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    AI Generated
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center">
                    <Copy className="w-4 h-4 mr-1.5" />
                    Original
                  </span>
                )}
                {article.parent_id && (
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Version 2.0
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Created: {formatDateShort(article.created_at)}</span>
                </div>
                {article.updated_at !== article.created_at && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Updated: {formatDateShort(article.updated_at)}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-gray-400">ID:</span>
                  <span className="ml-2 font-mono text-gray-600">
                    #{article.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="px-8 py-12">
              {article.content ? (
                <div className="prose prose-lg prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {article.content}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No content available</p>
                  <p className="text-gray-400 text-sm mt-2">
                    This article doesn't have any content yet
                  </p>
                </div>
              )}
            </div>

            {/* Article Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {formatDate(article.created_at)}
                  </p>
                  {article.updated_at !== article.created_at && (
                    <p className="mt-1">
                      <span className="font-medium">Last Updated:</span>{" "}
                      {formatDate(article.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </article>
         
        )}
        

        {/* Related Info Card */}
        {article.parent_id && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Enhanced Version
                </h3>
                <p className="text-sm text-green-700">
                  This is an AI-enhanced version of article #{article.parent_id}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArticleViewPage;
