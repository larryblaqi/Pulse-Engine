export enum Category {
  WEBSITE_DEVELOPMENT = "Website Development",
  WEB_APPLICATION_DEVELOPMENT = "Web Application Development",
  MOBILE_APP_DEVELOPMENT = "Mobile App Development",
  AI_SYSTEMS_DEVELOPMENT = "AI Systems Development",
  BUSINESS_AUTOMATION = "Business Automation",
  DIGITAL_TRANSFORMATION = "Digital Transformation",
  E_COMMERCE_SOLUTIONS = "E-commerce Solutions",
  SOCIAL_COMMERCE_ZAPII = "Social Commerce (Zapii)",
  TECHNOLOGY_CONSULTING = "Technology Consulting",
  AI_NEWS_INSIGHTS = "AI News & Industry Insights",
  STARTUP_TECH_SOLUTIONS = "Startup Technology Solutions",
  ENTERPRISE_SOFTWARE_DEVELOPMENT = "Enterprise Software Development",
}

export interface SEOKeyword {
  keyword: string;
  level: 1 | 2 | 3; // 1: Broad Traffic, 2: Commercial Intent, 3: Zapii Narrative / Branded
  searchVolume: number;
  difficulty: number; // 0-100%
  intent: "informational" | "commercial" | "transactional" | "navigational";
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown formatted body
  excerpt: string;
  category: Category;
  keywords: string[];
  author: string;
  createdAt: string;
  imageUrl: string;
  views: number;
  clicks: number; // Click count on Larry Sage CTA
  zapiiCTA: { // Retained name for backwards-compatibility with JSON records
    title: string;
    description: string;
    buttonText: string;
    linkUrl: string;
  };
  status: "published" | "draft" | "scheduled";
  publishDate?: string;
  readTime: string; // e.g. "6 min read"
  // Advanced SEO and Growth attributes
  seoRank?: number; // Simulated Google position
  freshnessScore?: number; // 0 to 100% freshness tracking
  lastReviewedAt?: string;
  eeatSignals?: {
    metricsBeforeAfter?: { metric: string; before: string; after: string; impact: string }[];
    workflowSteps?: { step: number; title: string; desc: string; system: string }[];
    miniCaseStudy?: { client: string; challenge: string; solution: string; statLine: string };
  };
  schemaMarkup?: {
    faq?: { q: string; a: string }[];
    breadcrumbs?: string[];
  };
}

export interface UserLead {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  requirement: string;
  interest: "Zapii Integration" | "Custom Software Development" | "Startup System Consulting" | "Other";
  createdAt: string;
  status: "new" | "contacted" | "qualified";
}

export interface SEOAnalyticsSummary {
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  indexedPagesCount: number;
  impressionsGrowth?: number;
  clicksGrowth?: number;
  topPerformingKeywords: {
    keyword: string;
    impressions: number;
    clicks: number;
    ctr: number;
    averagePosition: number;
  }[];
  trendingTopics: {
    topic: string;
    growth: number; // percentage
    volume: number;
    status: "surging" | "stable" | "declining";
  }[];
  indexationStatus: {
    url: string;
    status: "indexed" | "discovered" | "crawled" | "excluded";
    lastCrawled: string;
  }[];
}
