"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Newspaper } from "lucide-react";

type NewsItem = {
  title: string;
  summary: string;
  category: string;
  sentiment: string;
  time: string;
};

export default function FinanceNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Markets", "Economy", "Crypto", "Banking", "RBI"];

  const fetchNews = async () => {
    setIsLoading(true);
    setNews([]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: "You are a financial news generator. Output strictly JSON array only, without markdown.",
          messages: [
            {
              role: "user",
              content:
                "Generate 8 realistic Indian financial market news items for today. Return as JSON array: [{'title':'...','summary':'2 sentence summary','category':'Markets|Economy|Crypto|Banking|RBI','sentiment':'positive|negative|neutral','time':'X hours ago'}]",
            },
          ],
        }),
      });

      const data = await response.json();
      const rawText = data.reply;

      const jsonString = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(jsonString);

      if (Array.isArray(parsed)) {
        setNews(parsed);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = activeTab === "All" ? news : news.filter((item) => item.category === activeTab);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-accent" />
            Finance News
          </h1>
          <p className="text-muted mt-2">AI-curated market updates and economy alerts.</p>
        </div>
        <button
          onClick={fetchNews}
          disabled={isLoading}
          className="bg-surface border border-border hover:bg-background text-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex overflow-x-auto space-x-2 pb-2" style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-accent/20 text-accent font-medium border border-accent/50"
                : "bg-surface text-muted border border-border hover:bg-background"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-5 space-y-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="w-20 h-6 bg-border rounded-full" />
                  <div className="w-16 h-4 bg-border rounded" />
                </div>
                <div className="w-full h-12 bg-border rounded" />
                <div className="w-full h-16 bg-border rounded" />
              </div>
            ))
          : filteredNews.map((item, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-5 hover:border-accent/50 transition-colors flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider bg-background px-2.5 py-1 rounded-md border border-border text-muted">
                    {item.category}
                  </span>
                  <span className="text-xs text-muted">{item.time}</span>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-2 flex-1">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed mb-4">{item.summary}</p>
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.sentiment === "positive"
                        ? "bg-green-500"
                        : item.sentiment === "negative"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-xs font-medium text-muted capitalize">{item.sentiment} Sentiment</span>
                </div>
              </div>
            ))}
      </div>

      {!isLoading && filteredNews.length === 0 && (
        <div className="text-center py-12 bg-surface border border-border rounded-xl">
          <p className="text-muted">No news found for this category.</p>
        </div>
      )}
    </div>
  );
}
