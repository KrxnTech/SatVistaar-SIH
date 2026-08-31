import React, { useState } from 'react';
import {
  Satellite,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';
import { useAnalysis } from '../context/AnalysisContext.jsx';
import { ANALYSIS_MODES } from '../components/ModeSelector.jsx';
import { InteractiveHeroGrid } from '../components/InteractiveHeroGrid.jsx';

const PIPELINE_STEPS = [
  { n: '01', t: 'Upload Satellite Imagery', d: 'Upload 1 or 2 satellite images (GeoTIFF, TIFF, PNG, JPEG up to 50MB). Python/Rasterio extracts spatial CRS, dimensions, and band channels.' },
  { n: '02', t: 'Enter Analysis Query', d: 'Submit an open-ended natural-language prompt or select from task-specific presets (e.g. "What is visible?", "What changed?").' },
  { n: '03', t: 'Backend Intent Classifier', d: 'The agentic classifier inspects prompt tokens and image counts to categorize the task and verify compatibility before invoking models.' },
  { n: '04', t: 'Model Routing & Fallback', d: 'The request is routed to Groq Cloud VLM (Qwen3.8-27B Vision), with automatic graceful fallback to local Ollama on timeout or error.' },
  { n: '05', t: 'Multimodal VLM Inference', d: 'The Vision-Language model performs deep spatial reasoning over visible land cover, infrastructure, vegetation, and spectral boundaries.' },
  { n: '06', t: 'Structured Results Returned', d: 'Outputs are normalized into standardized JSON contracts with bounding region overlays, execution traces, and telemetry.' },
];

export function HomePage({ backendHealth }) {
  const { navigateTo } = useRouter();
  const { selectMissionAndPrompt } = useAnalysis();
  const [activeMode, setActiveMode] = useState(0);

  const isHealthy = backendHealth?.ok && (backendHealth.status === 'healthy' || backendHealth.status === 'ok');
  const mode = ANALYSIS_MODES[activeMode];
  const ModeIcon = mode?.icon;

  const handleStartMission = (modeId, defaultQuery) => {
    selectMissionAndPrompt(modeId, defaultQuery);
    navigateTo('/analysis');
  };

  return (
    <div className="gov-home-root">
      {/* 1. IMMERSIVE HERO — full-bleed image, left-aligned text overlay, ticker footer */}
      <section className="hero-immersive">
        <div className="hero-bg">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/hero-video-poster.jpg"
            className="hero-bg-video"
            aria-hidden="true"
          >
            <source src="/hero-satellite-loop.mp4" type="video/mp4" />
          </video>
          <div className="hero-bg-gradient" />
          <InteractiveHeroGrid />
        </div>

        <div className="container hero-immersive-inner">
          <div className="hero-badge-row">
            <span className={`status-pill ${isHealthy ? 'healthy' : 'checking'}`}>
              <span className="status-dot" />
              <span className="font-mono">{isHealthy ? 'VLM GATEWAY ACTIVE' : 'API CONNECTING'}</span>
            </span>
          </div>

          <h1 className="hero-title">
            Satellite <span className="hero-highlight-orange">Vision &amp; Language</span> Analysis
          </h1>

          <p className="hero-subtitle font-mono">
            Analyze optical and multispectral remote-sensing imagery using conversational queries and AI-powered Vision-Language Models - Automate geospatial intent classification and spatial evidence extraction 🛰️
          </p>

          <div className="hero-cta-row">
            <button type="button" className="hero-primary-orange-btn" onClick={() => navigateTo('/analysis')}>
              <Play size={16} fill="currentColor" />
              <span>Start Analysis</span>
            </button>
            <button type="button" className="hero-secondary-blue-btn" onClick={() => navigateTo('/about')}>
              <span>Learn More</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Ticker stat strip along the hero's bottom edge */}
        <div className="hero-ticker font-mono">
          <div className="ticker-item">
            <span className="ticker-value orange">4</span>
            <span className="ticker-label">Analysis Tasks</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-value blue">50 MB</span>
            <span className="ticker-label">GeoTIFF / PNG Limit</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-value green">&lt; 2.0s</span>
            <span className="ticker-label">Average Latency</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-value orange">27B</span>
            <span className="ticker-label">VLM Backbone</span>
          </div>
        </div>
      </section>

      {/* 2. PIPELINE RUNNER — continuous running stream animation */}
      <section className="pipeline-runner-section">
        <div className="container">
          <div className="pipeline-header-row">
            <div className="section-heading-block left-aligned">
              <span className="section-category font-mono">PIPELINE ARCHITECTURE</span>
              <h2 className="section-heading">How the System Works</h2>
              <p className="section-lead">
                A 6-step deterministic pipeline that takes raw satellite imagery and natural language instructions, executing automated multimodal intelligence.
              </p>
            </div>
            <div className="running-status-tag font-mono">
              <span className="pulse-dot" />
              <span>LIVE PIPELINE STREAM // 6 CONCURRENT STAGES</span>
            </div>
          </div>
        </div>

        {/* Continuous Animated Running Track */}
        <div className="pipeline-marquee-container">
          <div className="pipeline-laser-beam" />
          <div className="pipeline-marquee-track">
            {/* First Set of 6 Steps */}
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={`orig-${step.n}`} className="runner-step-card gov-card">
                <div className="runner-card-top">
                  <span className="runner-step-num font-mono">{step.n}</span>
                  <span className="runner-stage-tag font-mono">STAGE {idx + 1}</span>
                </div>
                <h3 className="runner-step-title">{step.t}</h3>
                <p className="runner-step-desc">{step.d}</p>
                <div className="runner-card-glow" />
              </div>
            ))}

            {/* Cloned Set of 6 Steps for Seamless Loop */}
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={`clone-${step.n}`} className="runner-step-card gov-card" aria-hidden="true">
                <div className="runner-card-top">
                  <span className="runner-step-num font-mono">{step.n}</span>
                  <span className="runner-stage-tag font-mono">STAGE {idx + 1}</span>
                </div>
                <h3 className="runner-step-title">{step.t}</h3>
                <p className="runner-step-desc">{step.d}</p>
                <div className="runner-card-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MISSION CONSOLE — interactive tab list + detail panel */}
      <section className="mission-console-section">
        <div className="container">
          <div className="section-heading-block left-aligned">
            <span className="section-category font-mono">CORE CAPABILITIES</span>
            <h2 className="section-heading">Supported Analysis Tasks</h2>
            <p className="section-lead">
              SatVistaar implements four verified analysis workflows strictly supported by the backend pipeline.
            </p>
          </div>

          <div className="console-shell gov-card">
            <div className="console-tab-list">
              {ANALYSIS_MODES.map((m, idx) => {
                const Icon = m.icon;
                const isActive = idx === activeMode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`console-tab ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveMode(idx)}
                  >
                    <span className={`console-tab-icon mode-${m.id.toLowerCase()}`}>
                      <Icon size={16} />
                    </span>
                    <span className="console-tab-title">{m.title}</span>
                    <span className="console-tab-badge font-mono">{m.badge}</span>
                  </button>
                );
              })}
            </div>

            {mode && (
              <div className="console-detail-panel">
                <div className="console-detail-head">
                  <div className={`console-detail-icon mode-${mode.id.toLowerCase()}`}>
                    {ModeIcon && <ModeIcon size={22} />}
                  </div>
                  <h3 className="console-detail-title">{mode.title}</h3>
                </div>

                <p className="console-detail-desc">{mode.description}</p>

                <div className="console-prompt-box">
                  <span className="prompt-label font-mono">Example Query</span>
                  <p className="prompt-text">&ldquo;{mode.defaultQuery}&rdquo;</p>
                </div>

                <button
                  type="button"
                  className="console-launch-btn"
                  onClick={() => handleStartMission(mode.id, mode.defaultQuery)}
                >
                  <span>Launch in Dashboard</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. DIAGONAL CTA STRIP — asymmetric, left text / right buttons */}
      <section className="cta-diagonal-section">
        <div className="container cta-diagonal-inner">
          <div className="cta-diagonal-copy">
            <h2 className="cta-heading">Ready to Perform Satellite Analysis?</h2>
            <p className="cta-subheading">
              Upload your remote sensing imagery or explore the analysis dashboard with supported queries.
            </p>
          </div>
          <div className="cta-diagonal-btns">
            <button type="button" className="cta-primary-orange-btn" onClick={() => navigateTo('/analysis')}>
              <Play size={16} fill="currentColor" />
              <span>Start Analysis Dashboard</span>
            </button>
            <button type="button" className="cta-secondary-blue-btn" onClick={() => navigateTo('/about')}>
              <span>Read Full Documentation</span>
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .gov-home-root {
          display: flex;
          flex-direction: column;
          gap: 5rem;
          padding-bottom: 4rem;
          background: #08090d;
        }

        /* ---------- Immersive Hero ---------- */
        .hero-immersive {
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--border-subtle);
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.5;
          filter: contrast(1.15) brightness(0.92);
          transform: scale(1.02);
          pointer-events: none;
        }
        .hero-bg-gradient {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(8, 9, 13, 0.45) 0%, rgba(8, 9, 13, 0.75) 60%, #08090d 100%),
            linear-gradient(90deg, #08090d 0%, rgba(8, 9, 13, 0.75) 45%, rgba(8, 9, 13, 0.25) 100%);
          pointer-events: none;
        }
        .hero-interactive-grid-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        .hero-immersive-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 5rem 0 3.5rem;
          max-width: 680px;
        }
        .hero-badge-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .gov-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.65rem;
          background: rgba(20, 23, 34, 0.85);
          border: 1px solid #2a3044;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-orange-text);
          backdrop-filter: blur(4px);
        }
        .badge-icon { color: var(--accent-orange); }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          backdrop-filter: blur(4px);
        }
        .status-pill.healthy {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: var(--status-green-text);
        }
        .status-pill.checking {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fbbf24;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .hero-highlight-orange { color: var(--accent-orange); }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.15rem; }
        }
        .hero-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 56ch;
        }
        .hero-cta-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          padding-top: 0.5rem;
        }
        .hero-primary-orange-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.6rem;
          background: var(--accent-orange);
          color: #08090d;
          border-radius: var(--radius-sm);
          font-size: 0.925rem;
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        .hero-primary-orange-btn:hover {
          background: var(--accent-orange-hover);
          transform: translateY(-1px);
        }
        .hero-secondary-blue-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.8rem 1.35rem;
          background: rgba(20, 23, 34, 0.7);
          border: 1px solid var(--border-medium);
          color: var(--text-main);
          border-radius: var(--radius-sm);
          font-size: 0.925rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        .hero-secondary-blue-btn:hover {
          background: #181c28;
          border-color: var(--accent-blue);
          color: var(--accent-blue-text);
        }

        /* Ticker footer strip */
        .hero-ticker {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--border-subtle);
          background: rgba(8, 9, 13, 0.85);
          backdrop-filter: blur(6px);
        }
        .ticker-item {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          padding: 0.9rem 1.5rem;
          border-right: 1px solid var(--border-subtle);
        }
        .ticker-item:last-child { border-right: none; }
        .ticker-value {
          font-size: 1.1rem;
          font-weight: 800;
        }
        .ticker-value.orange { color: var(--accent-orange); }
        .ticker-value.blue { color: var(--accent-blue-text); }
        .ticker-value.green { color: var(--status-green-text); }
        .ticker-label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        @media (max-width: 700px) {
          .hero-ticker { grid-template-columns: repeat(2, 1fr); }
          .ticker-item { padding: 0.75rem 1rem; }
        }

        /* ---------- Section headings ---------- */
        .section-heading-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 640px;
          margin-bottom: 2.75rem;
        }
        .section-heading-block.left-aligned {
          text-align: left;
        }
        .section-category {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent-orange);
        }
        .section-heading {
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .section-lead {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.55;
        }

        /* ---------- Pipeline Runner Animation ---------- */
        .pipeline-runner-section {
          position: relative;
          overflow: hidden;
          padding: 1rem 0 2rem 0;
        }
        .pipeline-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .running-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.35);
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-orange-text);
          margin-bottom: 1.5rem;
        }
        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent-orange);
          box-shadow: 0 0 8px var(--accent-orange);
          animation: statusPulse 1.5s ease-in-out infinite;
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .pipeline-marquee-container {
          position: relative;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          overflow: hidden;
          padding: 1.5rem 0;
          mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 1) 6%, rgba(0, 0, 0, 1) 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 1) 6%, rgba(0, 0, 0, 1) 94%, transparent 100%);
        }
        .pipeline-laser-beam {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-orange), var(--accent-blue), transparent);
          background-size: 200% 100%;
          animation: laserScan 4s linear infinite;
        }
        @keyframes laserScan {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .pipeline-marquee-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: pipelineRun 32s linear infinite;
          will-change: transform;
        }
        .pipeline-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes pipelineRun {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.75rem)); }
        }

        .runner-step-card {
          width: 320px;
          flex-shrink: 0;
          background: #12151f;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .runner-step-card:hover {
          transform: translateY(-4px);
          border-color: rgba(249, 115, 22, 0.5);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(249, 115, 22, 0.15);
        }
        .runner-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .runner-step-num {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: rgba(249, 115, 22, 0.12);
          border: 1px solid rgba(249, 115, 22, 0.4);
          color: var(--accent-orange);
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .runner-stage-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-dim);
          background: #0d0e15;
          padding: 0.15rem 0.5rem;
          border-radius: 3px;
          border: 1px solid var(--border-subtle);
        }
        .runner-step-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        .runner-step-desc {
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .runner-card-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent-orange), transparent);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .runner-step-card:hover .runner-card-glow {
          opacity: 1;
        }

        /* ---------- Mission Console ---------- */
        .console-shell {
          display: grid;
          grid-template-columns: 300px 1fr;
          background: #141722;
          border: 1px solid var(--border-subtle);
          overflow: hidden;
        }
        @media (max-width: 800px) {
          .console-shell { grid-template-columns: 1fr; }
        }
        .console-tab-list {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-subtle);
          background: #10121a;
        }
        @media (max-width: 800px) {
          .console-tab-list {
            flex-direction: row;
            overflow-x: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
          }
        }
        .console-tab {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 1rem 1.25rem;
          text-align: left;
          border-left: 3px solid transparent;
          background: transparent;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .console-tab:hover {
          background: rgba(255,255,255,0.02);
          color: var(--text-secondary);
        }
        .console-tab.is-active {
          background: #141722;
          border-left-color: var(--accent-orange);
          color: #ffffff;
        }
        .console-tab-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #0d0e15;
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .console-tab-icon.mode-vqa { color: var(--accent-blue-text); }
        .console-tab-icon.mode-feature_identification { color: var(--accent-orange); }
        .console-tab-icon.mode-captioning { color: var(--status-green-text); }
        .console-tab-icon.mode-change_analysis { color: #f87171; }
        .console-tab-title {
          font-size: 0.85rem;
          font-weight: 600;
          flex: 1;
        }
        .console-tab-badge {
          font-size: 0.62rem;
          color: var(--text-dim);
          background: #0d0e15;
          border: 1px solid var(--border-subtle);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .console-detail-panel {
          padding: 2rem 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .console-detail-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .console-detail-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          background: #0d0e15;
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .console-detail-icon.mode-vqa { color: var(--accent-blue-text); border-color: rgba(59, 130, 246, 0.4); }
        .console-detail-icon.mode-feature_identification { color: var(--accent-orange); border-color: rgba(249, 115, 22, 0.4); }
        .console-detail-icon.mode-captioning { color: var(--status-green-text); border-color: rgba(16, 185, 129, 0.4); }
        .console-detail-icon.mode-change_analysis { color: #f87171; border-color: rgba(239, 68, 68, 0.4); }
        .console-detail-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #ffffff;
        }
        .console-detail-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.55;
          max-width: 56ch;
        }
        .console-prompt-box {
          background: #0d0e15;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          max-width: 56ch;
        }
        .prompt-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
        }
        .prompt-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-style: italic;
        }
        .console-launch-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.3rem;
          background: var(--accent-orange);
          color: #08090d;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 700;
          margin-top: 0.25rem;
        }
        .console-launch-btn:hover {
          background: var(--accent-orange-hover);
        }

        /* ---------- Diagonal CTA ---------- */
        .cta-diagonal-section {
          position: relative;
          background: #12151f;
          border-top: 1px solid var(--border-medium);
          border-bottom: 1px solid var(--border-medium);
          overflow: hidden;
        }
        .cta-diagonal-section::before {
          content: '';
          position: absolute;
          top: 0;
          right: -10%;
          width: 45%;
          height: 100%;
          background: repeating-linear-gradient(
            115deg,
            rgba(249, 115, 22, 0.06),
            rgba(249, 115, 22, 0.06) 2px,
            transparent 2px,
            transparent 14px
          );
          pointer-events: none;
        }
        .cta-diagonal-inner {
          position: relative;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 2.5rem;
          align-items: center;
          padding: 3.5rem 2.5rem;
        }
        @media (max-width: 800px) {
          .cta-diagonal-inner {
            grid-template-columns: 1fr;
            padding: 2.5rem 1.25rem;
          }
        }
        .cta-diagonal-copy {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding-left: 2rem;
        }
        @media (max-width: 800px) {
          .cta-diagonal-copy {
            padding-left: 0;
          }
        }
        .cta-heading {
          font-size: 1.9rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        .cta-subheading {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.55;
          max-width: 48ch;
        }
        .cta-diagonal-btns {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: flex-start;
        }
        @media (max-width: 800px) {
          .cta-diagonal-btns {
            flex-direction: row;
            flex-wrap: wrap;
          }
        }
        .cta-primary-orange-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--accent-orange);
          color: #08090d;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 700;
        }
        .cta-primary-orange-btn:hover {
          background: var(--accent-orange-hover);
        }
        .cta-secondary-blue-btn {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: #141722;
          color: var(--text-main);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 600;
        }
        .cta-secondary-blue-btn:hover {
          background: #181c28;
          border-color: var(--accent-blue);
          color: var(--accent-blue-text);
        }
      `}</style>
    </div>
  );
}

export default HomePage;