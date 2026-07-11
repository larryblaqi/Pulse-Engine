import React, { useState, useEffect } from "react";
import { UserLead } from "../types";
import { ShieldCheck, Mail, Building, FileText, Send, Terminal, Phone, User, Cpu, Sparkles, Trash2, CheckCircle, ExternalLink, MapPin, Map, Code } from "lucide-react";

export function LeadPanel({ isAdmin = false }: { isAdmin?: boolean }) {
  const [leads, setLeads] = useState<UserLead[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    requirement: "",
    interest: "AI Agent Pipelines & n8n Workflows" as any,
    customInterest: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const resp = await fetch("/api/leads");
      if (resp.ok) {
        const data = await resp.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.requirement) {
      setMsg({ type: "error", text: "Please enter your Name, Email, and Project Description." });
      return;
    }

    if (formData.interest === "Other" && !formData.customInterest.trim()) {
      setMsg({ type: "error", text: "Please write your custom interest option." });
      return;
    }

    setLoading(true);
    setMsg(null);

    const submissionData = {
      ...formData,
      interest: formData.interest === "Other" ? formData.customInterest : formData.interest,
    };

    try {
      const resp = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (resp.ok) {
        setMsg({
          type: "success",
          text: "System pipeline secure. Your request has been logged and sent directly to hillaryibizugbe@gmail.com!",
        });
        setShowSuccessModal(true);
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          requirement: "",
          interest: "AI Agent Pipelines & n8n Workflows",
          customInterest: "",
        });
        fetchLeads(); // refresh log list
      } else {
        const errData = await resp.json();
        setMsg({ type: "error", text: errData.error || "Submission failed." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Network error submitting project specifications." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const resp = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (resp.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "new" ? "contacted" : currentStatus === "contacted" ? "qualified" : "new";
    try {
      const resp = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (resp.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error("Error patching lead status:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-zinc-800 dark:text-zinc-100 shadow-xs" id="lead-panel-root">
      {/* Editorial System Intro */}
      <div className="lg:col-span-12 border-b border-zinc-200 dark:border-white/5 pb-4 mb-2 animate-fade-in">
        <h2 className="font-sans font-semibold text-xl tracking-tight text-zinc-900 dark:text-white mb-1">
          Inbound Lead Pipeline
        </h2>
      </div>

      {/* Form Area */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-6">
        <div className="rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 p-6 shadow-md dark:shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-zinc-900 dark:text-white">
            <Cpu size={120} />
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <h3 className="font-sans font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
                Architect Your Custom Tech Infrastructure
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                We design marketplace backends, escrow layers, and high-CTR search intent platforms.
              </p>
            </div>
          </div>

          {msg && (
            <div
              className={`p-3.5 rounded-lg mb-6 text-xs flex items-center gap-2.5 border ${
                msg.type === "success"
                  ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900 dark:border-red-900/40 dark:text-red-400"
                  : "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/40 dark:border-red-900/50 dark:text-red-400"
              }`}
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-medium">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={13} className="absolute left-3.5 top-3.5 text-zinc-450 dark:text-zinc-600" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Hillary Ibizugbe"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-medium">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-3.5 text-zinc-450 dark:text-zinc-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-medium">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building size={13} className="absolute left-3.5 top-3.5 text-zinc-450 dark:text-zinc-600" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. Yaba Tech Labs"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-medium">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3.5 top-3.5 text-zinc-450 dark:text-zinc-600" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234 (0) 80..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-medium">
                PRIMARY AUTOMATION SYSTEM INTEREST
              </label>
              <select
                name="interest"
                value={formData.interest}
                onChange={handleInputChange}
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-lg py-2.5 px-3.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans"
              >
                <option value="AI Agent Pipelines & n8n Workflows">AI Agent Pipelines & n8n Workflows</option>
                <option value="Custom SaaS & Web Portal Architecture">Custom SaaS & Web Portal Architecture</option>
                <option value="API Integrations & Custom Webhooks">API Integrations & Custom Webhooks</option>
                <option value="Cloud Deployment & VPS Hosting">Cloud Deployment & VPS Hosting</option>
                <option value="Oil Company Web Platform">Oil Company Web Platform</option>
                <option value="Donation Platform Website">Donation Platform Website</option>
                <option value="Online Banking Scripts & Payment Gateways">Online Banking Scripts & Payment Gateways</option>
                <option value="Modern No-Code Systems Setup">Modern No-Code Systems Setup</option>
                <option value="Startup System Consulting">Digital Transformation Strategy</option>
                <option value="Other">Other (Specify Custom System below)</option>
              </select>
            </div>

            {formData.interest === "Other" && (
              <div className="animate-fade-in space-y-1">
                <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-medium">
                  Write Your Specific System Option <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customInterest"
                  value={formData.customInterest}
                  onChange={handleInputChange}
                  placeholder="e.g. Real-Time Oil Delivery Matrix, Church Donation Tracker, Banking Gateway Script..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-lg py-2.5 px-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans"
                  required
                />
              </div>
            )}

            <div>
              <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-medium">
                Describe Your Specifications & Deliverables <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText size={13} className="absolute left-3.5 top-3 text-zinc-450 dark:text-zinc-600" />
                <textarea
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Need a payment escrow split node, logistics dashboard in Lagos, or scalable AI agent pipeline stored on compact shared hosting..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-lg py-2 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans resize-none leading-relaxed"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-950/50 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 px-4 rounded-lg transform active:scale-[0.98] transition-all duration-150 shadow-xs"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting Proposal...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Submit System Specification</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar: Logs & Google Business Profile Synergy */}
      <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6 animate-fade-in">
        {/* Database/Telemetry Area for Admins */}
        {isAdmin && (
          <div className="rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950 p-5 flex flex-col h-full overflow-hidden max-h-[350px] shadow-md">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="text-red-500 w-4 h-4" />
                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 tracking-wider uppercase font-semibold">
                  Digital Sage Pipeline Logs
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-mono text-[9px] text-zinc-500 uppercase">Live Database DB</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  <Terminal className="text-zinc-400 dark:text-zinc-700 w-8 h-8 mb-2 stroke-[1.2]" />
                  <p className="font-mono text-[10px] text-zinc-500 dark:text-zinc-600 font-semibold uppercase">NO ACTIVE INBOUND LEADS FOUND</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 max-w-[200px] mt-1 leading-relaxed text-center">
                    Submit specifications in the form to watch the server populate logs.
                  </p>
                </div>
              ) : (
                leads.map((l) => (
                  <div
                    key={l.id}
                    className="group relative rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 p-3.5 hover:border-red-600/35 transition-all font-mono"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[11px] text-zinc-800 dark:text-zinc-300 font-semibold truncate max-w-[150px]">
                        {l.name}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(l.id, l.status)}
                          className={`text-[8px] uppercase tracking-wide px-2 py-0.5 rounded cursor-pointer border ${
                            l.status === "new"
                              ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-955/40 dark:border-amber-805/50 dark:text-amber-500"
                              : l.status === "contacted"
                              ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-955/45 dark:border-blue-805/50 dark:text-blue-400"
                              : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900 dark:border-red-900/30 dark:text-red-400"
                          }`}
                          title="Click to toggle pipeline status"
                        >
                          {l.status}
                        </button>
                        <button
                          onClick={(e) => handleDeleteLead(l.id, e)}
                          className="text-zinc-400 dark:text-zinc-650 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                          title="Purge record"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[9px] text-zinc-500 truncate mb-2">{l.email}</p>

                    <div className="bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/5 rounded p-2 text-[10px] text-zinc-600 dark:text-zinc-400 leading-normal line-clamp-2">
                      {l.requirement}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[8px] text-zinc-500 border-t border-zinc-150 dark:border-none pt-1.5 dark:pt-0">
                      <span>{l.interest}</span>
                      <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Local Google Business Profile Synergy Section */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950 p-6 flex flex-col gap-5 shadow-md">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="text-red-500 w-4 h-4 animate-bounce" />
              <span className="font-sans font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                Local Training Academies
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[8px] text-zinc-400 dark:text-zinc-500 uppercase">GBP Routing Active</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
            Our physical coding schools are fully indexed on Google Business Profile with active local intent coordinates. Link targets strengthen local SEO pack routing across Nigeria.
          </p>

          <div className="space-y-4">
            {/* Benin City Academy Hub */}
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 p-4 hover:border-red-600/35 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-sans font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wide">
                    Benin City Academy Hub
                  </span>
                  <p className="font-mono text-[9px] text-red-500 mt-0.5">GPS Coordinates: 6.3350° N, 5.6269° E</p>
                </div>
                <span className="bg-red-50 border border-red-200 text-red-600 text-[8px] px-1.5 py-0.5 rounded font-mono uppercase">
                  Edo State
                </span>
              </div>
              <p className="text-[11px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-sans mb-3">
                12 Akpakpava Road, near Ring Road & Akpakpava Junction, Benin City. Landmark: 5 minutes from Uniben / GRA transit.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=12+Akpakpava+Road+Benin+City+Edo+State+Nigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-[10px] font-sans font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <Map size={11} />
                  <span>View Google Business Profile</span>
                  <ExternalLink size={9} />
                </a>
              </div>
            </div>

            {/* Lagos Academy Hub */}
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 p-4 hover:border-red-600/35 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-sans font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wide">
                    Lagos Yaba Tech Hub
                  </span>
                  <p className="font-mono text-[9px] text-red-500 mt-0.5">GPS Coordinates: 6.5095° N, 3.3711° E</p>
                </div>
                <span className="bg-red-50 border border-red-200 text-red-600 text-[8px] px-1.5 py-0.5 rounded font-mono uppercase">
                  Lagos State
                </span>
              </div>
              <p className="text-[11px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-sans mb-3">
                42 Montgomery Road, Yaba, Lagos. Landmark: Near Yaba Tech & Lekki/Ikeja Computer Village transport links.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=42+Montgomery+Road+Yaba+Lagos+State+Nigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-[10px] font-sans font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <Map size={11} />
                  <span>View Google Business Profile</span>
                  <ExternalLink size={9} />
                </a>
              </div>
            </div>

            {/* LocalBusiness Schema Payload Terminal */}
            <div className="rounded-lg border border-zinc-200 dark:border-white/5 overflow-hidden">
              <div className="bg-zinc-100 dark:bg-zinc-900/80 px-3 py-1.5 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Code className="text-zinc-500 w-3.5 h-3.5" />
                  <span className="font-mono text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase">
                    schema.org JSON-LD Payload
                  </span>
                </div>
                <span className="font-mono text-[8px] text-emerald-500 dark:text-emerald-400 font-bold">Valid Schema</span>
              </div>
              <pre className="p-3 bg-zinc-950 text-emerald-400/90 font-mono text-[9px] leading-relaxed overflow-x-auto select-all max-h-[160px] scrollbar-thin">
{`{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Digital Sage Training Academy Hub",
  "telephone": "+2347074222772",
  "url": "https://pulsenews.zapii.ng",
  "address": [
    {
      "@type": "PostalAddress",
      "streetAddress": "12 Akpakpava Road",
      "addressLocality": "Benin City",
      "addressRegion": "Edo State",
      "addressCountry": "NG"
    },
    {
      "@type": "PostalAddress",
      "streetAddress": "42 Montgomery Road",
      "addressLocality": "Yaba",
      "addressRegion": "Lagos State",
      "addressCountry": "NG"
    }
  ],
  "geo": [
    {
      "@type": "GeoCoordinates",
      "latitude": "6.3350",
      "longitude": "5.6269"
    },
    {
      "@type": "GeoCoordinates",
      "latitude": "6.5095",
      "longitude": "3.3711"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Dopamine-triggering Project Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="project-success-modal">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            {/* Glowing background elements for visual flare */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Glowing Success Badge */}
            <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-9 h-9 text-emerald-500 animate-[scaleIn_0.3s_ease-out]" strokeWidth={2.5} />
            </div>

            {/* Title */}
            <h3 className="font-sans font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight leading-tight uppercase mb-2">
              🚀 Project Request Initiated!
            </h3>

            {/* Subtext */}
            <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed mb-6 font-sans">
              Your project request has been successfully received by our team at <strong className="text-zinc-900 dark:text-white font-mono text-[11px]">hillaryibizugbe@gmail.com</strong>. We have already started preparing your customized package!
            </p>

            {/* Interactive Progress Tracking Steps */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-white/5 rounded-xl p-4 mb-6 text-left space-y-2.5 font-mono text-[10px]">
              <div className="text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold border-b border-zinc-150 dark:border-white/5 pb-1 mb-1 flex justify-between items-center">
                <span>Status Tracker</span>
                <span className="text-emerald-500 animate-pulse">● Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span className="text-zinc-800 dark:text-zinc-300">Project requirements received & verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span className="text-zinc-800 dark:text-zinc-300">Project saved securely to our database</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500 animate-pulse">→</span>
                <span className="text-zinc-650 dark:text-zinc-400">Waiting for our team to contact you</span>
              </div>
            </div>

            {/* Instructive Prompt */}
            <p className="text-[11px] text-zinc-650 dark:text-zinc-400 leading-normal mb-5 font-sans">
              Please hold on for a response via your email, or click below right now to chat with the admin instantly on WhatsApp for a swift response.
            </p>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <a
                href="https://wa.me/2347074222772"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                <span>💬 Message Admin on WhatsApp</span>
                <ExternalLink size={12} />
              </a>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-sans font-medium text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
