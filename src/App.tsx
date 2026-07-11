import React, { useState } from "react";
import { PulseLogo } from "./components/PulseLogo";
import { ReaderPanel } from "./components/ReaderPanel";
import { ConsolePanel } from "./components/ConsolePanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { LeadPanel } from "./components/LeadPanel";
import { BookOpen, Terminal, Activity, MessageSquare, Cpu, ExternalLink, Sun, Moon, Lock, LogOut, CheckCircle, AlertTriangle, Key } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("user_session");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("user_session");
      if (saved) {
        return JSON.parse(saved).isAdmin === true;
      }
    } catch (e) {
      return false;
    }
    return false;
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [subscribeCheckbox, setSubscribeCheckbox] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  const [activeTab, setActiveTab] = useState<"publications" | "console" | "analytics" | "contact">("publications");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light-theme");
    } else {
      root.classList.add("light-theme");
      root.classList.remove("dark");
    }
  }, [theme]);

  const handleArticlesUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem("user_session");
    setActiveTab("publications");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setAuthSuccessMsg("");

    try {
      if (authMode === "signin") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput, password: passwordInput })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data.user);
          setIsAdmin(!!data.user.isAdmin);
          localStorage.setItem("user_session", JSON.stringify(data.user));
          setAuthSuccessMsg(`Welcome back, ${data.user.name}!`);
          
          setTimeout(() => {
            setShowLoginModal(false);
            setAuthSuccessMsg("");
            if (data.user.isAdmin) {
              setActiveTab("console");
            }
          }, 1200);
        } else {
          setLoginError(data.error || "Login failed. Please verify credentials.");
        }
      } else {
        // signup
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameInput,
            email: emailInput,
            password: passwordInput,
            subscribed: subscribeCheckbox
          })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data.user);
          setIsAdmin(!!data.user.isAdmin);
          localStorage.setItem("user_session", JSON.stringify(data.user));
          setAuthSuccessMsg(`Account created successfully! ${data.user.subscribed ? "Subscribed to updates." : ""}`);
          
          setTimeout(() => {
            setShowLoginModal(false);
            setAuthSuccessMsg("");
          }, 1800);
        } else {
          setLoginError(data.error || "Registration failed. Try again.");
        }
      }
    } catch (err) {
      setLoginError("Service connection failed. Please try again.");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-red-500/30 selection:text-white transition-all duration-200 ${theme === 'light' ? 'light-theme bg-zinc-50 text-zinc-900' : 'dark bg-[#09090b] text-zinc-100'}`} id="pulse-app-root">
      {/* Unified Sticky Header Container */}
      <header className="sticky top-0 z-40 w-full flex flex-col">
        {/* Pulse AI Red Brand Banner */}
        <div className="bg-red-600 text-white h-8 flex items-center px-4 shadow-sm select-none border-b border-red-700/50">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between text-xs font-mono font-bold">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span className="tracking-wider uppercase text-[9px] text-white font-semibold">OFFICIAL PORTAL — PULSE AI SYSTEM NETWORKS</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[9px] tracking-wide text-red-150">
              <span>🔴 ACTIVE: Pulse AI Automation Pipeline</span>
              <span>•</span>
              <span>2026 EDITION</span>
            </div>
          </div>
        </div>

        {/* Top Professional Navigation Masthead */}
        <div className={`backdrop-blur border-b transition-all duration-150 w-full ${theme === 'light' ? 'bg-white/90 border-zinc-200 text-zinc-900 shadow-xs' : 'bg-[#09090b]/90 border-white/5 text-zinc-100'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div onClick={() => setActiveTab("publications")} className="cursor-pointer">
            <PulseLogo theme={theme} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("publications")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-150 cursor-pointer ${
                activeTab === "publications"
                  ? (theme === 'light' ? 'bg-zinc-100 border border-zinc-300 text-zinc-950 font-semibold' : 'bg-zinc-900 border border-white/5 text-white')
                  : (theme === 'light' ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-zinc-200')
              }`}
            >
              <BookOpen size={13} className={activeTab === "publications" ? "text-red-650" : ""} />
              <span>Publications</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab("console")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-150 cursor-pointer ${
                    activeTab === "console"
                      ? (theme === 'light' ? 'bg-zinc-100 border border-zinc-300 text-zinc-950 font-semibold' : 'bg-zinc-900 border border-white/5 text-white')
                      : (theme === 'light' ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-zinc-200')
                  }`}
                >
                  <Terminal size={13} className={activeTab === "console" ? "text-red-650" : ""} />
                  <span>Creator Console</span>
                </button>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-150 cursor-pointer ${
                    activeTab === "analytics"
                      ? (theme === 'light' ? 'bg-zinc-100 border border-zinc-300 text-zinc-950 font-semibold' : 'bg-zinc-900 border border-white/5 text-white')
                      : (theme === 'light' ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-zinc-200')
                  }`}
                >
                  <Activity size={13} className={activeTab === "analytics" ? "text-red-650" : ""} />
                  <span>SEO Intelligence</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab("contact")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-150 cursor-pointer ${
                activeTab === "contact"
                  ? (theme === 'light' ? 'bg-zinc-100 border border-zinc-300 text-zinc-950 font-semibold' : 'bg-zinc-900 border border-white/5 text-white')
                  : (theme === 'light' ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-zinc-200')
              }`}
            >
              <MessageSquare size={13} className={activeTab === "contact" ? "text-red-650" : ""} />
              <span>{isAdmin ? "Lead Pipeline" : "Submit Proposal"}</span>
            </button>
          </nav>

          {/* Outer Status Monitor */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2.5 rounded-lg border transition-all duration-150 cursor-pointer flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700'
                  : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={13} className="text-amber-500" /> : <Moon size={13} className="text-zinc-500" />}
            </button>

            {/* User Session and Registration Controls */}
            {currentUser ? (
              <div className="flex items-center gap-2" id="user-controls">
                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider transition-all duration-150 ${
                  theme === 'light'
                    ? 'bg-zinc-200 border border-zinc-300 text-zinc-800'
                    : 'bg-zinc-900 border border-white/5 text-zinc-200'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>{currentUser.name.slice(0, 12)}{currentUser.name.length > 12 ? "..." : ""}</span>
                  {currentUser.isAdmin && <span className="text-red-500 font-bold ml-1 text-[9px]">[Admin]</span>}
                </span>
                
                <button
                  onClick={handleLogout}
                  className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                      : 'bg-red-950/40 hover:bg-red-900/60 border-red-900/40 text-red-400'
                  }`}
                  title="Sign Out"
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2" id="user-auth-gate">
                <button
                  onClick={() => {
                    setLoginError("");
                    setEmailInput("");
                    setPasswordInput("");
                    setAuthMode("signin");
                    setAuthSuccessMsg("");
                    setShowLoginModal(true);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-zinc-200 hover:bg-zinc-300 border border-zinc-300 text-zinc-700'
                      : 'bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400'
                  }`}
                  title="Sign into your custom profile"
                >
                  <Lock size={10} className="text-zinc-500" />
                  <span>Sign In</span>
                </button>
                
                <button
                  onClick={() => {
                    setLoginError("");
                    setNameInput("");
                    setEmailInput("");
                    setPasswordInput("");
                    setSubscribeCheckbox(true);
                    setAuthMode("signup");
                    setAuthSuccessMsg("");
                    setShowLoginModal(true);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-red-600 hover:bg-red-700 border border-red-700 text-white shadow-xs'
                      : 'bg-red-600 hover:bg-red-700 border border-red-700/50 text-white'
                  }`}
                  title="Create an account & subscribe"
                >
                  <span>Join Hub</span>
                </button>
              </div>
            )}

            <a
              href="https://wa.me/2347074222772"
              target="_blank"
              rel="noreferrer"
              className={`hidden lg:flex items-center gap-1.5 text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-md'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              <span>Consult Larry Sage</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Tab Control Overlay */}
      <div className={`md:hidden sticky top-[96px] z-30 flex h-11 items-center px-4 gap-1.5 text-xs overflow-x-auto scrollbar-none font-mono border-b transition-colors ${
        theme === 'light'
          ? 'bg-white border-zinc-200 text-zinc-700'
          : 'bg-zinc-950 border-zinc-900/60 text-zinc-200'
      }`}>
        <button
          onClick={() => setActiveTab("publications")}
          className={`flex-shrink-0 px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === "publications"
              ? (theme === 'light' ? 'text-zinc-950 bg-zinc-200 font-bold' : 'text-white bg-zinc-900')
              : 'text-zinc-500'
          }`}
        >
          Publications
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("console")}
              className={`flex-shrink-0 px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeTab === "console"
                  ? (theme === 'light' ? 'text-zinc-950 bg-zinc-200 font-bold' : 'text-white bg-zinc-900')
                  : 'text-zinc-500'
              }`}
            >
              Console
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-shrink-0 px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? (theme === 'light' ? 'text-zinc-950 bg-zinc-200 font-bold' : 'text-white bg-zinc-900')
                  : 'text-zinc-500'
              }`}
            >
              SEO
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex-shrink-0 px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === "contact"
              ? (theme === 'light' ? 'text-zinc-950 bg-zinc-200 font-bold' : 'text-white bg-zinc-900')
              : 'text-zinc-500'
          }`}
        >
          {isAdmin ? "Leads" : "Inquire"}
        </button>
      </div>

      {/* Main Core View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === "publications" && (
          <ReaderPanel 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            refreshTrigger={refreshTrigger} 
            currentUser={currentUser}
            setShowLoginModal={setShowLoginModal}
            setAuthMode={setAuthMode}
            theme={theme}
          />
        )}
        {activeTab === "console" && isAdmin && <ConsolePanel onArticleChange={handleArticlesUpdated} />}
        {activeTab === "analytics" && isAdmin && <AnalyticsPanel />}
        {activeTab === "contact" && <LeadPanel isAdmin={isAdmin} />}
      </main>

      {/* Dynamic Authorization Portal (Sign In / Sign Up) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in" id="auth-portal-modal">
          <div className="bg-zinc-950 border border-white/5 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginError("");
                setAuthSuccessMsg("");
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 cursor-pointer text-sm"
            >
              ✕
            </button>

            {/* Header section toggle */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="text-red-500 w-5 h-5 animate-pulse" />
                <h3 className="font-sans font-semibold text-white tracking-tight text-base">
                  {authMode === "signin" ? "Sign in to Pulse AI Hub" : "Create Professional Account"}
                </h3>
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed">
                {authMode === "signin" 
                  ? "Sign in to access advanced tools, submit proposals, post comments, and manage publications." 
                  : "Register to request digital sage solutions, post comments, and receive automated email updates."
                }
              </p>
            </div>

            {/* Success and Error Callouts */}
            {authSuccessMsg && (
              <div className="p-3 bg-green-950/40 border border-green-800/40 text-green-400 rounded-lg text-[11px] flex items-center gap-2 mb-4 font-mono">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-900/40 text-red-500 rounded-lg text-[11px] flex items-center gap-2 mb-4 font-mono">
                <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                <span>Format Error: {loginError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Hillary Sage"
                    className="w-full bg-zinc-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-zinc-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1 font-medium">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full bg-zinc-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-sans"
                  required
                />
              </div>

              {authMode === "signup" && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="subscribe-updates"
                    checked={subscribeCheckbox}
                    onChange={(e) => setSubscribeCheckbox(e.target.checked)}
                    className="mt-0.5 rounded border-white/10 text-red-600 focus:ring-red-500 bg-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="subscribe-updates" className="text-[11px] text-zinc-400 leading-normal select-none cursor-pointer font-sans">
                    Yes, subscribe me to be notified instantly on latest high-authority tech publications mailed to me.
                  </label>
                </div>
              )}

              {/* Toggle Account Mode Footer Control */}
              <div className="text-[11px] text-zinc-500 text-center font-sans">
                {authMode === "signin" ? (
                  <span>
                    Don't have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setLoginError("");
                      }}
                      className="text-red-500 hover:text-red-400 underline font-semibold cursor-pointer"
                    >
                      Register & Subscribe Now
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setLoginError("");
                      }}
                      className="text-red-500 hover:text-red-400 underline font-semibold cursor-pointer"
                    >
                      Log in to Profile
                    </button>
                  </span>
                )}
              </div>

              {/* Admin credentials hint panel inside the login frame for accessibility was removed */}

              <div className="pt-2 flex gap-3 text-xs font-mono font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError("");
                    setAuthSuccessMsg("");
                  }}
                  className="flex-1 cursor-pointer bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg text-zinc-400 hover:text-white py-2 text-center transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-center transition-colors shadow-lg"
                >
                  {authMode === "signin" ? "Sign In" : "Register Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structural Minimal Footer (Linear Precision / No Slop) */}
      <footer className={`border-t py-8 text-xs font-mono mt-auto select-none transition-colors ${
        theme === 'light'
          ? 'border-zinc-200 bg-zinc-100/80 text-zinc-500'
          : 'border-white/5 bg-zinc-950/40 text-zinc-500'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
            <span>© 2026 PULSE SAGE SYSTEMS. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-zinc-600">
            <span>PULSE ENGINE v2.0.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
