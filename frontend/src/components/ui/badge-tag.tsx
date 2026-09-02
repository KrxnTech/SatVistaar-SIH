"use client";

import React from "react";

export interface BadgeTagProps {
  version?: string;
  text?: string;
  tagText?: string;
  isHealthy?: boolean;
  className?: string;
}

export default function Example({
  version = "Version 7.8",
  text = "New feature is ready to use, let's try",
  tagText,
  isHealthy = true,
  className = "",
}: BadgeTagProps) {
  const displayVersion = tagText || version;
  return (
    <div
      className={`inline-flex items-center space-x-2.5 border border-white/20 rounded-full bg-white/10 backdrop-blur-md p-1 text-xs sm:text-sm text-white/90 shadow-sm ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.625rem",
        border: "1px solid rgba(255, 255, 255, 0.22)",
        borderRadius: "9999px",
        background: "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "0.25rem 0.75rem 0.25rem 0.25rem",
        fontSize: "0.8125rem",
        color: "#ffffff",
      }}
    >
      <div
        className="bg-white/20 border border-white/30 rounded-2xl px-3 py-1 font-semibold text-white tracking-wide"
        style={{
          background: "rgba(255, 255, 255, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          borderRadius: "1rem",
          padding: "0.2rem 0.75rem",
          fontWeight: 600,
          color: "#ffffff",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: isHealthy ? "#22c55e" : "#f59e0b",
            display: "inline-block",
            boxShadow: isHealthy
              ? "0 0 8px rgba(34, 197, 94, 0.8)"
              : "0 0 8px rgba(245, 158, 11, 0.8)",
          }}
        />
        <span>{displayVersion}</span>
      </div>
      <p
        className="pr-2 font-medium"
        style={{
          margin: 0,
          paddingRight: "0.5rem",
          fontWeight: 500,
          letterSpacing: "0.02em",
          color: "rgba(255, 255, 255, 0.95)",
        }}
      >
        {text}
      </p>
    </div>
  );
}
