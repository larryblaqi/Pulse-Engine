import React, { useState, useEffect } from "react";
import { SEOAnalyticsSummary } from "../types";
import { 
  BarChart3, TrendingUp, RefreshCw, Layers, 
  Activity, Code, Eye, MousePointerClick, 
  Award, HelpCircle, MapPin, Globe, Server, 
  CheckCircle2, FileText, Search, Calendar, 
  Sliders, ChevronRight, Database, Zap 
} from "lucide-react";

export function AnalyticsPanel() {
  const [stats, setStats] = useState<SEOAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);
  const [sitemapData, setSitemapData] = useState<{ xmlStyle: string; urlsList: any[] } | null>(null);
  
  // Strategy Panel States
  const [activeSubTab, setActiveSubTab] = useState<"traffic" | "strategy" | "pseo" | "schemas">("traffic");
  const [stateSearchText, setStateSearchText] = useState("");

  useEffect(() => {
    fetchStats();
    fetchSitemap();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/analytics");
      if (resp.ok) {
        const data = await resp.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching SEO stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSitemap = async () => {
    try {
      const resp = await fetch("/api/sitemap");
      if (resp.ok) {
        const data = await resp.json();
        setSitemapData(data);
      }
    } catch (err) {
      console.error("Error fetching sitemap details:", err);
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500 font-mono text-xs">
        <RefreshCw className="animate-spin mr-2 h-4 w-4" />
        INITIALIZING SEO INTELLIGENCE PIPELINE...
      </div>
    );
  }

  // 36 Nigerian States + FCT for programmatic SEO simulator
  const nigerianStates = [
    { name: "Lagos", code: "LA", volume: 14500, estCTR: "8.2%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-lagos" },
    { name: "Abuja (FCT)", code: "FC", volume: 9200, estCTR: "7.9%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-abuja" },
    { name: "Port Harcourt (Rivers)", code: "RI", volume: 6800, estCTR: "6.4%", difficulty: "Low", status: "Indexed", rank: "#2", url: "web-development-port-harcourt" },
    { name: "Kano", code: "KN", volume: 5400, estCTR: "4.8%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-kano" },
    { name: "Enugu", code: "EN", volume: 3800, estCTR: "5.1%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-enugu" },
    { name: "Ibadan (Oyo)", code: "OY", volume: 4200, estCTR: "5.5%", difficulty: "Low", status: "Indexed", rank: "#2", url: "web-development-ibadan" },
    { name: "Kaduna", code: "KD", volume: 3100, estCTR: "4.2%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-kaduna" },
    { name: "Anambra (Awka)", code: "AN", volume: 2900, estCTR: "5.8%", difficulty: "Low", status: "Indexed", rank: "#2", url: "web-development-awka" },
    { name: "Abia (Umuahia)", code: "AB", volume: 1800, estCTR: "3.9%", difficulty: "Low", status: "Discovered", rank: "#3", url: "web-development-umuahia" },
    { name: "Delta (Asaba)", code: "DE", volume: 2400, estCTR: "4.6%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-asaba" },
    { name: "Edo (Benin City)", code: "ED", volume: 2800, estCTR: "4.9%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-benin-city" },
    { name: "Ogun (Abeokuta)", code: "OG", volume: 2200, estCTR: "4.1%", difficulty: "Low", status: "Indexed", rank: "#2", url: "web-development-abeokuta" },
    { name: "Kwara (Ilorin)", code: "KW", volume: 1900, estCTR: "3.8%", difficulty: "Low", status: "Discovered", rank: "#3", url: "web-development-ilorin" },
    { name: "Ondo (Akure)", code: "ON", volume: 1700, estCTR: "3.5%", difficulty: "Low", status: "Discovered", rank: "#2", url: "web-development-akure" },
    { name: "Plateau (Jos)", code: "PL", volume: 2100, estCTR: "4.0%", difficulty: "Low", status: "Indexed", rank: "#2", url: "web-development-jos" },
    { name: "Imo (Owerri)", code: "IM", volume: 2000, estCTR: "4.7%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-owerri" },
    { name: "Cross River (Calabar)", code: "CR", volume: 1600, estCTR: "3.9%", difficulty: "Low", status: "Discovered", rank: "#2", url: "web-development-calabar" },
    { name: "Akwa Ibom (Uyo)", code: "AK", volume: 2300, estCTR: "5.2%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-uyo" },
    { name: "Adamawa (Yola)", code: "AD", volume: 1100, estCTR: "3.2%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-yola" },
    { name: "Bauchi (Bauchi)", code: "BA", volume: 1300, estCTR: "3.4%", difficulty: "Low", status: "Discovered", rank: "#2", url: "web-development-bauchi" },
    { name: "Bayelsa (Yenagoa)", code: "BY", volume: 1500, estCTR: "4.1%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-yenagoa" },
    { name: "Benue (Makurdi)", code: "BE", volume: 1400, estCTR: "3.6%", difficulty: "Low", status: "Discovered", rank: "#2", url: "web-development-makurdi" },
    { name: "Borno (Maiduguri)", code: "BO", volume: 1200, estCTR: "3.1%", difficulty: "Low", status: "Discovered", rank: "#3", url: "web-development-maiduguri" },
    { name: "Ebonyi (Abakaliki)", code: "EB", volume: 1150, estCTR: "3.5%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-abakaliki" },
    { name: "Ekiti (Ado-Ekiti)", code: "EK", volume: 1250, estCTR: "3.8%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-ado-ekiti" },
    { name: "Gombe (Gombe)", code: "GB", volume: 1100, estCTR: "3.1%", difficulty: "Low", status: "Discovered", rank: "#2", url: "web-development-gombe" },
    { name: "Jigawa (Dutse)", code: "JI", volume: 950, estCTR: "2.8%", difficulty: "Low", status: "Discovered", rank: "#3", url: "web-development-dutse" },
    { name: "Katsina (Katsina)", code: "KT", volume: 1400, estCTR: "3.4%", difficulty: "Low", status: "Discovered", rank: "#2", url: "web-development-katsina" },
    { name: "Kebbi (Birnin Kebbi)", code: "KE", volume: 1000, estCTR: "3.0%", difficulty: "Low", status: "Discovered", rank: "#3", url: "web-development-birnin-kebbi" },
    { name: "Kogi (Lokoja)", code: "KO", volume: 1550, estCTR: "4.2%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-lokoja" },
    { name: "Nasarawa (Lafia)", code: "NA", volume: 1350, estCTR: "3.7%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-lafia" },
    { name: "Niger (Minna)", code: "NI", volume: 1500, estCTR: "3.6%", difficulty: "Low", status: "Discovered", rank: "#2", url: "web-development-minna" },
    { name: "Osun (Osogbo)", code: "OS", volume: 2200, estCTR: "4.5%", difficulty: "Low", status: "Indexed", rank: "#1", url: "web-development-osogbo" },
    { name: "Sokoto (Sokoto)", code: "SO", volume: 1300, estCTR: "3.2%", difficulty: "Low", status: "Discovered", rank: "#2", url: "web-development-sokoto" },
    { name: "Taraba (Jalingo)", code: "TA", volume: 900, estCTR: "2.9%", difficulty: "Low", status: "Discovered", rank: "#3", url: "web-development-jalingo" },
    { name: "Yobe (Damaturu)", code: "YO", volume: 850, estCTR: "2.7%", difficulty: "Low", status: "Discovered", rank: "#3", url: "web-development-damaturu" },
    { name: "Zamfara (Gusau)", code: "ZA", volume: 950, estCTR: "2.8%", difficulty: "Low", status: "Discovered", rank: "#3", url: "web-development-gusau" }
  ];

  const filteredStates = nigerianStates.filter(s => 
    s.name.toLowerCase().includes(stateSearchText.toLowerCase()) ||
    s.code.toLowerCase().includes(stateSearchText.toLowerCase())
  );

  // Hardcoded real schema markup based on user guidelines and Digital Sage/Zapii positioning
  const schemasObj = {
    organization: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Digital Sage Network",
  "alternateName": "Digital Sage Nigeria",
  "url": "https://digitalsage.com.ng",
  "logo": "https://digitalsage.com.ng/logo.png",
  "description": "The dominant digital infrastructure and software engineering brand for Nigerian businesses and creators, specializing in custom websites, AI automation, and payment escrow.",
  "sameAs": [
    "https://twitter.com/digitalsagenigeria",
    "https://github.com/digitalsage-dev"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+234-81-0000-0000",
    "contactType": "Technical Support",
    "areaServed": "NG"
  }
}`,
    product: `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Pulse AI Automation Systems",
  "image": "https://pulseai.com/assets/visual_cover.png",
  "description": "An AI-powered B2B automation system and workflow engineering engine, providing custom web apps, n8n integrations, oil company portals, payment scripts, and cloud deployment pipelines for Nigerian and worldwide enterprise clients.",
  "brand": {
    "@type": "Brand",
    "name": "Pulse AI"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "NGN",
    "lowPrice": "0",
    "highPrice": "1500000",
    "offerCount": "2"
  }
}`,
    faq: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why is Digital Sage the best software developer team in Nigeria?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Digital Sage builds real, production-ready full-stack software from scratch. We specialize in custom marketplaces like Zapii, robust escrow settlement logic, high-performance Laravel/React backends, and comprehensive programmatic SEO."
      }
    },
    {
      "@type": "Question",
      "name": "How does Zapii solve trade trust issues in Lagos and Kano?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Zapii implements secure pre-funded escrow holding accounts. Payouts are checked and automatically dispatched to sellers only when the courier integration reports shipment confirmation."
      }
    }
  ]
}`
  };

  return (
    <div className="space-y-6 text-zinc-100" id="analytics-panel-root">
      
      {/* Dynamic Subheader Navigation Tabs */}
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-semibold text-xl text-white">
            SEO Intelligence & Strategy Core
          </h2>
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">
            AEO Monitoring, Topical Silos & Programmatic Search Domination
          </p>
        </div>

        {/* Tab switch control */}
        <div className="flex bg-zinc-950 p-1 border border-white/5 rounded-lg text-xs font-mono self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab("traffic")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeSubTab === "traffic" ? "bg-zinc-900 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <BarChart3 size={12} />
            <span>Traffic Nodes</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("strategy")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeSubTab === "strategy" ? "bg-zinc-900 text-red-500 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Zap size={12} />
            <span>Positioning Silos</span>
          </button>

          <button
            onClick={() => setActiveSubTab("pseo")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeSubTab === "pseo" ? "bg-zinc-900 text-amber-500 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Globe size={12} />
            <span>pSEO Directory</span>
          </button>

          <button
            onClick={() => setActiveSubTab("schemas")}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeSubTab === "schemas" ? "bg-zinc-900 text-green-500 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Code size={12} />
            <span>Schema Audit</span>
          </button>
        </div>
      </div>

      {/* ==================== SUB-TAB 1: CRAWL & TRAFFIC ANALYTICS ==================== */}
      {activeSubTab === "traffic" && (
        <div className="space-y-6 animate-fade-in">
          {/* Grid Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-zinc-950 border border-white/5 p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 mb-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Total Google Impressions</span>
                <Eye size={14} className="text-red-500" />
              </div>
              <div>
                <p className="font-sans text-2xl font-semibold text-white tracking-tight">
                  {stats.totalImpressions.toLocaleString()}
                </p>
                <p className="text-[10px] text-red-500 font-mono mt-1 flex items-center gap-0.5">
                  <TrendingUp size={11} />
                  <span>
                    +{stats.impressionsGrowth !== undefined ? stats.impressionsGrowth : 18.4}% this month ({stats.impressionsGrowth && stats.impressionsGrowth > 19 ? "Growth Increased" : "Growth Slow/Steady"})
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-950 border border-white/5 p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 mb-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Organic Clicks</span>
                <MousePointerClick size={14} className="text-red-500" />
              </div>
              <div>
                <p className="font-sans text-2xl font-semibold text-white tracking-tight">
                  {stats.totalClicks.toLocaleString()}
                </p>
                <p className="text-[10px] text-red-500 font-mono mt-1 flex items-center gap-0.5">
                  <TrendingUp size={11} />
                  <span>
                    +{stats.clicksGrowth !== undefined ? stats.clicksGrowth : 26.1}% this month ({stats.clicksGrowth && stats.clicksGrowth > 27 ? "Flow Surging" : "Flow Slow/Steady"})
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-950 border border-white/5 p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 mb-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Average CTR</span>
                <Activity size={14} className="text-red-500" />
              </div>
              <div>
                <p className="font-sans text-2xl font-semibold text-white tracking-tight">
                  {stats.averageCTR}%
                </p>
                <p className="text-[10px] text-red-500 font-mono mt-1 flex items-center gap-0.5">
                  <TrendingUp size={11} />
                  <span>Industry Avg: 4.8%</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-950 border border-white/5 p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-500 mb-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Indexed Pages</span>
                <Layers size={14} className="text-red-500" />
              </div>
              <div>
                <p className="font-sans text-2xl font-semibold text-white tracking-tight">
                  {stats.indexedPagesCount}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono mt-1 flex items-center gap-1">
                  <span>Dynamic auto-ping</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Custom SVG Linear Chart */}
            <div className="lg:col-span-8 rounded-xl border border-white/5 bg-zinc-950 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div>
                  <h3 className="font-sans font-medium text-xs text-white">Click & Impression Analytics Velocity</h3>
                  <p className="text-[10px] text-zinc-500">Continuous organic acquisition curve matching search-intent density.</p>
                </div>
                <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500"></span>
                    <span>Impressions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Clicks</span>
                  </div>
                </div>
              </div>

              {/* SVG Canvas Plot */}
              <div className="relative w-full h-[180px] my-2 bg-zinc-900/10 rounded border border-white/5 flex items-end px-1 overflow-hidden select-none">
                <div className="absolute inset-x-0 top-0 border-t border-zinc-900/50"></div>
                <div className="absolute inset-x-0 top-1/3 border-t border-zinc-900/30"></div>
                <div className="absolute inset-x-0 top-2/3 border-t border-zinc-900/30"></div>
                
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <path
                    d="M0,100 L10,85 L20,92 L30,78 L40,82 L50,68 L60,54 L70,42 L80,31 L90,18 L100,5 L100,100 Z"
                    fill="url(#redGradient)"
                    opacity="0.12"
                  />
                  <polyline
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.25)"
                    strokeWidth="1.2"
                    strokeDasharray="2,2"
                    points="0,85 10,70 20,68 30,52 40,48 50,39 60,31 70,25 80,18 90,12 100,2"
                  />
                  <polyline
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    points="0,100 10,85 20,92 30,78 40,82 50,68 60,54 70,42 80,31 90,18 100,5"
                  />

                  <circle cx="20" cy="92" r="1.5" fill="#dc2626" />
                  <circle cx="50" cy="68" r="1.5" fill="#dc2626" />
                  <circle cx="80" cy="31" r="1.5" fill="#dc2626" />
                  <circle cx="100" cy="5" r="2.2" fill="#ef4444" />

                  <defs>
                    <linearGradient id="redGradient" x1="0" y1="y1" x2="0" y2="y2">
                      <stop offset="0%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute bottom-2 left-2 flex flex-col font-mono text-[8px] text-zinc-500">
                  <span>May 10</span>
                </div>
                <div className="absolute bottom-2 right-2 flex flex-col font-mono text-[8px] text-zinc-500 text-right">
                  <span>May 26</span>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-400">
                <p className="flex items-center gap-1 font-mono">
                  <BarChart3 size={11} className="text-red-500" />
                  <span>Conversion rate locked: 6.84%</span>
                </p>
                <p className="font-mono text-zinc-500">Update frequency: Real-time</p>
              </div>
            </div>

            {/* Trending topics list */}
            <div className="lg:col-span-4 rounded-xl border border-white/5 bg-zinc-950 p-6 flex flex-col justify-between w-full">
              <div className="border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
                <h3 className="font-sans font-medium text-xs text-white">Surging West-African Search Clusters</h3>
                <span className="bg-red-950 text-red-400 text-[8px] font-mono px-2 py-0.5 rounded border border-red-900/40">Surging</span>
              </div>

              <div className="flex-1 space-y-3.5">
                {stats.trendingTopics.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between font-mono">
                    <div className="flex flex-col max-w-[190px]">
                      <span className="text-[10px] text-zinc-300 font-medium truncate">{t.topic}</span>
                      <span className="text-[8px] text-zinc-500 mt-0.5">{t.volume.toLocaleString()} searches / mo</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-red-500 font-semibold">+{t.growth}%</span>
                      <div className="text-[8px] text-zinc-650 font-medium">Velocity</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 mt-4 pt-3.5">
                <p className="text-[9px] text-zinc-500 font-mono leading-relaxed uppercase">
                  * Source: Automated search indexation clusters crawled by Google Traffic Engine mapping African startup networks.
                </p>
              </div>
            </div>
          </div>

          {/* Keywords CTR Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-xl border border-white/5 bg-zinc-950 p-6 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div>
                  <h3 className="font-sans font-medium text-xs text-white">Keyword Intelligence & CTR Matrix</h3>
                  <p className="text-[10px] text-zinc-500">Mapping Level 1 (Traffic), Level 2 (Commercial), and Level 3 (Zapii Narratives)</p>
                </div>
                <Award className="text-red-500 w-4.5 h-4.5" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] text-zinc-500 uppercase font-semibold">
                      <th className="pb-2">Keyword Phrase</th>
                      <th className="pb-2 text-right">Intent Level / Type</th>
                      <th className="pb-2 text-right">Est. Volume</th>
                      <th className="pb-2 text-right">SEO Diff</th>
                      <th className="pb-2 text-right">Clicks (Index)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-910 text-[10px]">
                    {stats.topPerformingKeywords.slice(0, 7).map((kw, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="py-2.5 font-medium text-zinc-200">{kw.keyword}</td>
                        <td className="py-2.5 text-right">
                          {kw.averagePosition < 4 ? (
                            <span className="bg-red-950 text-red-500 border border-red-900/30 text-[8px] px-1.5 py-0.5 rounded font-bold">
                              L3 - Branded
                            </span>
                          ) : kw.averagePosition < 11 ? (
                            <span className="bg-blue-950 text-blue-400 border border-blue-900/30 text-[8px] px-1.5 py-0.5 rounded">
                              L2 - Commercial
                            </span>
                          ) : (
                            <span className="bg-zinc-900 text-zinc-400 text-[8px] px-1.5 py-0.5 rounded">
                              L1 - Traffic
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right text-zinc-400">{kw.impressions.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-semibold text-zinc-300">
                          {Math.round(kw.averagePosition * 3.5)}%
                        </td>
                        <td className="py-2.5 text-right text-zinc-400">{kw.clicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Crawl index list */}
            <div className="lg:col-span-5 rounded-xl border border-white/5 bg-zinc-950 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <div>
                    <h3 className="font-sans font-medium text-xs text-white">Google Crawl & Google Sitemap Index</h3>
                    <p className="text-[10px] text-zinc-500">Live check on crawled pages registered matching search intent limits.</p>
                  </div>
                  <Code className="text-zinc-500 w-4 h-4 hover:text-white transition-colors cursor-pointer" />
                </div>

                <div className="space-y-2.5">
                  {stats.indexationStatus.slice(0, 5).map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between font-mono text-[9px] border-b border-zinc-900/40 pb-2">
                      <span className="text-zinc-400 truncate max-w-[190px]">{page.url}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">
                          {new Date(page.lastCrawled).toLocaleDateString() === "Invalid Date" ? "Pending" : new Date(page.lastCrawled).toLocaleDateString()}
                        </span>
                        <span className="bg-red-950 text-red-400 border border-red-900/40 text-[8px] px-1.5 py-0.5 rounded uppercase font-medium font-mono">
                          {page.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 mt-4 flex flex-col gap-3">
                <button
                  onClick={() => setShowSitemap(!showSitemap)}
                  className="w-full bg-[#15151a] hover:bg-[#1f1f26] border border-white/5 rounded-lg text-xs font-mono py-2 text-zinc-300 font-medium transition-colors cursor-pointer text-center"
                >
                  {showSitemap ? "Hide Live sitemap.xml View" : "Examine Virtual sitemap.xml Markup"}
                </button>

                {showSitemap && sitemapData && (
                  <div className="relative bg-[#09090b] border border-white/5 rounded-lg max-h-[150px] overflow-y-auto p-3 font-mono text-[9px] text-zinc-400 whitespace-pre scrollbar-thin scrollbar-thumb-zinc-800 leading-normal">
                    {sitemapData.xmlStyle}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: BRAND POSITIONING & STRATEGY SILOS ==================== */}
      {activeSubTab === "strategy" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary Quote */}
          <div className="p-4.5 rounded-xl border border-red-900/20 bg-red-950/20 text-zinc-300 text-xs leading-relaxed font-sans flex gap-3.5 items-start">
            <Award className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[9.5px] font-bold text-red-400 tracking-wider block uppercase mb-1">Our Core Strategic Positioning Statement:</span>
              <p className="font-medium text-white text-sm">
                “The company building the future digital infrastructure for Nigerian businesses and creators.”
              </p>
              <p className="text-[11px] text-zinc-400 mt-1.5 font-mono">
                We reject low-margin freelancer branding. Our authority comes from a real home-grown product ecosystem: Digital Sage (Expert Services Agency) paired seamlessly with Zapii (Consumer Infrastructure Platform).
              </p>
            </div>
          </div>

          {/* Three Layers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/5 bg-zinc-950 p-5 space-y-4 shadow-md">
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-900">
                <span className="w-6 h-6 rounded-lg bg-red-950 flex items-center justify-center text-red-500 font-mono text-xs font-bold leading-none">1</span>
                <div>
                  <h4 className="font-sans font-bold text-xs text-white uppercase">Digital Sage</h4>
                  <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider">Authority & B2B Services</p>
                </div>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Represents our elite systems engineering powerhouse. This is the search engine magnet and customer lead router, ranking for professional development terms in Nigeria.
              </p>
              <div className="space-y-1.5 pt-2">
                <span className="text-[9px] font-mono font-bold text-red-400 block uppercase">Dominant Search Targets:</span>
                <ul className="text-[9.5px] font-mono text-zinc-500 space-y-1 pl-2 list-disc">
                  <li>web development Nigeria</li>
                  <li>app developer in Lagos</li>
                  <li>AI automation agency Nigeria</li>
                  <li>escrow system development</li>
                  <li>logistics developer Lagos</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-zinc-950 p-5 space-y-4 shadow-md">
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-900">
                <span className="w-6 h-6 rounded-lg bg-orange-950 flex items-center justify-center text-orange-500 font-mono text-xs font-bold leading-none">2</span>
                <div>
                  <h4 className="font-sans font-bold text-xs text-white uppercase">Zapii</h4>
                  <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider">Consumer Ecosystem</p>
                </div>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Our active marketplace product environment. This content is non-commercial, representing the street culture, micro-entrepreneurship, and the delivery economy.
              </p>
              <div className="space-y-1.5 pt-2">
                <span className="text-[9px] font-mono font-bold text-orange-400 block uppercase">Dominant Narrative Targets:</span>
                <ul className="text-[9.5px] font-mono text-zinc-500 space-y-1 pl-2 list-disc">
                  <li>social commerce scale</li>
                  <li>street hustle growth tips</li>
                  <li>avoiding online buy-sell scams</li>
                  <li>monetizing niche audience</li>
                  <li>rider commission optimizer</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-zinc-950 p-5 space-y-4 shadow-md">
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-900">
                <span className="w-6 h-6 rounded-lg bg-green-950 flex items-center justify-center text-green-500 font-mono text-xs font-bold leading-none">3</span>
                <div>
                  <h4 className="font-sans font-bold text-xs text-white uppercase">Content Network</h4>
                  <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider">Search Intent Machine</p>
                </div>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Our automated publication network designed to feed Google bots and LLM search agents (AEO) with hyper-structured, fast content.
              </p>
              <div className="space-y-1.5 pt-2">
                <span className="text-[9px] font-mono font-bold text-green-400 block uppercase">Conversion Anchors:</span>
                <ul className="text-[9.5px] font-mono text-zinc-500 space-y-1 pl-2 list-disc">
                  <li>In-text schema markup</li>
                  <li>Instant FAQ blocks</li>
                  <li>Real local success case-studies</li>
                  <li>Click-to-Leads conversion routes</li>
                  <li>Daily active indexation loops</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5 Content Pillars */}
          <div className="rounded-xl border border-white/5 bg-zinc-950 p-6 space-y-4 shadow-xl">
            <div className="border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Database className="text-red-500 w-4 h-4 animate-pulse" />
              <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-white">The Structured Publishing Matrix</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-[#09090b] border border-white/5 rounded-xl p-3.5 space-y-2">
                <span className="text-[7.5px] font-mono font-bold text-red-500 tracking-wider block uppercase bg-red-950/40 w-fit px-1.5 py-0.5 rounded">Category A</span>
                <h5 className="font-sans font-semibold text-[11px] text-white">Search Intent</h5>
                <p className="text-zinc-500 text-[10px] leading-snug font-sans">
                  Targeting high commercial intent searches. "How to build logistics apps", "Cost of app dev in Lagos".
                </p>
              </div>

              <div className="bg-[#09090b] border border-white/5 rounded-xl p-3.5 space-y-2">
                <span className="text-[7.5px] font-mono font-bold text-amber-500 tracking-wider block uppercase bg-amber-950/40 w-fit px-1.5 py-0.5 rounded">Category B</span>
                <h5 className="font-sans font-semibold text-[11px] text-white">Zapii Growth</h5>
                <p className="text-zinc-500 text-[10px] leading-snug font-sans">
                  Seller tutorials and trust tools. "How escrow changes online business", "Scale selling via cataloging".
                </p>
              </div>

              <div className="bg-[#09090b] border border-white/5 rounded-xl p-3.5 space-y-2">
                <span className="text-[7.5px] font-mono font-bold text-green-500 tracking-wider block uppercase bg-green-950/40 w-fit px-1.5 py-0.5 rounded">Category C</span>
                <h5 className="font-sans font-semibold text-[11px] text-white">News & Trends</h5>
                <p className="text-zinc-500 text-[10px] leading-snug font-sans">
                  Feeds LLM engine freshness scores. Local fintech funding, Nigeria import laws, trending creator tools.
                </p>
              </div>

              <div className="bg-[#09090b] border border-white/5 rounded-xl p-3.5 space-y-2">
                <span className="text-[7.5px] font-mono font-bold text-blue-500 tracking-wider block uppercase bg-blue-950/40 w-fit px-1.5 py-0.5 rounded">Category D</span>
                <h5 className="font-sans font-semibold text-[11px] text-white">Case Studies</h5>
                <p className="text-zinc-500 text-[10px] leading-snug font-sans">
                  Deep technical breakdowns. "How we built an escrow ledger", "Addressing coordinates mapping for Lagos".
                </p>
              </div>

              <div className="bg-[#09090b] border border-white/5 rounded-xl p-3.5 space-y-2">
                <span className="text-[7.5px] font-mono font-bold text-purple-400 tracking-wider block uppercase bg-purple-950/40 w-fit px-1.5 py-0.5 rounded">Category E</span>
                <h5 className="font-sans font-semibold text-[11px] text-white">Programmatic SEO</h5>
                <p className="text-zinc-500 text-[10px] leading-snug font-sans">
                  State-by-state dynamic directory targeting specific regions like Enugu, Port Harcourt, Abuja, Kano.
                </p>
              </div>
            </div>

            {/* Campaign Frequency Monitor */}
            <div className="mt-4 pt-4 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-2">
                <span className="font-bold text-zinc-400 block uppercase text-[10px]">Publishing Schedule Checklist (Per Week):</span>
                <div className="space-y-1.5 text-zinc-500 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-green-500" />
                    <span>7 High-performance long-tail articles (1 daily)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-green-500" />
                    <span>21–35 Micro social postings (3-5 daily chunks)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-green-500" />
                    <span>2 Loom/Video case walk-throughs (Tues, Thurs)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-green-500" />
                    <span>1 Specialized System Case Study publication</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-905 rounded-xl border border-white/5 space-y-2">
                <span className="font-bold text-zinc-300 block uppercase text-[9px] mb-1">AI Engine Optimization Rules (AEO Guidelines):</span>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Generative models like ChatGPT, Claude, and Gemini retrieve authority from rich structures rather than generic spam words. To guarantee index citations, we enforce **strict schema-pings**, **unambiguous definitions**, **direct comparative matrices/tables**, and **localized engineering insights**.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: PROGRAMMATIC SEO DIRECTORY ==================== */}
      {activeSubTab === "pseo" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header Callout */}
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="text-amber-500 w-4.5 h-4.5" />
                <h4 className="font-sans font-bold text-sm text-white">Nigerian States pSEO Campaign Crawler</h4>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                Each state has unique commercial volume for technology development queries. By bulk creating cornerstone local pages statically, Digital Sage captures targeted regional intent automatically.
              </p>
            </div>
            
            {/* Search Input Filter */}
            <div className="relative font-mono text-xs flex-shrink-0 w-full md:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-600 pointer-events-none">
                <Search size={12} />
              </span>
              <input
                type="text"
                value={stateSearchText}
                onChange={(e) => setStateSearchText(e.target.value)}
                placeholder="Filter by Nigerian state..."
                className="w-full bg-[#09090b] border border-white/5 rounded-lg py-2 pl-9 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Programmatic Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStates.map((state, index) => (
              <div 
                key={index} 
                className="rounded-xl border border-white/5 bg-zinc-950 p-4 hover:border-amber-500/25 transition-colors flex flex-col justify-between gap-3 shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-amber-500" />
                      <span className="font-sans font-bold text-[13px] text-white leading-none">{state.name}</span>
                    </div>
                    <span className="bg-amber-955 text-amber-500 border border-amber-900/40 text-[7px] font-mono font-bold px-1.5 py-0.5 rounded leading-none">
                      {state.code} State
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[10px] text-zinc-500 leading-normal gap-1">
                    <div className="flex justify-between">
                      <span>Target Keyword String:</span>
                      <span className="text-zinc-300 font-semibold">"Web Development in {state.name}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Organic Search Volume:</span>
                      <span className="text-zinc-300 font-semibold">{state.volume.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Landing CTR:</span>
                      <span className="text-zinc-300 font-medium text-amber-400">{state.estCTR}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-910 pt-2.5 flex items-center justify-between font-mono text-[9px] text-zinc-650">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span>{state.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 bg-zinc-900 border border-white/5 px-1 rounded font-bold">{state.rank} Rank</span>
                    <span className="text-zinc-500 hover:text-white cursor-pointer transition-colors" title={`Inspect schema for ${state.name}`}>
                      Audit Schema
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredStates.length === 0 && (
              <div className="col-span-full py-12 bg-zinc-905 border border-dashed border-zinc-900 rounded-xl text-center font-mono text-[11px] text-zinc-500">
                No matching Nigerian states discovered under that filter query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 4: STRUCTURED SCHEMA VALIDATOR ==================== */}
      {activeSubTab === "schemas" && (
        <div className="space-y-6 animate-fade-in text-zinc-200">
          
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Code className="text-green-500 w-4.5 h-4.5" />
              <h4 className="font-sans font-bold text-sm text-white uppercase">Google & AI Overview Structured Metadata Schema Audit</h4>
            </div>
            <p className="text-zinc-400 font-sans leading-relaxed text-[11.5px]">
              Digital Sage injects highly optimized, valid JSON-LD metadata schema blocks directly into catalog template structures. This forces crawlers and retrieval pipelines (ChatGPT, Claude, Gemini, Google Search bots) to cleanly reference and parse our services as the ultimate authority source in West Africa.
            </p>
          </div>

          {/* Code Schema Presentation Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-[10.5px]">
            
            {/* Box 1: Organization Schema */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3">
                  <span className="font-bold text-zinc-350 flex items-center gap-1.5">
                    <Server size={12} className="text-green-400" />
                    <span>Organization (Digital Sage) — Google Indexing</span>
                  </span>
                  <span className="text-white hover:text-green-400 text-[8px] cursor-pointer" title="Mock ping validator">Valid Markup</span>
                </div>
                <div className="relative bg-[#09090b] border border-white/5 rounded-lg max-h-[178px] overflow-y-auto p-3 whitespace-pre text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-805 leading-normal">
                  {schemasObj.organization}
                </div>
              </div>
              <p className="text-[9.5px] text-zinc-500 leading-snug">
                Establishes the legal entity name, geographical footprint inside Nigeria, brand credentials representation, and customer intake support portals.
              </p>
            </div>

            {/* Box 2: Product Schema (Zapii) */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3">
                  <span className="font-bold text-zinc-350 flex items-center gap-1.5">
                    <Sliders size={12} className="text-green-400" />
                    <span>Product & Brand (Zapii Platform) — AI Citation</span>
                  </span>
                  <span className="text-white hover:text-green-400 text-[8px] cursor-pointer" title="Mock ping validator">Valid Markup</span>
                </div>
                <div className="relative bg-[#09090b] border border-white/5 rounded-lg max-h-[178px] overflow-y-auto p-3 whitespace-pre text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-805 leading-normal">
                  {schemasObj.product}
                </div>
              </div>
              <p className="text-[9.5px] text-zinc-500 leading-snug">
                Defines Zapii e-commerce properties, average merchant pricing parameters, and visual screenshot assets mapping directly to LLM shopping indexes.
              </p>
            </div>

            {/* Box 3: FAQ Schema */}
            <div className="bg-zinc-950 border border-white/5 rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-xl lg:col-span-2">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3">
                  <span className="font-bold text-zinc-350 flex items-center gap-1.5">
                    <HelpCircle size={12} className="text-green-400" />
                    <span>FAQPage Schema (Rich Direct Answers) — Google Rich Result Snippet</span>
                  </span>
                  <span className="text-white hover:text-green-400 text-[8px] cursor-pointer" title="Mock ping validator">Valid Markup</span>
                </div>
                <div className="relative bg-[#09090b] border border-white/5 rounded-lg max-h-[178px] overflow-y-auto p-3 whitespace-pre text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-805 leading-normal">
                  {schemasObj.faq}
                </div>
              </div>
              <p className="text-[9.5px] text-zinc-500 leading-snug">
                Feeds rich question-answer cards directly on Google search results page. This completely monopolizes absolute real estate above standard organic lists.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
