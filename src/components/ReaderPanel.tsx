import React, { useState, useEffect } from "react";
import { Article, Category } from "../types";
import { Search, ChevronRight, Clock, Eye, AlertCircle, ArrowLeft, Calendar, ExternalLink, Cpu, Users, Sparkles, MessageSquare, RefreshCw, Copy, Check, HelpCircle, Activity, Code, Workflow, Terminal } from "lucide-react";
import { LarrySageLogo } from "./LarrySageLogo";

export function ReaderPanel({
  activeTab,
  setActiveTab,
  refreshTrigger,
  currentUser,
  setShowLoginModal,
  setAuthMode,
  theme,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refreshTrigger: number;
  currentUser?: any;
  setShowLoginModal?: (show: boolean) => void;
  setAuthMode?: (mode: "signin" | "signup") => void;
  theme?: "light" | "dark";
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Selected active article for immersive reading view
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [subTab, setSubTab] = useState<"article" | "eeat" | "schema">("article");
  const [copied, setCopied] = useState(false);

  // Comments state declarations
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [commentMsg, setCommentMsg] = useState<{type: "success" | "error", text: string} | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Fetch comments autonomously whenever active article changes
  useEffect(() => {
    if (activeArticle) {
      const fetchComments = async () => {
        try {
          const res = await fetch(`/api/articles/${activeArticle.id}/comments`);
          if (res.ok) {
            const data = await res.json();
            setComments(data);
          }
        } catch (err) {
          console.error("Failed to load comments:", err);
        }
      };
      
      setCommentMsg(null);
      setCommentText("");
      fetchComments();
    }
  }, [activeArticle]);

  // Submit comment handler
  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeArticle) return;
    
    if (!currentUser) {
      setCommentMsg({type: "error", text: "Please sign in or register to submit comments."});
      return;
    }

    setSubmitLoading(true);
    setCommentMsg(null);

    try {
      const res = await fetch(`/api/articles/${activeArticle.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: commentText.trim(),
          userName: currentUser.name,
          userEmail: currentUser.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setCommentText("");
        setCommentMsg({type: "success", text: "Your comment was added successfully!"});
        // Auto-fade success banner
        setTimeout(() => setCommentMsg(null), 3000);
      } else {
        const errData = await res.json();
        setCommentMsg({type: "error", text: errData.error || "Failed to submit comment."});
      }
    } catch (err) {
      setCommentMsg({type: "error", text: "Service error. Please try again."});
    } finally {
      setSubmitLoading(false);
    }
  };

  // Moderator comment delete handler
  const handleDeleteComment = async (commentId: string) => {
    if (!activeArticle) return;
    try {
      const res = await fetch(`/api/articles/${activeArticle.id}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Core Categories List (matching types.ts Category enum)
  const CATEGORIES = ["All", ...Object.values(Category)];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, refreshTrigger]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = "/api/articles";
      const params = ["status=published"];
      if (selectedCategory && selectedCategory !== "All") {
        params.push(`category=${encodeURIComponent(selectedCategory)}`);
      }
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        setArticles(data);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on filtered backend query or client-side filter
  const getFilteredArticles = () => {
    if (!articles) return [];
    const validArticles = articles.filter(Boolean);
    if (!searchQuery.trim()) return validArticles;
    const q = searchQuery.toLowerCase();
    return validArticles.filter(
      (art) =>
        (art.title && art.title.toLowerCase().includes(q)) ||
        (art.excerpt && art.excerpt.toLowerCase().includes(q)) ||
        (art.keywords && Array.isArray(art.keywords) && art.keywords.some((k) => k && k.toLowerCase().includes(q)))
    );
  };

  const handleOpenArticle = async (slug: string) => {
    try {
      const resp = await fetch(`/api/articles/${slug}`);
      if (resp.ok) {
        const data = await resp.json();
        setActiveArticle(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error reading article:", err);
    }
  };

  const handleCTAClick = async (id: string, linkUrl: string) => {
    try {
      await fetch(`/api/articles/${id}/click`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    if (linkUrl.startsWith("#")) {
      // route to contact tab
      setActiveTab("contact");
    } else {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Custom rich typo Markdown renderer
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return null;
    const lines = markdown.split("\n");
    let inList = false;
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLanguage = "";
    const components: React.ReactNode[] = [];

    // Simple robust linear state compiler
    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Skip markdown code block markers
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // Finished code block, let's render it
          const codeContent = codeLines.join("\n");
          components.push(
            <div key={`code-${index}`} className="relative group my-5">
              <div 
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-200 rounded px-2.5 py-1 text-xs cursor-pointer font-mono font-bold select-none z-10"
                onClick={(e) => {
                  navigator.clipboard.writeText(codeContent);
                  const btn = e.currentTarget;
                  btn.innerText = "COPIED!";
                  setTimeout(() => { btn.innerText = "COPY"; }, 2000);
                }}
              >
                COPY
              </div>
              <pre className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-x-auto text-[13px] sm:text-[14px] font-mono text-zinc-900 dark:text-zinc-100 leading-relaxed text-left">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
          codeLines = [];
          codeLanguage = "";
          inCodeBlock = false;
        } else {
          // Starting code block
          inCodeBlock = true;
          codeLanguage = line.replace("```", "").trim();
        }
        return;
      }

      // If we are within a code block, accumulate lines exactly as they are to preserve formatting
      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Check numbered items (e.g. "1. Unstable Third-Party APIs")
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        const itemText = numMatch[2];
        components.push(
          <li key={`ol-${index}`} className="text-[15px] sm:text-[16px] text-zinc-850 dark:text-zinc-200 leading-relaxed font-serif mb-2.5 list-none ml-5 pl-1 text-left">
            <span className="font-mono text-red-650 dark:text-red-400 font-bold mr-2 text-[13px]">{numMatch[1]}.</span>
            {parseInlineStyles(itemText)}
          </li>
        );
        return;
      }

      // Check bullet items
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const itemText = trimmed.slice(2);
        if (!inList) {
          inList = true;
        }
        components.push(
          <li key={`li-${index}`} className="text-[15px] sm:text-[16px] text-zinc-800 dark:text-zinc-250 leading-relaxed font-serif mb-2.5 list-disc ml-5 pl-1.5 text-left">
            {parseInlineStyles(itemText)}
          </li>
        );
        return;
      } else {
        inList = false;
      }

      // Check Header 1
      if (trimmed.startsWith("# ")) {
        components.push(
          <h1 key={index} className="font-serif font-bold text-2xl sm:text-3xl tracking-tight text-zinc-900 dark:text-zinc-50 mb-5 mt-7 border-b border-zinc-200 dark:border-zinc-800 pb-2.5 text-left">
            {parseInlineStyles(trimmed.slice(2))}
          </h1>
        );
        return;
      }

      // Check Header 2
      if (trimmed.startsWith("## ")) {
        components.push(
          <h2 key={index} className="font-serif font-semibold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-zinc-100 mb-3.5 mt-7 text-red-700 dark:text-red-400 text-left">
            {parseInlineStyles(trimmed.slice(3))}
          </h2>
        );
        return;
      }

      // Check Header 3
      if (trimmed.startsWith("### ")) {
        components.push(
          <h3 key={index} className="font-serif font-medium italic text-[15px] sm:text-[16px] text-zinc-800 dark:text-zinc-300 mb-3 mt-6 text-left">
            {parseInlineStyles(trimmed.slice(4))}
          </h3>
        );
        return;
      }

      // Empty spacing
      if (trimmed === "") {
        components.push(<div key={`sp-${index}`} className="h-4"></div>);
        return;
      }

      // Default paragraph (beautiful premium serif prose)
      components.push(
        <p key={index} className="text-[15px] sm:text-[16px] text-zinc-850 dark:text-zinc-200 leading-relaxed font-serif mb-4 text-justify select-text">
          {parseInlineStyles(trimmed)}
        </p>
      );
    });

    return <div className="space-y-1">{components}</div>;
  };

  // Parse bold, code, markdown link, and raw url text inline
  const parseInlineStyles = (text: string): React.ReactNode[] => {
    // splits by HTML anchor tags, bold symbols "**", monospaced "`", Markdown links "[text](url)", or raw HTTP/HTTPS links
    const regex = /(<a\s+[^>]*>.*?<\/a>|\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\)|https?:\/\/[^\s\)\"',;\*<]+)/gi;
    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (part.toLowerCase().startsWith("<a") && part.toLowerCase().endsWith("</a>")) {
        const hrefMatch = part.match(/href=["']([^"']*)["']/i);
        const targetMatch = part.match(/target=["']([^"']*)["']/i);
        const contentMatch = part.match(/>(.*?)<\/a>/i);
        
        const url = hrefMatch ? hrefMatch[1] : "#";
        const target = targetMatch ? targetMatch[1] : undefined;
        const label = contentMatch ? contentMatch[1] : "";
        
        return (
          <a
            key={index}
            href={url}
            target={target || "_blank"}
            rel="noopener noreferrer"
            className="text-red-650 dark:text-red-400 font-bold underline hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-0.5"
          >
            <span>{label}</span>
            <ExternalLink size={10} className="inline ml-0.5 flex-shrink-0" />
          </a>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="text-zinc-955 dark:text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index} className="bg-zinc-150 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-200 dark:border-zinc-800 text-red-650 dark:text-red-400">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const label = linkMatch[1];
          const url = linkMatch[2];
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-650 dark:text-red-400 font-bold underline hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-0.5"
            >
              <span>{label}</span>
              <ExternalLink size={10} className="inline ml-0.5 flex-shrink-0" />
            </a>
          );
        }
      }
      if (part.startsWith("http://") || part.startsWith("https://")) {
        // Clean trailing punctuation
        let cleanUrl = part;
        while (cleanUrl.endsWith(".") || cleanUrl.endsWith(",") || cleanUrl.endsWith(")") || cleanUrl.endsWith("]") || cleanUrl.endsWith("*")) {
          cleanUrl = cleanUrl.substring(0, cleanUrl.length - 1);
        }
        return (
          <a
            key={index}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-650 dark:text-red-400 font-bold underline hover:opacity-85 transition-opacity cursor-pointer inline-flex items-center gap-0.5"
          >
            <span>{cleanUrl}</span>
            <ExternalLink size={10} className="inline ml-0.5 flex-shrink-0" />
          </a>
        );
      }

      // Automatically format plain-text occurrences of "Zapii" or "zapii.ng" to point to https://zapii.ng
      if (part && /zapii/i.test(part)) {
        const zapiiRegex = /((?:[zZ][aA][pP][iI][iI])(?:\.ng)?)/g;
        const subParts = part.split(zapiiRegex);
        return (
          <span key={index}>
            {subParts.map((sub, sIdx) => {
              if (!sub) return null;
              if (/^zapii(\.ng)?$/i.test(sub)) {
                return (
                  <a
                    key={`${index}-zapii-${sIdx}`}
                    href="https://zapii.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-650 dark:text-red-400 font-bold underline hover:opacity-85 transition-opacity cursor-pointer inline-flex items-center gap-0.5"
                  >
                    <span>{sub}</span>
                    <ExternalLink size={10} className="inline ml-0.5 flex-shrink-0 align-middle" />
                  </a>
                );
              }
              return sub;
            })}
          </span>
        );
      }

      // Automatically format plain-text occurrences of "Digital Sage" (case-insensitive) to point to https://digitalsage.com
      if (part && /digital\s+sage/i.test(part)) {
        const sageRegex = /((?:[dD][iI][gG][iI][tT][aA][lL])\s+(?:[sS][aA][gG][eE]))/g;
        const subParts = part.split(sageRegex);
        return (
          <span key={index}>
            {subParts.map((sub, sIdx) => {
              if (!sub) return null;
              if (/^digital\s+sage$/i.test(sub)) {
                return (
                  <a
                    key={`${index}-sage-${sIdx}`}
                    href="https://digitalsage.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-650 dark:text-red-400 font-bold underline hover:opacity-85 transition-opacity cursor-pointer inline-flex items-center gap-0.5"
                  >
                    <span>{sub}</span>
                    <ExternalLink size={10} className="inline ml-0.5 flex-shrink-0 align-middle" />
                  </a>
                );
              }
              return sub;
            })}
          </span>
        );
      }

      return part;
    });
  };

  // Parse and extract all links from the background post for easy clickable outbound links
  const getOutboundLinks = (article: Article) => {
    if (!article || !article.content) return [];
    
    const lines = article.content.split("\n");
    const links: { title: string; url: string }[] = [];
    
    const markdownLinkRegex = /\[(.*?)\]\(((https?:\/\/|mailto:).*?)\)/g;
    const rawUrlRegex = /(https?:\/\/[^\s\)\"\',;\*<]+)/g;

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Grab markdown links
      let match;
      while ((match = markdownLinkRegex.exec(line)) !== null) {
        const title = match[1];
        const url = match[2];
        if (!links.some(l => l.url === url)) {
          if (!url.includes("twitter.com/intent") && !url.includes("linkedin.com/sharing")) {
            links.push({ title, url });
          }
        }
      }

      // Grab raw http links
      let urlMatch;
      while ((urlMatch = rawUrlRegex.exec(line)) !== null) {
        let url = urlMatch[0];
        while (url.endsWith(".") || url.endsWith(",") || url.endsWith(")") || url.endsWith("]") || url.endsWith("*")) {
          url = url.substring(0, url.length - 1);
        }
        const alreadyParsed = links.some(l => l.url === url || l.url.includes(url) || url.includes(l.url));
        if (!alreadyParsed) {
          if (!url.includes("twitter.com/intent") && !url.includes("linkedin.com/sharing") && !url.includes("wa.me/2347074222772") && !url.includes("whatsapp.com")) {
            let title = "Official Resource Link";
            if (url.includes("digitalsage.com.ng")) {
              title = "Digital Sage Main Portal";
            } else if (url.includes("zapii.ng")) {
              title = "Zapii Automation Platform";
            }
            links.push({ title, url });
          }
        }
      }
    });

    // Also inject the zapiiCTA link if it exists and isn't already there!
    if (article.zapiiCTA && article.zapiiCTA.linkUrl) {
      const ctaUrl = article.zapiiCTA.linkUrl;
      const alreadyHaveCTA = links.some(l => l.url === ctaUrl);
      if (!alreadyHaveCTA) {
        links.push({
          title: article.zapiiCTA.buttonText || article.zapiiCTA.title || "Request Custom Engineering Quote",
          url: ctaUrl
        });
      }
    }

    return links;
  };

  const filteredArticles = getFilteredArticles();
  const featuredArticle = filteredArticles.find((art) => art.status === "published");
  const allFeedArticles = filteredArticles.filter((art) => art.status === "published");

  const totalPages = Math.ceil(allFeedArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const feedArticles = allFeedArticles.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8" id="newsletter-hub-root">
      {/* Editorial Search-Intent Masthead */}
      {!activeArticle && (
        <div className="border-b border-zinc-200 dark:border-white/5 pb-6 mb-4 space-y-4">
          {/* Majestic print style newspaper metadata bar */}
          <div className="flex items-center justify-between border-y-2 border-zinc-900 dark:border-white/10 py-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none font-bold">
            <span className="hidden md:inline">EST. 2026 • LAGOS METROPOLIS EDITION</span>
            <span className="text-red-650 dark:text-red-500 font-semibold text-[10px]">THURSDAY, JUNE 4, 2026</span>
            <span className="hidden md:inline">PRICE: COMPLIMENTARY LEVEL-3 DATA</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-serif max-w-xl">
                Authored by Larry Sage.
              </p>
            </div>

            {/* In-Page Keyword Search */}
            <div className="relative w-full md:w-72 flex-shrink-0">
              <Search className="absolute left-3 top-2.5 text-zinc-500 dark:text-zinc-650 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keywords or articles..."
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-450 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans"
              />
            </div>
          </div>

          {/* Quick search filters using active long-tail tags */}
          {searchQuery && (
            <div className="flex flex-wrap items-center gap-1.5 mt-4">
              <span className="font-mono text-[9px] text-zinc-405 dark:text-zinc-500 uppercase mr-1">Active Filter:</span>
              <span className="text-[9px] font-mono bg-red-550/10 text-red-600 dark:text-red-400 font-semibold rounded-full px-2.5 py-0.5">
                {searchQuery}
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-[9px] font-mono text-zinc-500 hover:text-red-600 dark:hover:text-white underline ml-1.5 cursor-pointer"
              >
                Clear query
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Immersive Reading Portal */}
      {activeArticle ? (
        <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
          {/* Back Nav Button */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-4">
            <button
              onClick={() => { setActiveArticle(null); }}
              className="flex items-center gap-1.5 text-xs font-mono font-medium bg-white hover:bg-zinc-100 text-zinc-750 hover:text-zinc-900 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer group border border-zinc-200 dark:border-white/5 rounded-lg py-2 px-3.5 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Pulse AI Catalog</span>
            </button>
          </div>

          {/* Majestic News Editorial Header */}
          <div className="space-y-4 pb-6 border-b border-zinc-200 dark:border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-red-50 dark:bg-red-955 text-red-600 dark:text-red-400 border border-red-250 dark:border-red-900/40 text-[9px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
                {activeArticle.category}
              </span>
              <span className="text-zinc-400 dark:text-zinc-550 font-mono text-[10px]">/</span>
              <span className="text-zinc-500 dark:text-zinc-500 font-mono text-[10px] flex items-center gap-1">
                <Clock size={11.5} />
                {activeArticle.readTime}
              </span>
            </div>

            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight">
              {activeArticle.title}
            </h1>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
              <div className="flex items-center gap-2.5">
                <span className="text-zinc-405 dark:text-zinc-350 font-medium">By {activeArticle.author || "Larry Sage"}</span>
                <span>•</span>
                <span>{new Date(activeArticle.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {activeArticle.views || 0} Views
                </span>
              </div>
            </div>
          </div>

          {/* Beautiful Story Narrative Content (Markdown styled with elegant serif typography) */}
          <div className="space-y-6">
            <article className={`prose ${theme === "light" ? "prose-zinc" : "prose-invert"} max-w-none`}>
              {renderMarkdown(
                (() => {
                  if (!activeArticle.content) return "";
                  let cleaned = activeArticle.content;
                  const cutoffs = [
                    "## Frequently Asked Questions",
                    "### Frequently Asked Questions",
                    "### Suggested Featured Image Concept",
                    "Suggested Featured Image Concept",
                    "### Suggested Internal Links",
                    "Suggested Internal Links",
                    "### Tags",
                    "### Suggested Links",
                    "Suggested Links",
                    "If you want a website",
                    "Learn more at:",
                    "Contact Larry Sage on WhatsApp",
                    "Need to eliminate server downtime",
                    "Need custom systems or automation"
                  ];
                  for (const marker of cutoffs) {
                    const index = cleaned.indexOf(marker);
                    if (index !== -1) {
                      cleaned = cleaned.substring(0, index);
                    }
                  }
                  cleaned = cleaned.trim();
                  while (cleaned.endsWith("---") || cleaned.endsWith(",") || cleaned.endsWith("\"") || cleaned.endsWith("*") || cleaned.endsWith("-")) {
                    cleaned = cleaned.replace(/(---|,|"|\*|-)$/, "").trim();
                  }
                  return cleaned;
                })()
              )}
            </article>
          </div>

          {/* Genuine Writer Personality & Authority Bio Block */}
          <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 my-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="relative flex-shrink-0">
              <LarrySageLogo className="w-14 h-14" />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 border-2 border-white dark:border-zinc-800 flex items-center justify-center" title="Online & Active Now">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              </span>
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif font-bold text-zinc-900 dark:text-white text-base">Written by Larry Sage</h4>
                <span className="bg-red-50 dark:bg-red-955 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded font-bold">
                  Systems Architect
                </span>
              </div>
              <p className="text-zinc-650 dark:text-zinc-300 text-xs leading-relaxed max-w-2xl font-serif italic">
                I build secure mobile applications, enterprise websites, customized marketplaces, and cloud automation networks. My passion is helping fast-growing platforms bypass traditional SaaS subscription traps and cut high infrastructure bills through hand-coded backend pipelines.
              </p>
            </div>
          </div>

          {/* Recommended Outbound Resource Connections & Links */}
          {(() => {
            const outboundLinks = getOutboundLinks(activeArticle);
            if (outboundLinks.length === 0) return null;
            return (
              <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-white/5 font-sans">
                <div className="flex items-center gap-2 pb-1">
                  <ExternalLink size={14} className="text-red-550 dark:text-red-400" />
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-zinc-955 dark:text-zinc-50 uppercase tracking-tight">
                    Recommended Resource Portals & Outbound Links
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                  {outboundLinks.map((link, idx) => {
                    let domain = "";
                    try {
                      // Attempt to map hostname
                      const urlWithProtocol = link.url.startsWith("http") ? link.url : `https://${link.url}`;
                      const urlObj = new URL(urlWithProtocol);
                      domain = urlObj.hostname;
                    } catch (e) {
                      if (link.url.includes("wa.me")) {
                        domain = "wa.me (WhatsApp)";
                      } else {
                        domain = "outbound-link";
                      }
                    }
                    if (domain.startsWith("www.")) {
                      domain = domain.substring(4);
                    }
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all shadow-xs group"
                      >
                        <div className="space-y-1.5 pr-3 text-left">
                          <p className="font-serif font-bold text-xs text-zinc-900 dark:text-white group-hover:text-red-650 dark:group-hover:text-red-400 transition-colors">
                            {link.title}
                          </p>
                          <p className="font-mono text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                            {domain}
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 group-hover:bg-red-50 dark:group-hover:bg-red-955/20 text-zinc-405 group-hover:text-red-655 flex items-center justify-center transition-all flex-shrink-0">
                          <ExternalLink size={12} className="group-hover:scale-105 transition-transform" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ==========================================
              PRIMARY HIGH-CONVERTING VISUAL CTA BLOCK (Requested verbatim)
              ========================================== */}
          <div className="rounded-2xl border-2 border-red-505/20 bg-red-50/10 dark:bg-red-955/5 p-6 md:p-8 shadow-md relative overflow-hidden my-8 animate-fade-in" id="pulse-editorial-cta-banner">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-zinc-955 dark:text-red-500">
              <Cpu size={120} className="text-red-500 animate-pulse" />
            </div>

            <div className="relative z-10 space-y-5">
              <div className="space-y-2">
                <span className="bg-red-600 text-white text-[8px] font-mono uppercase font-bold tracking-widest px-2.5 py-1 rounded">
                  Get a Free Systems Architecture Quote
                </span>
                <h3 className="font-serif font-bold text-zinc-950 dark:text-zinc-50 text-base sm:text-lg md:text-xl tracking-tight leading-snug">
                  If you want a website, mobile app or a business system, send me a message through WhatsApp or submit the form request to receive a quote!
                </h3>
                <p className="text-zinc-650 dark:text-zinc-450 text-xs leading-relaxed max-w-2xl font-serif font-normal">
                  Skip generic AI placeholders, bloated platforms, and massive monthly USD subscription plans. Talk directly to me about hand-coded backend databases, API pipelines, or bespoke systems crafted to fit your enterprise budgets perfectly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1.5">
                <a
                  href={`https://api.whatsapp.com/send?phone=2347074222772&text=${encodeURIComponent("Hello Larry, I read your article on Pulse AI. I am interested in requesting a quote for a custom website, mobile app, or business system.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-3 px-5 rounded-xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-red-500/10"
                >
                  <MessageSquare size={13.5} />
                  <span>Send Message via WhatsApp</span>
                  <ExternalLink size={11} />
                </a>
                <button
                  onClick={() => {
                    setActiveTab("contact");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="cursor-pointer border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-805 text-zinc-650 dark:text-zinc-350 text-xs font-semibold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Submit Form Quote Request</span>
                </button>
              </div>
            </div>
          </div>

          {/* Continuous Engagement Maze (Semantic Web) */}
          <div className="p-5 border border-zinc-200 dark:border-white/5 rounded-xl bg-white dark:bg-zinc-950 font-sans space-y-3.5 shadow-sm">
            <h4 className="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Code size={13} className="text-red-500" />
              <span>Explore More Publications</span>
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              Read other highly practical tech and automation articles customized for Nigerian growth ecosystems:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
              {articles.filter(a => a.id !== activeArticle.id && a.status === "published").slice(0, 2).map(a => (
                <div 
                  key={a.id} 
                  onClick={() => handleOpenArticle(a.slug)}
                  className="p-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-lg cursor-pointer group transition-all duration-150 shadow-xs"
                >
                  <span className="text-[9px] font-mono font-medium text-red-600 dark:text-red-505 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-900/40 px-2 py-0.5 rounded capitalize block mb-1 w-max">
                    {a.category}
                  </span>
                  <h5 className="font-medium text-zinc-800 dark:text-white text-xs group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors tracking-tight line-clamp-1">
                    {a.title}
                  </h5>
                  <p className="text-zinc-500 text-[10px] mt-1 tracking-tight line-clamp-1">{a.excerpt}</p>
                </div>
              ))}
              {articles.filter(a => a.id !== activeArticle.id && a.status === "published").length === 0 && (
                <div className="sm:col-span-2 text-center text-zinc-650 font-mono text-[10px] py-4">
                  (Request more custom news articles to see related publications)
                </div>
              )}
            </div>
          </div>

          {/* Social Sharing Actions Row */}
          <div className="p-4 border border-zinc-200 dark:border-white/5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Share This Publication:</span>
              <span className="text-[9px] bg-red-100 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-mono font-bold uppercase py-0.5 px-2 rounded-md">
                +100 Growth Rank
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(activeArticle.title)}&url=${encodeURIComponent(window.location.origin + "/news/" + activeArticle.slug)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 hover:border-red-500 dark:hover:border-red-500 rounded-lg text-zinc-650 dark:text-zinc-400 hover:text-red-650 dark:hover:text-red-500 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                title="Share on Twitter / X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activeArticle.title + " - " + window.location.origin + "/news/" + activeArticle.slug)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 hover:border-green-500 dark:hover:border-green-500 rounded-lg text-zinc-650 dark:text-zinc-400 hover:text-green-600 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                title="Share on WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.004 2c-5.51 0-9.993 4.483-9.993 9.993 0 1.763.461 3.483 1.34 5.006L2 22l5.129-1.346c1.472.802 3.125 1.226 4.871 1.226 5.512 0 9.997-4.481 9.997-9.987C22 7.483 17.514 2 12.004 2zm5.248 13.97c-.226.643-1.118 1.185-1.536 1.264-.383.072-.821.127-2.396-.499-1.996-.796-3.266-2.822-3.366-2.956-.099-.133-.808-1.077-.808-2.054a2.12 2.12 0 0 1 .632-1.583c.2-.201.432-.25.578-.25.146 0 .292.001.417.008.132.006.31.026.471.411.165.393.567 1.378.616 1.477.05.1.082.216.016.35-.066.132-.099.215-.198.331-.099.117-.208.261-.297.35-.099.1-.202.209-.088.406.115.197.511.84.11 1.5C11.523 14.155 12.564 14.49 13 14.7c.18.066.282.049.382-.066.1-.115.432-.5.548-.68.115-.181.232-.15.398-.088.166.062 1.047.494 1.228.583.181.089.3.133.344.209.043.076.043.439-.183 1.082z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/news/" + activeArticle.slug)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 hover:border-blue-600 dark:hover:border-blue-600 rounded-lg text-zinc-650 dark:text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                title="Share on LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              {/* Copy Article Link */}
              <button
                onClick={() => {
                  const simulatedPath = `${window.location.origin}/news/${activeArticle.slug}`;
                  navigator.clipboard.writeText(simulatedPath);
                  setShareToast("Article link copied!");
                  setTimeout(() => setShareToast(null), 2500);
                }}
                className="cursor-pointer p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 hover:border-red-500 rounded-lg hover:text-red-500 transition-all flex items-center justify-center relative shadow-xs"
                title="Copy share path to clipboard"
              >
                <Copy size={13} />
                {shareToast && (
                  <span className="absolute bottom-full mb-2 bg-zinc-900 border border-white/5 text-white font-mono text-[9px] py-1 px-2 rounded shadow-xl whitespace-nowrap z-10 animate-fade-in">
                    {shareToast}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Comments Discussion Hub */}
          <div className="p-5 border border-zinc-200 dark:border-white/5 rounded-xl bg-white dark:bg-zinc-950 font-sans space-y-4 shadow-sm" id="article-discussion-hub">
            <h4 className="font-sans font-semibold text-zinc-800 dark:text-white text-sm tracking-tight flex items-center gap-2">
              <MessageSquare size={15} className="text-red-500" />
              <span>Discussion Board ({comments.length})</span>
            </h4>

            {/* Existing comments listing */}
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="py-6 text-center text-zinc-400 dark:text-zinc-650 font-mono text-[10px] uppercase tracking-wider">
                  No comments have been posted to this article yet.
                </div>
              ) : (
                comments.map((cmt) => (
                  <div key={cmt.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-lg flex gap-3">
                    {/* User profile avatar circle */}
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 border border-red-200 dark:border-red-900/30">
                      {cmt.userName ? cmt.userName.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-white">{cmt.userName}</span>
                          <span className="text-[9px] text-zinc-400 font-mono">{new Date(cmt.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Moderator action - Delete comment */}
                        {(currentUser?.isAdmin || (currentUser && currentUser.email === cmt.userEmail)) && (
                          <button
                            onClick={() => handleDeleteComment(cmt.id)}
                            className="text-zinc-400 hover:text-red-650 transition-colors font-mono text-[9px] uppercase hover:underline cursor-pointer"
                            title="Moderator deletion capability"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-zinc-650 dark:text-zinc-350 text-xs leading-relaxed font-sans">{cmt.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment submittal form or registration gated prompt */}
            {currentUser ? (
              <form onSubmit={handleAddCommentSubmit} className="space-y-3 pt-2.5 border-t border-zinc-100 dark:border-white/5" id="comment-add-form">
                <div>
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your technical observation or ask library details..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-lg py-2 px-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans animate-fade-in"
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-zinc-450 font-mono">Character limit: 500 max</span>
                    {commentMsg && (
                      <span className={`text-[10px] font-mono ${commentMsg.type === "success" ? "text-green-500" : "text-red-500"}`}>
                        {commentMsg.type === "success" ? "✓" : "⚠️"} {commentMsg.text}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="cursor-pointer bg-red-650 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>{submitLoading ? "Submitting..." : "Send Comment"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 rounded-xl text-center space-y-2.5">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                  Join the Tech Discussion: Leave comments, receive updates, and interface directly with Larry Sage.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      if (setShowLoginModal && setAuthMode) {
                        setAuthMode("signin");
                        setShowLoginModal(true);
                      }
                    }}
                    className="cursor-pointer font-mono text-[9px] uppercase tracking-wider font-bold text-red-650 dark:text-red-500 hover:text-red-700 underline"
                  >
                    Sign In
                  </button>
                  <span className="text-zinc-400 text-[10px]">•</span>
                  <button
                    onClick={() => {
                      if (setShowLoginModal && setAuthMode) {
                        setAuthMode("signup");
                        setShowLoginModal(true);
                      }
                    }}
                    className="cursor-pointer font-mono text-[9px] uppercase tracking-wider font-bold text-red-650 dark:text-red-500 hover:text-red-700 underline"
                  >
                    Join Hub / Register
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Back */}
          <div className="pt-6 border-t border-zinc-200 dark:border-white/5 flex justify-between items-center text-xs">
            <button
              onClick={() => { setActiveArticle(null); setSubTab("article"); }}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-mono cursor-pointer"
            >
              ← Back to Catalog Hub
            </button>
            <span className="text-zinc-450 dark:text-zinc-650 font-mono">Pulse Index Machine</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Silo category pills filter with high-contrast dual theme support */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer px-3.5 py-1.5 rounded-full border text-xs font-sans font-medium whitespace-nowrap transition-all duration-150 ${
                  selectedCategory === cat
                    ? "bg-red-650 border-red-650 text-white font-semibold shadow-sm"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-400 dark:border-white/5 dark:hover:border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-zinc-500 font-mono text-xs">
              <RefreshCw className="animate-spin mr-2 h-4 w-4" />
              RETRIEVING PULSE SEARCH NODES...
            </div>
          ) : getFilteredArticles().length === 0 ? (
            <div className="py-20 border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/30 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
              <AlertCircle className="text-zinc-400 dark:text-zinc-700 w-10 h-10 mb-2.5 stroke-[1.2]" />
              <p className="font-mono text-xs text-zinc-500">NO VISIBLE SEARCH ENTRIES FOUND</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-600 max-w-[280px] mt-1">
                Try typing another keyword query or visit the CMS Console to compile new copies instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Featured Story and Trending Side-by-Side (High-precision Newspaper Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Featured Card */}
                {featuredArticle ? (
                  <div className="lg:col-span-8">
                    <div
                      onClick={() => handleOpenArticle(featuredArticle.slug)}
                      className="group cursor-pointer rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 hover:border-red-600/30 p-6 shadow-md dark:shadow-xl transition-all duration-200 relative overflow-hidden h-full flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-red-600 text-white text-[9px] uppercase font-bold px-2.5 py-0.5 tracking-tighter rounded shadow-sm">
                            Featured Story
                          </span>
                          <span className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-[8px] font-mono uppercase font-semibold px-2 py-0.5 rounded">
                            {featuredArticle.category}
                          </span>
                          <span className="text-zinc-400 dark:text-zinc-600 font-mono text-[9px]">/</span>
                          <span className="text-zinc-500 dark:text-zinc-500 font-mono text-[9px] flex items-center gap-1">
                            <Clock size={11} />
                            {featuredArticle.readTime}
                          </span>
                          <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[9px] mx-1">/</span>
                          <span className="text-zinc-500 dark:text-zinc-500 font-mono text-[9px] flex items-center gap-1">
                            <Eye size={11} />
                            {featuredArticle.views || 0} Views
                          </span>
                        </div>

                        <h2 className="font-serif font-black text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 group-hover:text-red-655 dark:group-hover:text-red-405 transition-colors tracking-tight leading-tight">
                          {featuredArticle.title}
                        </h2>

                        <p className="text-zinc-650 dark:text-zinc-405 text-xs sm:text-sm leading-relaxed line-clamp-3 font-serif">
                          {featuredArticle.excerpt}
                        </p>
                      </div>

                      <div className="pt-5 mt-6 border-t border-zinc-150 dark:border-white/5 flex flex-wrap items-center justify-between text-[10px] text-zinc-500 font-mono gap-2">
                        <div className="flex items-center gap-2">
                          <span>By {featuredArticle.author}</span>
                          <span>•</span>
                          <span>{new Date(featuredArticle.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                        <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          <span>Read full document</span>
                          <ChevronRight size={11.5} />
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Right: Dynamic Trending Channel (Inspired directly by Pulse AI branding) */}
                <div className="lg:col-span-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-xl space-y-4">
                  <div 
                    onClick={() => {
                      const mainPost = articles.find(a => a.slug === "local-nigerian-businesses-sell-worldwide-zapii-marketplace") 
                        || articles.find(a => a.status === "published");
                      if (mainPost) handleOpenArticle(mainPost.slug);
                    }}
                    className="flex items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                    title="Click to view our main post"
                  >
                    <h3 className="font-serif font-black text-xs text-zinc-950 dark:text-zinc-50 tracking-widest uppercase flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                      <span>Trending Topics</span>
                    </h3>
                    <span className="text-red-500 text-[10px] font-bold font-mono uppercase tracking-wider animate-pulse">Live</span>
                  </div>

                  <div className="divide-y divide-zinc-150 dark:divide-white/5 space-y-1">
                    {[...articles]
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, 6)
                      .map((trend, idx) => {
                        const displayViews = `${trend.views || 0} views`;
                        return (
                          <div 
                            key={idx} 
                            className="pt-2 group cursor-pointer block"
                            onClick={() => {
                              handleOpenArticle(trend.slug);
                            }}
                          >
                            <div className="flex gap-2.5 items-start p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border border-transparent hover:border-zinc-200 dark:hover:border-white/5 transition-all duration-150">
                              {/* Inner double-circle red bullet point layout (Screenshot 3 style) */}
                              <div className="relative flex-shrink-0 mt-1.5 flex items-center justify-center w-3 h-3 rounded-full border border-red-500 animate-pulse">
                                <div className="w-1 h-1 rounded-full bg-red-650"></div>
                              </div>
                              
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <span className="text-[7px] font-mono font-bold text-red-600 dark:text-red-500 tracking-wider block uppercase">
                                  {trend.category}
                                </span>
                                <p className="font-serif text-[12px] text-zinc-900 dark:text-zinc-100 leading-snug font-bold group-hover:text-red-655 dark:group-hover:text-red-410 transition-colors line-clamp-2">
                                  {trend.title}
                                </p>
                                <div className="flex items-center justify-between pt-0.5">
                                  <span className="font-mono text-[8px] text-zinc-500 dark:text-zinc-500 flex items-center gap-1.5">
                                    <Eye size={10} className="inline opacity-80" />
                                    <span>{displayViews}</span>
                                  </span>
                                  <span className="text-[7.5px] font-mono text-zinc-400 group-hover:text-red-500 font-bold tracking-tight uppercase flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Read Now</span>
                                    <ChevronRight size={8} />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  HOME CLASSIFIED BRANDING PARTNER BANNER (Verbatim requested pathways)
                  ========================================================================= */}
              <div className="rounded-2xl border-2 border-red-500/10 bg-zinc-50 dark:bg-[#0c0c0e] hover:bg-zinc-100/60 dark:hover:bg-[#121215] p-6 lg:p-8 relative overflow-hidden transition-all duration-200 border-zinc-200 dark:border-white/5 mt-4" id="home-classified-promotional-cta">
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] dark:opacity-[0.04] pointer-events-none text-zinc-950 dark:text-red-500">
                  <Workflow size={150} className="text-red-500" />
                </div>
                
                <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-3xl text-left">
                    <span className="inline-flex items-center gap-1 bg-red-650 text-white text-[8px] font-mono uppercase font-bold tracking-widest px-2.5 py-1 rounded">
                      <Sparkles size={11} />
                      DIRECT FROM SYSTEM BUILDERS
                    </span>
                    <h3 className="font-serif font-black text-xl sm:text-2xl text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
                      If you want a website, mobile app or a business system, send us a message through WhatsApp or submit the form request below to receive a custom quote!
                    </h3>
                    <p className="text-zinc-655 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed font-serif font-normal">
                      Larry Sage builds secure mobile applications, enterprise websites, customized marketplaces, and cloud automation networks. His passion is helping fast-growing platforms bypass traditional SaaS subscription traps and cut high infrastructure bills through hand-coded backend pipelines.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-72 flex-shrink-0 justify-center">
                    <a
                      href={`https://api.whatsapp.com/send?phone=2347074222772&text=${encodeURIComponent("Hello Larry, I read your article on Pulse AI. I am interested in requesting a quote for a custom website, mobile app, or business system.")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="cursor-pointer bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-red-500/20 text-center"
                    >
                      <MessageSquare size={14} />
                      <span>Message on WhatsApp</span>
                    </a>
                    
                    <button
                      onClick={() => {
                        setActiveTab("contact");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="cursor-pointer bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-xs font-bold py-3 px-5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 border border-zinc-700/50 dark:border-transparent text-center"
                    >
                      <Code size={14} />
                      <span>Submit Request For Quote</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Latest News Feed elements in 2-column grid layout */}
              {feedArticles.length > 0 ? (
                <div className="space-y-4">
                  <div id="publications-feed-header" className="flex items-center gap-2 border-b border-zinc-200 dark:border-white/5 pb-2 mb-4">
                    <span className="w-1 h-3 bg-red-650 rounded-sm"></span>
                    <h3 className="font-serif font-black text-xs text-zinc-950 dark:text-zinc-50 uppercase tracking-widest">
                      Latest Publications feed
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedArticles.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => handleOpenArticle(art.slug)}
                        className="group cursor-pointer rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#09090b] hover:bg-zinc-50 dark:hover:bg-zinc-900/40 p-5 shadow-xs transition-all duration-200 hover:border-red-600/25 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-zinc-100 dark:bg-[#1c1c20] text-zinc-500 dark:text-zinc-400 text-[8px] font-mono uppercase font-semibold px-2 py-0.5 rounded border border-zinc-200 dark:border-white/5">
                              {art.category}
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-650 font-mono text-[9px]">•</span>
                            <span className="text-zinc-500 dark:text-zinc-500 font-mono text-[9px] flex items-center gap-1">
                              <Clock size={11} />
                              {art.readTime}
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-650 font-mono text-[9px]">•</span>
                            <span className="text-zinc-500 dark:text-zinc-500 font-mono text-[9px] flex items-center gap-1">
                              <Eye size={11} strokeWidth={2.4} />
                              {art.views || 0} Views
                            </span>
                          </div>

                          <h3 className="font-serif font-black text-[15px] sm:text-[17px] text-zinc-950 dark:text-zinc-50 group-hover:text-red-655 dark:group-hover:text-red-405 transition-colors tracking-tight leading-snug">
                            {art.title}
                          </h3>

                          <p className="text-zinc-655 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2 font-serif">
                            {art.excerpt}
                          </p>
                        </div>

                        <div className="pt-4 flex items-center justify-between text-[9px] text-zinc-500 font-mono border-t border-zinc-150 dark:border-white/5 mt-4">
                          <span>{new Date(art.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="flex items-center gap-1 font-semibold group-hover:text-red-650 dark:group-hover:text-red-400 transition-all">
                            <span>Read article</span>
                            <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clean newspaper-style pagination control */}
                  {totalPages > 1 && (
                    <div id="publications-pagination" className="flex items-center justify-between border-y border-zinc-200 dark:border-white/5 py-4 mt-8 select-none font-mono text-[10px]">
                      <button
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                            const el = document.getElementById("publications-feed-header");
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            } else {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }
                        }}
                        disabled={currentPage === 1}
                        className="cursor-pointer font-bold uppercase tracking-wider text-zinc-650 hover:text-red-650 dark:text-zinc-400 dark:hover:text-red-400 transition-colors disabled:opacity-35 disabled:hover:text-zinc-650 flex items-center gap-1"
                      >
                        ← Prev Page
                      </button>
                      
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(() => {
                          const pages: (number | string)[] = [];
                          if (totalPages <= 7) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                          } else {
                            pages.push(1);
                            if (currentPage > 3) {
                              pages.push("ellipsis-start");
                            }
                            
                            const start = Math.max(2, currentPage - 1);
                            const end = Math.min(totalPages - 1, currentPage + 1);
                            
                            for (let i = start; i <= end; i++) {
                              pages.push(i);
                            }
                            
                            if (currentPage < totalPages - 2) {
                              pages.push("ellipsis-end");
                            }
                            
                            pages.push(totalPages);
                          }

                          return pages.map((page, idx) => {
                            if (page === "ellipsis-start" || page === "ellipsis-end") {
                              return (
                                <span key={page} className="px-1.5 text-zinc-400 dark:text-zinc-600 font-mono text-[9px]">
                                  ...
                                </span>
                              );
                            }
                            return (
                              <button
                                key={`page-${page}`}
                                onClick={() => {
                                  setCurrentPage(page as number);
                                  const el = document.getElementById("publications-feed-header");
                                  if (el) {
                                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                                  } else {
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }
                                }}
                                className={`cursor-pointer px-2.5 py-1 rounded transition-all duration-150 text-[9.5px] font-semibold ${
                                  currentPage === page
                                    ? "bg-red-650 text-white shadow-xs"
                                    : "text-zinc-600 hover:text-red-655 dark:text-zinc-400 dark:hover:text-red-415"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      <button
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                            const el = document.getElementById("publications-feed-header");
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            } else {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }
                        }}
                        disabled={currentPage === totalPages}
                        className="cursor-pointer font-bold uppercase tracking-wider text-zinc-650 hover:text-red-650 dark:text-zinc-400 dark:hover:text-red-400 transition-colors disabled:opacity-35 disabled:hover:text-zinc-650 flex items-center gap-1"
                      >
                        Next Page →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-200 dark:border-white/5 rounded-2xl p-8 bg-zinc-50/50 dark:bg-zinc-955/10">
                  <div className="p-3 bg-red-50 dark:bg-red-955/20 text-red-610 dark:text-red-400 rounded-full mb-3">
                    <Search className="w-5 h-5 text-red-500" />
                  </div>
                  <h4 className="font-serif font-bold text-zinc-900 dark:text-white text-sm mb-1">No articles match your query</h4>
                  <p className="text-zinc-500 dark:text-zinc-450 text-xs max-w-sm mb-5 leading-relaxed font-sans">
                    We couldn't find any results for "{searchQuery}". Try searching for dynamic Nigeria AI news or professional developer terms.
                  </p>
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    <button
                      onClick={() => setSearchQuery("")}
                      className="cursor-pointer text-[11px] font-mono border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950 text-zinc-750 dark:text-zinc-350 px-3.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all shadow-xs"
                    >
                      Clear Search
                    </button>
                    <a
                      href="https://wa.me/2347074222772"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer text-[11px] font-sans font-medium bg-red-600 text-white hover:bg-red-700 px-4 py-1.5 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>Contact Larry Sage on WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
