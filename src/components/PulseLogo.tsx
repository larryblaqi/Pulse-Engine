import React from "react";

export function PulseLogo({ className = "", theme = "dark" }: { className?: string; theme?: "dark" | "light" }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`} id="pulse-logo">
      {/* Heartbeat Circular Coin */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-red-600 shadow-sm transition-all duration-150">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-600 animate-ping opacity-15"></span>
        <svg
          className="w-4.5 h-4.5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* EKG / Heartbeat Pulse line path */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12h3l3-8l4 16l3-11L18 12h3"
          />
        </svg>
      </div>
      
      {/* Wordmark */}
      <div className="flex flex-col">
        <div className="font-sans font-extrabold text-base tracking-tight leading-none">
          <span className="text-red-600 dark:text-red-500">pulse</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-sm"> AI</span>
        </div>
      </div>
    </div>
  );
}
