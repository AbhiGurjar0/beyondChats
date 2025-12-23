import React from "react";
import { Copy, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const Enhance = () => {
  const [enhancingArticle, setEnhancingArticle] = useState(null);
  const [enhancedContent, setEnhancedContent] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/articles/${id}`);
        const data = await response.json();
        setEnhancingArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
      }
    };

    fetchArticle();
  }, [id]);
  const handleCancelEnhancement = async () => {
    navigate("/");
  };
  const handleSaveEnhanced = () => {
    navigate("/");
  };
  const handleStartEnhancement = async () => {
    setIsEnhancing(true);

    try {
      console.log("Starting enhancement for article ID:", id);

      const response = await fetch(
        `http://127.0.0.1:8000/api/articles/${id}/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Enhancement response:", data);

      const intervalId = setInterval(async () => {
        try {
          let statusResponse = await fetch(
            `http://127.0.0.1:8000/job-status/${data.job_id}`
          );

          let statusData = await statusResponse.json();
          console.log(
            "Checked status for job ID",
            data.job_id,
            ":",
            statusData
          );
          if (statusData.status === "completed") {
            console.log("Enhancement completed:", statusData);

            const enhancedArticleId = statusData.enhanced_article_id;
            console.log(
              "Fetching enhanced article with ID:",
              enhancedArticleId
            );

            const articleResponse = await fetch(
              `http://127.0.0.1:8000/articles/${enhancedArticleId}`
            );

            const articleData = await articleResponse.json();
            console.log("Fetched enhanced article data:", articleData);
            setEnhancedContent(articleData);
            setIsEnhancing(false);

            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Error checking status:", err);
          setIsEnhancing(false);
          clearInterval(intervalId);
        }
      }, 10000);
    } catch (error) {
      console.error("Error enhancing article:", error);
      setIsEnhancing(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="bg-white border-b border-gray-200">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancelEnhancement}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6"
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    AI Article Enhancement
                  </h1>
                  <p className="text-sm text-gray-600">
                    Compare and enhance your article with AI
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancelEnhancement}
                  className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                {enhancedContent && (
                  <button
                    onClick={handleSaveEnhanced}
                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Save Enhanced Version
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* Original Article - Left Side */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                <h2 className="text-lg font-semibold text-blue-900 flex items-center">
                  <Copy className="w-5 h-5 mr-2" />
                  Original Article
                </h2>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {enhancingArticle?.title}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {enhancingArticle?.content}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Article - Right Side */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-200">
                <h2 className="text-lg font-semibold text-purple-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Enhanced Version
                </h2>
              </div>
              <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center">
                {!enhancedContent && !isEnhancing ? (
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Ready to Enhance
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      Click the button below to generate an AI-enhanced version
                      of your article
                    </p>
                    <button
                      onClick={handleStartEnhancement}
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Enhance with AI
                      </span>
                    </button>
                  </div>
                ) : isEnhancing ? (
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="relative">
                        <div className="mx-auto w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Enhancing Your Article
                    </h3>
                    <p className="text-gray-600">AI is working its magic...</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {enhancedContent?.title}
                    </h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {enhancedContent?.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Enhance;
