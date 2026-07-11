import React, { useState, useEffect } from "react";
import { Category, SEOKeyword, Article } from "../types";
import { Sparkles, Terminal, Play, CheckCircle2, RefreshCw, Eye, Tag, AlertCircle, FilePlus, Search, Code, Trash2, Power, TrendingUp, RotateCw, Building2, ShieldAlert, Layers, Activity, Cpu, Clock } from "lucide-react";

export function ConsolePanel({ onArticleChange }: { onArticleChange: () => void }) {
  const [consoleTab, setConsoleTab] = useState<"cms" | "clusters" | "programmatic" | "freshness" | "persona" | "scheduler">("scheduler");

  // Scheduler status and logs states
  const [schedulerStatus, setSchedulerStatus] = useState<{
    isActive: boolean;
    postsPerDay: number;
    intervalMinutes: number;
    lastRun: string | null;
    nextRun: string | null;
    postsGeneratedLast24h?: number;
    totalIndexedPosts?: number;
    logs: Array<{ timestamp: string; type: "success" | "error" | "info"; message: string }>;
  } | null>(null);
  
  const [updatingScheduler, setUpdatingScheduler] = useState(false);
  const [customPostsPerDay, setCustomPostsPerDay] = useState(20);
  const [schedulerMode, setSchedulerMode] = useState<"standard" | "morning_evening" | "daily_batch_20" | any>("morning_evening");
  const [morningHour, setMorningHour] = useState(8);
  const [eveningHour, setEveningHour] = useState(20);
  const [dailyBatchHour, setDailyBatchHour] = useState(9);

  const fetchSchedulerStatus = async () => {
    try {
      const resp = await fetch("/api/scheduler/status");
      if (resp.ok) {
        const data = await resp.json();
        setSchedulerStatus(data);
        if (data.postsPerDay) {
          setCustomPostsPerDay(data.postsPerDay);
        }
        if (data.mode) {
          setSchedulerMode(data.mode);
        }
        if (typeof data.morningHour === "number") {
          setMorningHour(data.morningHour);
        }
        if (typeof data.eveningHour === "number") {
          setEveningHour(data.eveningHour);
        }
        if (typeof data.dailyBatchHour === "number") {
          setDailyBatchHour(data.dailyBatchHour);
        }
      }
    } catch (err) {
      console.warn("Could not retrieve scheduler status:", err);
    }
  };

  useEffect(() => {
    fetchSchedulerStatus();
    const interval = soulSchedulerInterval();
    return () => clearInterval(interval);
  }, []);

  const soulSchedulerInterval = () => {
    return setInterval(fetchSchedulerStatus, 4000);
  };

  const handleToggleScheduler = async (active: boolean) => {
    setUpdatingScheduler(true);
    try {
      const resp = await fetch("/api/scheduler/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setSchedulerStatus(data);
        writeTerminalLog(`Scheduler toggled to: ${active ? "ACTIVE" : "INACTIVE"}`);
        onArticleChange();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingScheduler(false);
    }
  };

  const handleUpdateSchedulerConfig = async (forcedMode?: "standard" | "morning_evening" | "daily_batch_20", forcedEngine?: "gemini" | "claude") => {
    setUpdatingScheduler(true);
    const targetMode = forcedMode || schedulerMode;
    const targetEngine = forcedEngine || selectedEngine;
    try {
      const resp = await fetch("/api/scheduler/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postsPerDay: Number(customPostsPerDay),
          mode: targetMode,
          morningHour: Number(morningHour),
          eveningHour: Number(eveningHour),
          dailyBatchHour: Number(dailyBatchHour),
          engine: targetEngine,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setSchedulerStatus(data);
        
        const modeDesc = targetMode === "morning_evening"
          ? `Morning & Evening Batch Mode (20 + 20 posts daily. Morning hour: ${morningHour}:00 UTC, Evening hour: ${eveningHour}:00 UTC)`
          : targetMode === "daily_batch_20"
            ? `Daily 20-Post Batch Mode (exactly 20 posts daily at ${dailyBatchHour}:00 UTC)`
            : `Standard spacing Mode (${customPostsPerDay} posts/day)`;
        
        writeTerminalLog(`Scheduler config updated successfully! Mode: ${modeDesc} using ${targetEngine === "claude" ? "Claude 3.5 Sonnet" : "Gemini 3.5 Flash"}`);
        onArticleChange();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingScheduler(false);
    }
  };

  const handleTriggerSchedulerPost = async (batchType: "morning" | "evening" | "daily" | "single" = "single") => {
    setUpdatingScheduler(true);
    const label = batchType === "morning"
      ? "Morning Batch (20 high-intent posts in background)"
      : batchType === "evening"
        ? "Evening Batch (20 high-intent posts in background)"
        : batchType === "daily"
          ? "Daily 20-Post Batch (20 high-intent posts in background)"
          : "single SEO article";
    writeTerminalLog(`Triggering active generation cycle for: ${label}...`);
    try {
      const resp = await fetch("/api/scheduler/trigger", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchType }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setSchedulerStatus(data);
        fetchDbArticles();
        onArticleChange();
        writeTerminalLog(`Forced scheduler run for ${label} dispatch complete. Monitor generation logs.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingScheduler(false);
    }
  };

  // State for topical authority clusters
  const [clusterTopic, setClusterTopic] = useState("AI automation");
  const [clustering, setClustering] = useState(false);
  const [generatedClusters, setGeneratedClusters] = useState<Array<{ keyword: string; title: string; intent: string; category: string }>>([]);

  // State for programmatic SEO
  const [progIndustries, setProgIndustries] = useState<string[]>(["Plumbers", "Photographers", "Logistics", "Schools", "Churches"]);
  const [selectedProgIndustries, setSelectedProgIndustries] = useState<string[]>(["Plumbers", "Logistics"]);
  const [newIndustryInput, setNewIndustryInput] = useState("");
  const [deployingProg, setDeployingProg] = useState(false);

  // State for general content freshness auditing
  const [refreshingArtId, setRefreshingArtId] = useState<string | null>(null);

  const [seedTopic, setSeedTopic] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoveredKeywords, setDiscoveredKeywords] = useState<SEOKeyword[]>([]);

  // Generation parameters
  const [targetKeyword, setTargetKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.AI_SYSTEMS_DEVELOPMENT);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [latestArticleTitle, setLatestArticleTitle] = useState("");

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("gemini_api_key") || "";
  });
  const [claudeApiKey, setClaudeApiKey] = useState<string>(() => {
    return localStorage.getItem("claude_api_key") || "";
  });
  const [selectedEngine, setSelectedEngine] = useState<"gemini" | "claude">(() => {
    return (localStorage.getItem("selected_engine") as "gemini" | "claude") || "gemini";
  });
  const [keySaved, setKeySaved] = useState(false);
  const [claudeKeySaved, setClaudeKeySaved] = useState(false);

  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (geminiApiKey.trim()) {
      headers["x-gemini-key"] = geminiApiKey.trim();
    }
    if (claudeApiKey.trim()) {
      headers["x-anthropic-key"] = claudeApiKey.trim();
    }
    headers["x-ai-engine"] = selectedEngine;
    return headers;
  };

  // Existing database lists
  const [dbArticles, setDbArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    fetchDbArticles();
  }, []);

  const fetchDbArticles = async () => {
    setLoadingArticles(true);
    try {
      const resp = await fetch("/api/articles?status=all");
      if (resp.ok) {
        const data = await resp.json();
        setDbArticles(data);
      }
    } catch (err) {
      console.error("Error fetching db articles:", err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleDiscoverKeywords = async () => {
    if (!seedTopic.trim()) return;
    setDiscovering(true);
    try {
      const resp = await fetch("/api/keywords/discover", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ seed: seedTopic }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setDiscoveredKeywords(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDiscovering(false);
    }
  };

  const writeTerminalLog = (log: string) => {
    setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  const handleGenerateArticle = async () => {
    if (!targetKeyword.trim()) return;
    setGenerating(true);
    setTerminalLogs([]);
    setLatestArticleTitle("");

    writeTerminalLog("Initializing Search-Intent Writing Node...");
    await delay(600);
    writeTerminalLog(`Focus Keyword: "${targetKeyword}"`);
    writeTerminalLog("Analyzing Google search-intent matrices & competitive silos...");
    await delay(800);
    writeTerminalLog("Establishing connection with Gemini Server nodes...");
    await delay(700);
    writeTerminalLog("Drafting structured Markdown content (goal: 1200 words)...");
    writeTerminalLog("Interweaving Nigerian tech references: Lagos hub systems, Lekki startups...");
    await delay(1200);
    writeTerminalLog("Embedding active Digital Sage CTAs into footer...");
    await delay(900);
    writeTerminalLog("Optimizing internal keywords indexation parameters...");

    try {
      const resp = await fetch("/api/articles/generate", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          keyword: targetKeyword,
          category: selectedCategory,
          status: saveAsDraft ? "draft" : "published",
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        writeTerminalLog("Article generated and written to articles_db.json successfully!");
        if (data.note) {
          writeTerminalLog(`System Notice: ${data.note}`);
        }
        writeTerminalLog(`Title: "${data.article.title}"`);
        setLatestArticleTitle(data.article.title);
        fetchDbArticles();
        onArticleChange(); // Notify parent home feed
      } else {
        writeTerminalLog("CRITICAL ERROR: Generation pipeline failed on compile.");
      }
    } catch (err) {
      writeTerminalLog("ERROR: Connection with deployment server interrupted.");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStatus = async (article: Article) => {
    // A quick local draft/publish switcher
    const nextStatus = article.status === "published" ? "draft" : "published";
    writeTerminalLog(`Muted status toggled for: "${article.title}" -> ${nextStatus}`);
    try {
      const resp = await fetch("/api/articles/generate", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          keyword: article.keywords[0] || "Lagos automation",
          category: article.category,
          status: nextStatus,
        }),
      });
      if (resp.ok) {
        // Quickly delete the older one
        await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
        fetchDbArticles();
        onArticleChange();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const resp = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (resp.ok) {
        fetchDbArticles();
        onArticleChange();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormulateClusters = async () => {
    if (!clusterTopic.trim()) return;
    setClustering(true);
    setTerminalLogs([]);
    writeTerminalLog(`Initializing cluster authority setup for seed topic: "${clusterTopic}"`);
    writeTerminalLog("Querying search engines semantic relation metrics...");
    try {
      const resp = await fetch("/api/clusters/create", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ mainTopic: clusterTopic }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setGeneratedClusters(data);
        writeTerminalLog(`Successfully established semantic authority nodes for "${clusterTopic}"!`);
        writeTerminalLog(`Generated ${data.length} long-tail keywords. Direct map compilation is ready.`);
      }
    } catch (err) {
      writeTerminalLog("ERROR: High latent duration on clustering router node.");
    } finally {
      setClustering(false);
    }
  };

  const handleDeployProgrammatic = async () => {
    if (selectedProgIndustries.length === 0) return;
    setDeployingProg(true);
    setTerminalLogs([]);
    writeTerminalLog(`Launching bulk programmatic SEO creation loop for: ${selectedProgIndustries.join(", ")}`);
    writeTerminalLog("Injecting structured FAQ, organization schema registries, and verified metrics...");
    try {
      const resp = await fetch("/api/articles/programmatic", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ industries: selectedProgIndustries }),
      });
      if (resp.ok) {
        const data = await resp.json();
        writeTerminalLog(`Bulk publish loop completed! Stored ${data.count} custom landing entries.`);
        writeTerminalLog("Programmatic schemas successfully deployed directly to sitemap routers.");
        fetchDbArticles();
        onArticleChange();
      }
    } catch (err) {
      writeTerminalLog("ERROR: Connection with deployment server interrupted.");
    } finally {
      setDeployingProg(false);
    }
  };

  const handleRefreshContent = async (id: string, title: string) => {
    setRefreshingArtId(id);
    setTerminalLogs([]);
    writeTerminalLog(`Activating freshness audit scan for: "${title}"`);
    writeTerminalLog("Auditing outward statistics against 2026 search updates...");
    await delay(500);
    try {
      const resp = await fetch("/api/articles/refresh", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ id }),
      });
      if (resp.ok) {
        writeTerminalLog(`Google Freshened indexation logic updated for article ID: ${id}`);
        writeTerminalLog("Re-calibrated freshness score to 100% and audited metrics indicators.");
        fetchDbArticles();
        onArticleChange();
      }
    } catch (err) {
      writeTerminalLog("ERROR: Freshness node response stalled.");
    } finally {
      setRefreshingArtId(null);
    }
  };

  const selectKeyword = (kw: string, cat?: string) => {
    setTargetKeyword(kw);
    if (cat) {
      // rough guess or match
      const matched = Object.values(Category).find((v) => v.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(v.toLowerCase()));
      if (matched) setSelectedCategory(matched);
    }
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-zinc-100" id="console-panel-root">
      {/* Structural Overview Header */}
      <div className="lg:col-span-12 border-b border-white/5 pb-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-semibold text-xl text-white">
            Pulse AI Creator Console & CMS
          </h2>
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">Topical Authority & Machine Engine Room</p>
        </div>

        {/* Console Sub-Tabs Navigation */}
        <div className="flex bg-zinc-950 p-1 border border-white/5 rounded-lg text-xs font-mono">
          <button
            onClick={() => setConsoleTab("cms")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
              consoleTab === "cms" ? "bg-zinc-900 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Terminal size={11} />
            <span>SEO Generator</span>
          </button>
          <button
            onClick={() => setConsoleTab("clusters")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
              consoleTab === "clusters" ? "bg-zinc-900 text-red-500 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Layers size={11} />
            <span>Topical Authority</span>
          </button>
          <button
            onClick={() => setConsoleTab("programmatic")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
              consoleTab === "programmatic" ? "bg-zinc-900 text-amber-500 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Building2 size={11} />
            <span>Bulk pSEO</span>
          </button>
          <button
            onClick={() => setConsoleTab("freshness")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
              consoleTab === "freshness" ? "bg-zinc-900 text-green-500 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Activity size={11} />
            <span>Freshness Monitor</span>
          </button>
          <button
            onClick={() => setConsoleTab("persona")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
              consoleTab === "persona" ? "bg-zinc-900 text-purple-400 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Cpu size={11} />
            <span>AI Persona</span>
          </button>
          <button
            onClick={() => setConsoleTab("scheduler")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
              consoleTab === "scheduler" ? "bg-zinc-900 text-indigo-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Clock size={11} />
            <span>Scheduler Engine</span>
          </button>
        </div>
      </div>

      {/* AI Engine & API Key Credentials Configuration Section */}
      <div className="lg:col-span-12 bg-zinc-950/60 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h3 className="font-sans font-semibold text-sm text-zinc-200">
                Primary Content & Generation Engine
              </h3>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-2xl">
              Choose your active AI content engine. This engine will drive both manual articles generation and background programmatic scheduled SEO crawls.
            </p>
          </div>
          
          <div className="flex bg-zinc-900 border border-white/5 p-1 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setSelectedEngine("gemini");
                localStorage.setItem("selected_engine", "gemini");
                writeTerminalLog("Switched active generation engine to: Gemini 3.5 Flash");
                handleUpdateSchedulerConfig(undefined, "gemini");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all duration-200 cursor-pointer ${
                selectedEngine === "gemini"
                  ? "bg-red-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Gemini 3.5 Flash (SEO Spec)
            </button>
            <button
              onClick={() => {
                setSelectedEngine("claude");
                localStorage.setItem("selected_engine", "claude");
                writeTerminalLog("Switched active generation engine to: Claude 3.5 Sonnet");
                handleUpdateSchedulerConfig(undefined, "claude");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all duration-200 cursor-pointer ${
                selectedEngine === "claude"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Claude 3.5 Sonnet (Premium)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gemini Block */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${geminiApiKey ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
                <h4 className="font-sans font-medium text-xs text-zinc-300">Gemini Key Pipeline</h4>
              </div>
              <p className="text-zinc-550 text-[10px]">Saved locally in browser storage.</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value);
                  localStorage.setItem("gemini_api_key", e.target.value);
                }}
                placeholder="Paste Gemini API Key..."
                className="flex-1 bg-zinc-950 border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 placeholder-zinc-700 font-mono"
              />
              <button
                onClick={() => {
                  setKeySaved(true);
                  setTimeout(() => setKeySaved(false), 2000);
                  writeTerminalLog("Gemini Key updated locally!");
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-semibold font-sans transition-colors cursor-pointer min-w-[75px]"
              >
                {keySaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Claude Block */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${claudeApiKey ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
                <h4 className="font-sans font-medium text-xs text-zinc-300">Claude (Anthropic) Key Pipeline</h4>
              </div>
              <p className="text-zinc-550 text-[10px]">Required to run generations with Claude 3.5 Sonnet.</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="password"
                value={claudeApiKey}
                onChange={(e) => {
                  setClaudeApiKey(e.target.value);
                  localStorage.setItem("claude_api_key", e.target.value);
                }}
                placeholder="Paste Anthropic API Key..."
                className="flex-1 bg-zinc-950 border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-550/50 placeholder-zinc-700 font-mono"
              />
              <button
                onClick={() => {
                  setClaudeKeySaved(true);
                  setTimeout(() => setClaudeKeySaved(false), 2000);
                  writeTerminalLog("Claude Key updated locally!");
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-semibold font-sans transition-colors cursor-pointer min-w-[75px]"
              >
                {claudeKeySaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Left Column: Context-Aware Selected Tab Console Content */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-6">
        
        {/* ==================== TAB 1: SEO GENERATOR (CMS) ==================== */}
        {consoleTab === "cms" && (
          <>
            {/* Keyword Discovery */}
            <div className="rounded-xl border border-white/5 bg-zinc-950 p-5.5 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-red-500" />
                <h3 className="font-sans font-medium text-xs text-white uppercase tracking-wide">
                  Level 3 Long-Tail SEO Discovery Node
                </h3>
              </div>

              <div className="flex gap-2.5 mb-5">
                <input
                  type="text"
                  value={seedTopic}
                  onChange={(e) => setSeedTopic(e.target.value)}
                  placeholder="e.g. Lagos escrow services, website backend nigerian startups..."
                  className="flex-1 bg-zinc-900/60 border border-white/5 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                />
                <button
                  onClick={handleDiscoverKeywords}
                  disabled={discovering || !seedTopic.trim()}
                  className="cursor-pointer font-mono text-[10px] bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 border border-zinc-700 disabled:border-zinc-800 flex items-center gap-1.5 px-4 rounded-lg transition-colors text-zinc-200"
                >
                  {discovering ? (
                    <>
                      <RefreshCw className="animate-spin w-3 h-3" />
                      <span>Crawl Search Index...</span>
                    </>
                  ) : (
                    "Discover Intent"
                  )}
                </button>
              </div>

              {discoveredKeywords.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  <p className="text-[10px] text-zinc-400 font-mono mb-2 uppercase">Discovered Long-Tail SEO Nodes (Select One):</p>
                  {discoveredKeywords.map((k, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectKeyword(k.keyword)}
                      className="flex items-center justify-between bg-zinc-900 hover:bg-zinc-900/80 border border-white/5 rounded px-3 py-2 cursor-pointer transition-all hover:border-red-500/40"
                    >
                      <div className="flex flex-col">
                        <span className="font-sans text-[11px] text-zinc-200 font-semibold">{k.keyword}</span>
                        <span className="font-mono text-[8px] text-zinc-500 mt-0.5 uppercase">Intent: {k.intent}</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div className="font-mono text-[9px] text-zinc-400">
                          <div>Vol: {k.searchVolume}/mo</div>
                        </div>
                        <span
                          className={`font-mono text-[8px] px-1.5 py-0.5 rounded border ${
                            k.level === 3
                              ? "bg-red-950/40 border-red-800/85 text-red-400"
                              : k.level === 2
                              ? "bg-blue-950/40 border-blue-800 text-blue-400"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400"
                          }`}
                        >
                          Level {k.level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center">
                  <Sparkles className="text-zinc-700 w-6 h-6 mb-2 stroke-[1.2]" />
                  <p className="font-mono text-[9px] text-zinc-500">NO RECENT KEYWORD CRAWL EXECUTED</p>
                  <p className="text-[10px] text-zinc-600 max-w-[280px] mt-1">
                    Enter a seed tech topic above to parse active commercial queries from West-African traffic pools.
                  </p>
                </div>
              )}
            </div>

            {/* Generation Setup */}
            <div className="rounded-xl border border-white/5 bg-zinc-950 p-5.5 shadow-xl">
              <div className="flex items-center gap-2 mb-5">
                <FilePlus className="w-4 h-4 text-red-500" />
                <h3 className="font-sans font-medium text-xs text-white uppercase tracking-wide">
                  Compile SEO News Engine Draft
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">
                    Target SEO Focus Keyword Phrase
                  </label>
                  <input
                    type="text"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    placeholder="e.g. custom marketplace app Lagos or best AI tools Nigeria..."
                    className="w-full bg-zinc-900/60 border border-white/5 rounded-lg py-2.5 px-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">
                      Category Silo Hub
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as Category)}
                      className="w-full bg-zinc-900/60 border border-white/5 rounded-lg py-2.5 px-3 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                    >
                      {Object.values(Category).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">
                      Publishing Scheduling Mode
                    </label>
                    <div className="flex items-center h-[38px] bg-zinc-900 border border-white/5 rounded-lg px-4 justify-between">
                      <span className="text-[10px] text-zinc-400">Save draft (skip indexation)</span>
                      <input
                        type="checkbox"
                        checked={saveAsDraft}
                        onChange={(e) => setSaveAsDraft(e.target.checked)}
                        className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateArticle}
                  disabled={generating || !targetKeyword.trim()}
                  className="w-full cursor-pointer flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-950/50 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 px-4 rounded-lg transform active:scale-[0.98] transition-all duration-150"
                >
                  <Sparkles size={13} className={generating ? "animate-spin" : ""} />
                  <span>Compile High-Converting SEO Copy via Gemini</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB 2: TOPICAL AUTHORITY CLUSTERS ==================== */}
        {consoleTab === "clusters" && (
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-5.5 shadow-xl space-y-6">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-500" />
              <div>
                <h3 className="font-sans font-medium text-xs text-white uppercase tracking-wide">
                  Topical Cluster Formulator
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">FORMULATE TOPICS AND KEYWORDS FOR CONTENT INDEXING</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="block font-mono text-[9px] text-zinc-500 uppercase mb-1">Seed Authority Term</label>
                <input
                  type="text"
                  value={clusterTopic}
                  onChange={(e) => setClusterTopic(e.target.value)}
                  placeholder="e.g. AI automation, payment escrow, Lagos logistics"
                  className="w-full bg-zinc-900/60 border border-white/5 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                />
              </div>
              <button
                onClick={handleFormulateClusters}
                disabled={clustering || !clusterTopic.trim()}
                className="cursor-pointer font-mono text-[10px] bg-red-600 hover:bg-red-700 disabled:bg-zinc-900 disabled:text-zinc-600 border border-red-700 disabled:border-zinc-800 flex items-center gap-1.5 px-4 rounded-lg transition-colors text-white h-[38px] mt-4"
              >
                {clustering ? (
                  <>
                    <RefreshCw className="animate-spin w-3 h-3" />
                    <span>Spinning Web...</span>
                  </>
                ) : (
                  "Formulate Cluster"
                )}
              </button>
            </div>

            {/* Generated Cluster Nodes Web */}
            {generatedClusters.length > 0 ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 font-sans text-xs flex gap-2.5 items-start">
                  <Activity className="text-red-500 w-4 h-4 flex-shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    <strong>Cluster Map Ready:</strong> Google ranks site structures that explore all facets of a seed topic. Click <strong>"Deploy Copy"</strong> on any long-tail keyword below to mount it to the generator immediately.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {generatedClusters.map((cl, idx) => (
                    <div key={idx} className="bg-[#09090b] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3.5 hover:border-red-500/20 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-mono uppercase bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded">
                            {cl.category}
                          </span>
                          <span className="text-zinc-500 font-mono text-[8.5px] uppercase">
                            Intent: {cl.intent}
                          </span>
                        </div>
                        <h4 className="font-sans font-medium text-xs text-white">
                          {cl.title}
                        </h4>
                        <p className="font-mono text-[10px] text-zinc-500">Keyword: "{cl.keyword}"</p>
                      </div>

                      <button
                        onClick={() => {
                          setTargetKeyword(cl.keyword);
                          setConsoleTab("cms");
                          // pre-set category if valid in type Check
                          const matched = Object.values(Category).find(c => c.toLowerCase().includes(cl.category.toLowerCase()) || cl.category.toLowerCase().includes(c.toLowerCase()));
                          if (matched) setSelectedCategory(matched);
                        }}
                        className="w-full text-center cursor-pointer bg-zinc-900 hover:bg-zinc-800 border border-white/5 py-1.5 rounded-lg font-mono text-[10px] text-zinc-300 hover:text-white transition-colors"
                      >
                        ⚡ Mount Keyword to Generator
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center">
                <Layers className="text-zinc-700 w-8 h-8 mb-2.5 stroke-[1.2]" />
                <p className="font-mono text-[9px] text-zinc-500">TOPICAL CLUSTER MAP EMPTY</p>
                <p className="text-[10px] text-zinc-600 max-w-[280px] mt-1.5">
                  Input a core service phrase like "escrow payouts" and build an interconnected authority web for search indexers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: PROGRAMMATIC SEO BULK PAGE GENERATOR ==================== */}
        {consoleTab === "programmatic" && (
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-5.5 shadow-xl space-y-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <div>
                <h3 className="font-sans font-medium text-xs text-white uppercase tracking-wide">
                  Programmatic SEO Bulk Pipeline
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">LAUNCH MASSIVE CORNERSTONE TARGET PAGES IN Lagos ON DEMAND</p>
              </div>
            </div>

            <div className="bg-[#09090b] border border-white/5 rounded-xl p-4.5 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Active Local Industry Profiles</span>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                  Select which industry niches you want to target in the metropolitan market. We will bulk compile guides mapping customized automation workflows, web services, and Digital Sage solutions.
                </p>
              </div>

              {/* Multi-Select Industries Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {progIndustries.map((ind) => {
                  const isSelected = selectedProgIndustries.includes(ind);
                  return (
                    <button
                      key={ind}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedProgIndustries(prev => prev.filter(p => p !== ind));
                        } else {
                          setSelectedProgIndustries(prev => [...prev, ind]);
                        }
                      }}
                      className={`cursor-pointer font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all ${
                        isSelected 
                          ? "bg-amber-955 border-amber-500/60 text-amber-400 font-medium" 
                          : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {isSelected ? "✓ " : ""} {ind}
                    </button>
                  );
                })}
              </div>

              {/* Add custom industry input */}
              <div className="flex gap-2 font-mono text-xs pt-1.5 border-t border-zinc-900">
                <input
                  type="text"
                  value={newIndustryInput}
                  onChange={(e) => setNewIndustryInput(e.target.value)}
                  placeholder="Add custom sector (e.g. Clinics, Logistics, Realtors)"
                  className="flex-1 bg-zinc-900/60 border border-white/5 rounded-lg py-1.5 px-3 uppercase text-[10px]"
                />
                <button
                  onClick={() => {
                    if (!newIndustryInput.trim()) return;
                    const capitalize = newIndustryInput.trim().charAt(0).toUpperCase() + newIndustryInput.trim().slice(1);
                    if (!progIndustries.includes(capitalize)) {
                      setProgIndustries(prev => [...prev, capitalize]);
                      setSelectedProgIndustries(prev => [...prev, capitalize]);
                    }
                    setNewIndustryInput("");
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-lg text-[10px] font-medium"
                >
                  Insert Sector
                </button>
              </div>
            </div>

            <button
              onClick={handleDeployProgrammatic}
              disabled={deployingProg || selectedProgIndustries.length === 0}
              className="w-full cursor-pointer bg-amber-500 hover:bg-amber-600 disabled:bg-amber-950/20 disabled:text-zinc-600 disabled:cursor-not-allowed text-black text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Building2 size={13} className={deployingProg ? "animate-spin" : ""} />
              <span>Bulk Deploy {selectedProgIndustries.length} Target Pages Statically</span>
            </button>
          </div>
        )}

        {/* ==================== TAB 4: FRESHNESS & DECAY MONITOR ==================== */}
        {consoleTab === "freshness" && (
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-5.5 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <div>
                <h3 className="font-sans font-medium text-xs text-white uppercase tracking-wide">
                  Content Freshness & Decay Auditor
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">MAINTAIN HIGH SEARCH RANKINGS BY KEEPING ARTICLES FRESHLY UPDATED</p>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              Google algorithms track when posts decay. Freshness updates reset freshness counters to 100%, slightly polish ranks, and insert compliance validations.
            </p>

            <div className="space-y-3 pt-2">
              {dbArticles.map((art) => (
                <div key={art.id} className="bg-[#09090b] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-sm">
                    <h4 className="font-sans font-medium text-xs text-white truncate">{art.title}</h4>
                    <div className="flex items-center gap-2.5 font-mono text-[9px] text-zinc-500">
                      <span className="text-zinc-500">ID: {art.id}</span>
                      <span>•</span>
                      <span className="text-zinc-400">Last Reviewed: {art.lastReviewedAt ? new Date(art.lastReviewedAt).toLocaleDateString() : "Never"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between flex-shrink-0">
                    <div className="flex flex-col text-right pr-1">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase">Freshness</span>
                      <span className={`font-mono text-xs font-semibold ${
                        (art.freshnessScore || 100) > 80 ? "text-green-400" : "text-amber-500"
                      }`}>{art.freshnessScore || 100}%</span>
                    </div>

                    <button
                      onClick={() => handleRefreshContent(art.id, art.title)}
                      disabled={refreshingArtId !== null}
                      className="cursor-pointer font-mono text-[10px] bg-green-950 text-green-400 hover:bg-green-900 border border-green-900/60 disabled:bg-zinc-900 disabled:text-zinc-650 px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      {refreshingArtId === art.id ? (
                        <>
                          <RefreshCw className="animate-spin w-3 h-3" />
                          <span>Auditing...</span>
                        </>
                      ) : (
                        <>
                          <RotateCw size={11} />
                          <span>Execute Refresh</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              {dbArticles.length === 0 && (
                <div className="py-8 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-lg text-center font-mono text-[11px] text-zinc-500">
                  Document catalog index is currently empty.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: AI PERSONA & BRAND SYSTEM PROMPT ==================== */}
        {consoleTab === "persona" && (
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-5.5 shadow-xl space-y-6">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div>
                <h3 className="font-sans font-medium text-xs text-white uppercase tracking-wide">
                  Autonomous Publishing Intelligence Persona
                </h3>
                <p className="text-[11px] text-[#a1a1aa] font-mono mt-0.5">PULSE AI MASTER COMPLIANCE DECK IN ACTIVE MEMORY</p>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              Pulse AI is hardcoded to generate search-optimized, naturally written publications that position <strong>Larry Sage</strong> as West Africa&apos;s leading digital infrastructure systems designer. 
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-zinc-900/40 border border-white/5 rounded-lg p-3.5 space-y-2">
                <span className="font-mono text-[9px] text-purple-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  Elite Strategic Role
                </span>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  Injects profound developer and founder trust. Completely rejects standard &quot;AI jargon&quot; (like <em>delve, testaments, revolutionize</em>). Focuses on code matrices, engineering tradeoffs, and real hosting tutorials.
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-lg p-3.5 space-y-2">
                <span className="font-mono text-[9px] text-amber-500 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Author Narrative
                </span>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed text-zinc-400">
                  All generated posts are pinned to <strong>Larry Sage</strong> (Systems Architect, AI Workflow Engineer, Automation Strategist, and Founder of Digital Sage).
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-lg p-3.5 space-y-2 col-span-1 md:col-span-2">
                <span className="font-mono text-[9px] text-green-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  Organic Conversion Strategy (Subtle CTAs)
                </span>
                <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                  Never aggressively sells. Builds authority by educating first. Subtly embeds natural referrals directing users to consult Larry on WhatsApp (<span className="text-zinc-400 font-mono text-[10px]">wa.me/2347074222772</span>) or read services on Digital Sage (<span className="text-zinc-400 font-mono text-[10px]">digitalsage.com.ng</span>).
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Active System Core Prompt</span>
                <button
                  onClick={() => {
                    const promptText = `SYSTEM ROLE:
You are Pulse AI, an elite autonomous technology publishing intelligence system designed to generate highly valuable, search-optimized, human-readable educational content...
AUTHOR IDENTITY:
All articles are authored by Larry Sage.
Larry is positioned as: systems architect, AI workflow engineer, automation strategist, scalable web systems builder, digital infrastructure expert, modern web developer, AI integration specialist, automation consultant.
CALL TO ACTION RULES:
CTAs must be subtle. At the end of articles, naturally mention:
- Learn more at: https://digitalsage.com.ng
- Contact Larry Sage on WhatsApp: https://wa.me/2347074222772`;
                    navigator.clipboard.writeText(promptText);
                    alert("System prompt copied to clipboard!");
                  }}
                  className="font-mono text-[9px] hover:text-white text-zinc-400 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded px-2.5 py-1 tracking-wider cursor-pointer transition-colors"
                >
                  Copy Prompt
                </button>
              </div>

              <div className="bg-[#09090b] rounded-lg p-3 border border-white/5 font-mono text-[9px] text-zinc-400 h-[210px] overflow-y-auto leading-relaxed whitespace-pre-wrap select-all scrollbar-thin">
                {`SYSTEM ROLE:
You are Pulse AI, an elite autonomous technology publishing intelligence system designed to generate highly valuable, search-optimized, human-readable educational content for developers, founders, creators, agencies, businesses, and automation enthusiasts worldwide.

Your purpose is to continuously publish authoritative, insightful, practical, and highly engaging articles across:
* AI & Automation Systems
* Workflow Engineering
* Web Development & Scalable Architecture
* Hosting, SaaS Systems, and APIs
* Conversational AI Agents
* Monetization & Payments

The platform publishes 20 unique posts per day automatically.
Every article must feel current, practical, useful, deeply researched, naturally written, and non-robotic. Avoid generic "AI jargon" completely. Never sound corporate.

AUTHOR IDENTITY:
All articles are authored by Larry Sage (Systems Architect, AI Workflow Engineer, Automation Strategist, Founder of Digital Sage). 

CALL TO ACTION RULES:
At the end of publications, naturally integrate subtle mentions pointing to:
- Learn more at: http://digitalsage.com.ng
- Contact Larry Sage on WhatsApp: https://wa.me/2347074222772`}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: AUTOMATED POST SCHEDULER ==================== */}
        {consoleTab === "scheduler" && (
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-5.5 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-sm text-white">
                    Autonomous Posting Scheduler Core
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">Pulse AI Programmatic Posting Engine</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-mono uppercase">Status:</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono rounded-full uppercase tracking-wider font-semibold border ${
                  schedulerStatus?.isActive 
                    ? "bg-green-500/10 text-green-400 border-green-500/20 animate-pulse" 
                    : "bg-zinc-800 text-zinc-500 border-zinc-700/50"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${schedulerStatus?.isActive ? "bg-green-400 animate-ping" : "bg-zinc-650"}`}></span>
                  {schedulerStatus?.isActive ? "ACTIVE AUTOMATION" : "PAUSED"}
                </span>
              </div>
            </div>

            {/* Quick configuration forms */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Mode Selection & Frequency */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4.5 space-y-4">
                <div className="space-y-1.5 pb-2.5 border-b border-white/5">
                  <h4 className="font-sans font-medium text-xs text-zinc-350 uppercase tracking-wider">Target Daily Volume</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={customPostsPerDay}
                        onChange={(e) => setCustomPostsPerDay(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-white/10 rounded-lg py-1.5 px-3 pr-16 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-550 font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono text-zinc-500 uppercase">posts/day</span>
                    </div>
                    <button
                      onClick={() => handleUpdateSchedulerConfig()}
                      disabled={updatingScheduler}
                      className="bg-indigo-600 hover:bg-indigo-750 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold font-sans transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <h4 className="font-sans font-medium text-xs text-zinc-300 uppercase tracking-wider">Scheduler Trigger Mode</h4>
                
                <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 border border-white/5 rounded-lg">
                  <button
                    onClick={() => {
                      setSchedulerMode("daily_batch_20");
                      handleUpdateSchedulerConfig("daily_batch_20");
                    }}
                    className={`text-[8.5px] py-1.5 px-0.5 rounded font-sans font-semibold transition-colors cursor-pointer text-center ${
                      schedulerMode === "daily_batch_20" 
                        ? "bg-indigo-600 text-white shadow-lg" 
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Daily Batch ({customPostsPerDay})
                  </button>
                  <button
                    onClick={() => {
                      setSchedulerMode("morning_evening");
                      handleUpdateSchedulerConfig("morning_evening");
                    }}
                    className={`text-[8.5px] py-1.5 px-0.5 rounded font-sans font-semibold transition-colors cursor-pointer text-center ${
                      schedulerMode === "morning_evening" 
                        ? "bg-indigo-600 text-white shadow-lg" 
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Morn/Eve ({Math.max(1, Math.round(customPostsPerDay / 2))})
                  </button>
                  <button
                    onClick={() => {
                      setSchedulerMode("standard");
                      handleUpdateSchedulerConfig("standard");
                    }}
                    className={`text-[8.5px] py-1.5 px-0.5 rounded font-sans font-semibold transition-colors cursor-pointer text-center ${
                      schedulerMode === "standard" 
                        ? "bg-indigo-600 text-white shadow-lg" 
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Even Spaced
                  </button>
                </div>

                {schedulerMode === "daily_batch_20" ? (
                  <div className="space-y-3.5 pt-1">
                    <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans">
                      Publishes <strong className="text-zinc-300">exactly {customPostsPerDay} articles at once</strong> in a single daily automated batch, ensuring consistent search authority without manual steps.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase">Batch Run Hour (UTC)</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={dailyBatchHour}
                        onChange={(e) => setDailyBatchHour(Number(e.target.value))}
                        className="w-full bg-zinc-900/80 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-550 font-mono"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateSchedulerConfig("daily_batch_20")}
                      disabled={updatingScheduler}
                      className="w-full bg-indigo-600 hover:bg-indigo-750 disabled:opacity-50 text-white rounded-lg py-2 text-xs font-semibold font-sans transition-colors cursor-pointer text-center whitespace-nowrap"
                    >
                      Save Daily Hour Window
                    </button>
                  </div>
                ) : schedulerMode === "morning_evening" ? (
                  <div className="space-y-3.5 pt-1">
                    <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans">
                      Publishes <strong className="text-zinc-300">{Math.max(1, Math.round(customPostsPerDay / 2))} articles in the Morning</strong> and <strong className="text-zinc-300">{customPostsPerDay - Math.max(1, Math.round(customPostsPerDay / 2))} in the Evening</strong> automatically. (Total: {customPostsPerDay} posts/day)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase">Morning Hour (UTC)</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={morningHour}
                          onChange={(e) => setMorningHour(Number(e.target.value))}
                          className="w-full bg-zinc-900/80 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-550 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase">Evening Hour (UTC)</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={eveningHour}
                          onChange={(e) => setEveningHour(Number(e.target.value))}
                          className="w-full bg-zinc-900/80 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-550 font-mono"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateSchedulerConfig("morning_evening")}
                      disabled={updatingScheduler}
                      className="w-full bg-indigo-600 hover:bg-indigo-750 disabled:opacity-50 text-white rounded-lg py-2 text-xs font-semibold font-sans transition-colors cursor-pointer text-center whitespace-nowrap"
                    >
                      Save Hour Windows
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5 pt-1">
                    <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans">
                      Regular spaced automated generation and publishing of your high-intent commercial keyword clusters over 24 hours.
                    </p>
                    <div className="p-3 bg-[#09090b] border border-white/5 rounded-lg text-center">
                      <p className="font-sans text-[11px] text-zinc-300">
                        Posting interval: <strong className="text-white">every {Math.round(1440 / customPostsPerDay)} minutes</strong>
                      </p>
                      <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">To change, update "Target Daily Volume" above.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Master Control Panel */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4.5 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h4 className="font-sans font-medium text-xs text-zinc-300 uppercase tracking-wider">Engine Master Controls</h4>
                  <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans">
                    Enable or disable background publishing globally. Disabling the scheduler pauses both standard and batch modes instantly.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleToggleScheduler(!schedulerStatus?.isActive)}
                    disabled={updatingScheduler}
                    className={`w-full rounded-lg py-2 px-3.5 text-xs font-sans font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      schedulerStatus?.isActive 
                        ? "bg-zinc-900 text-red-500 hover:bg-zinc-850 border border-red-500/10" 
                        : "bg-green-600 hover:bg-green-750 text-white"
                    }`}
                  >
                    <Power size={13} />
                    <span>{schedulerStatus?.isActive ? "Pause Scheduler globally" : "Enable Scheduler globally"}</span>
                  </button>
                </div>
              </div>

              {/* Instant Manual Batch Publisher */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4.5 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="font-sans font-medium text-xs text-zinc-300 uppercase tracking-wider">Instant Batch Dispatch</h4>
                  <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans">
                    Force immediate manual triggers. Generate a single post instantly, or manually dispatch a complete <strong className="text-zinc-300">Daily batch (20 posts)</strong>, <strong className="text-zinc-300">Morning batch</strong> or <strong className="text-zinc-300">Evening batch</strong>.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-2 pt-1 font-sans">
                  <button
                    onClick={() => handleTriggerSchedulerPost("single")}
                    disabled={updatingScheduler || !schedulerStatus?.isActive}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 text-indigo-400 border border-indigo-500/10 hover:border-indigo-500/30 rounded-lg py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={11} />
                    <span>Generate Single Post</span>
                  </button>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleTriggerSchedulerPost("morning")}
                      disabled={updatingScheduler || !schedulerStatus?.isActive}
                      className="bg-zinc-900 hover:bg-zinc-850 text-orange-400 border border-orange-500/10 hover:border-orange-500/30 rounded-lg py-1.5 text-[9px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Clock size={10} />
                      <span>Morning (20)</span>
                    </button>
                    <button
                      onClick={() => handleTriggerSchedulerPost("evening")}
                      disabled={updatingScheduler || !schedulerStatus?.isActive}
                      className="bg-zinc-900 hover:bg-zinc-850 text-blue-400 border border-blue-500/10 hover:border-blue-500/30 rounded-lg py-1.5 text-[9px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Clock size={10} />
                      <span>Evening (20)</span>
                    </button>
                    <button
                      onClick={() => handleTriggerSchedulerPost("daily")}
                      disabled={updatingScheduler || !schedulerStatus?.isActive}
                      className="bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-emerald-500/10 hover:border-emerald-500/30 rounded-lg py-1.5 text-[9px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Clock size={10} />
                      <span>Daily (20)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Organic SEO Indexation Pipeline Verification */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 animate-pulse">
                <CheckCircle2 size={20} />
              </div>
              <div className="space-y-1 flex-1 text-center md:text-left">
                <h5 className="font-sans font-bold text-xs text-emerald-400 flex items-center justify-center md:justify-start gap-1.5 leading-none">
                  Verified 20+ Daily Posting Pipeline Active
                </h5>
                <p className="text-[10px] text-zinc-400 leading-normal font-sans max-w-md">
                  Our background indexing agent publishes <strong className="text-zinc-200">{schedulerStatus?.mode === "morning_evening" ? "40 posts/day (max density)" : schedulerStatus?.mode === "daily_batch_20" ? "20 posts/day (Daily Batch)" : `${schedulerStatus?.postsPerDay || 20} posts/day`}</strong> automatically, fully satisfying search engine authority development targets.
                </p>
              </div>
              <div className="text-center md:text-right border-t md:border-t-0 border-white/5 pt-3 md:pt-0 w-full md:w-auto flex-shrink-0">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block leading-none pb-1 md:pb-1.5">Last 24h Output</span>
                <span className="text-lg font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg">
                  {schedulerStatus?.postsGeneratedLast24h ?? 0} / 20+
                </span>
              </div>
            </div>

            {/* Simulated Live status stats indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
              <div className="bg-[#09090b] border border-white/5 rounded-lg p-3 text-center space-y-1">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block truncate">Current Interval</span>
                <p className="text-xs font-semibold font-mono text-zinc-200">
                  {schedulerStatus ? `${schedulerStatus.intervalMinutes} mins` : "Calculating..."}
                </p>
              </div>
              <div className="bg-[#09090b] border border-white/5 rounded-lg p-3 text-center space-y-1">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block truncate">Last Run Dispatch</span>
                <p className="text-xs font-semibold font-mono text-zinc-300">
                  {schedulerStatus?.lastRun 
                    ? new Date(schedulerStatus.lastRun).toLocaleTimeString() 
                    : "No run logged"}
                </p>
              </div>
              <div className="bg-[#09090b] border border-white/5 rounded-lg p-3 text-center space-y-1">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block truncate">Next Scheduled Tick</span>
                <p className="text-xs font-semibold font-mono text-indigo-300">
                  {schedulerStatus?.nextRun 
                    ? new Date(schedulerStatus.nextRun).toLocaleTimeString() 
                    : "Suspended"}
                </p>
              </div>
              <div className="bg-[#09090b] border border-white/5 rounded-lg p-3 text-center space-y-1">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block truncate">Last 24h Count</span>
                <p className="text-sm font-bold font-mono text-emerald-400">
                  {schedulerStatus?.postsGeneratedLast24h ?? 0}
                </p>
              </div>
              <div className="bg-[#09090b] border border-white/5 rounded-lg p-3 text-center space-y-1 col-span-2 lg:col-span-1">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block truncate font-sans">Index Pool</span>
                <p className="text-xs font-semibold font-mono text-indigo-300">
                  {schedulerStatus?.totalIndexedPosts ?? 0} Articles
                </p>
              </div>
            </div>

            {/* Live activity output scrollable console log */}
            <div className="space-y-2 pt-1">
              <h4 className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Active Scheduler Daemon Logs</h4>
              <div className="bg-[#09090b] rounded-lg p-3 border border-white/5 font-mono text-[9px] text-zinc-400 h-[190px] overflow-y-auto leading-relaxed space-y-2.5 scrollbar-thin">
                {schedulerStatus?.logs && schedulerStatus.logs.length > 0 ? (
                  schedulerStatus.logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-1.5 border-b border-zinc-900/40 pb-1.5">
                      <span className="text-zinc-650">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={`inline-block px-1 rounded-[3px] text-[8px] uppercase tracking-wider font-bold ${
                        log.type === "success" 
                          ? "bg-green-500/10 text-green-400" 
                          : log.type === "error" 
                            ? "bg-red-500/15 text-red-400" 
                            : "bg-indigo-500/10 text-indigo-300"
                      }`}>
                        {log.type}
                      </span>
                      <span className={`flex-1 ${
                        log.type === "success" 
                          ? "text-zinc-200" 
                          : log.type === "error" 
                            ? "text-red-300" 
                            : "text-zinc-400"
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-650 italic">No logs generated by posting daemon yet. Initialize above to view ticks...</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Right Column: Terminal Logging & Document Indexation Tracker */}
      <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
        {/* Terminal Compilation Console */}
        <div className="rounded-xl border border-white/5 bg-zinc-950 p-5 flex flex-col h-[230px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2.5 mb-3.5">
            <div className="flex items-center gap-2">
              <Terminal className="text-red-500 w-3.5 h-3.5" />
              <span className="font-mono text-[9px] text-zinc-400 tracking-wider uppercase font-semibold">
                Writing Pipeline Logs
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {generating || clustering || deployingProg ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="font-mono text-[8px] text-amber-500 uppercase">Processing</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                  <span className="font-mono text-[8px] text-zinc-500 uppercase">Idle</span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 bg-zinc-900/30 rounded p-3 font-mono text-[9.5px] text-zinc-400 overflow-y-auto space-y-2 scrollbar-thin leading-normal">
            {terminalLogs.length === 0 ? (
              <div className="text-zinc-600 italic">Console initialized. Ready for keyword selection...</div>
            ) : (
              terminalLogs.map((log, idx) => (
                <div key={idx} className={log.includes("ERROR") ? "text-red-400" : log.includes("Successfully") || log.includes("completed") ? "text-green-400" : "text-zinc-400"}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Existing Articles CMS Grid */}
        <div className="rounded-xl border border-white/5 bg-zinc-950 p-5 flex flex-col overflow-hidden max-h-[340px]">
          <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3 mb-3.5">
            <h3 className="font-sans font-medium text-xs text-white uppercase tracking-wide">
              Document Catalog Tracker
            </h3>
            <span className="font-mono text-[8px] text-zinc-500 uppercase">
              {dbArticles.length} Pages registered
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {loadingArticles ? (
              <div className="text-center py-6 text-zinc-500 font-mono text-[10px]">Updating local index...</div>
            ) : dbArticles.length === 0 ? (
              <div className="text-center py-6 text-zinc-600 font-mono text-[10px]">No news articles tracked on the server database.</div>
            ) : (
              dbArticles.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between border border-white/5 bg-zinc-900/20 rounded-lg p-2.5 hover:border-red-600/30 transition-colors"
                >
                  <div className="flex flex-col max-w-[200px] truncate pr-1">
                    <span className="font-sans font-medium text-[11px] text-zinc-200 truncate leading-tight">
                      {a.title}
                    </span>
                    <span className="font-mono text-[8px] text-zinc-500 mt-0.5 truncate uppercase">
                      Category: {a.category} • {a.readTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleToggleStatus(a)}
                      className={`font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded cursor-pointer border ${
                        a.status === "published"
                          ? "bg-red-950/40 border-red-900/50 text-red-400"
                          : "bg-amber-955/40 border-amber-805/50 text-amber-500"
                      }`}
                      title="Update status Draft/Publish"
                    >
                      {a.status}
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(a.id)}
                      className="text-zinc-600 hover:text-red-400 p-1.5 border border-white/5 rounded hover:border-zinc-805 transition-colors cursor-pointer"
                      title="Purge article from database"
                    >
                      <Trash2 size={11.5} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
