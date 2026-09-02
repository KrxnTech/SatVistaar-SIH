import React, { useState, useEffect, useRef } from 'react';
import {
  Satellite,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';

const SECTIONS = [
  { id: 'about', label: 'Who We Are' },
  { id: 'problem', label: 'The Problem' },
  { id: 'solution', label: 'Our Approach' },
  { id: 'workflow', label: 'How It Works' },
  { id: 'architecture', label: 'AI / VLM Architecture' },
  { id: 'tasks', label: 'What You Can Do' },
  { id: 'stack', label: 'Technology Stack' },
  { id: 'limitations', label: 'Capabilities & Limitations' },
  { id: 'roadmap', label: "What's Next" },
  { id: 'team', label: 'The Team' },
];

export function AboutPage({ backendHealth }) {
  const { navigateTo } = useRouter();
  const [activeSection, setActiveSection] = useState('about');
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const registerRef = () => undefined;

  return (
    <div className="gov-about-page">
      <div className="about-shell">
        {/* Sticky sidebar nav */}
        <aside className="about-sidebar">
          <div className="sidebar-mark">
            <Satellite size={18} className="sidebar-mark-icon" />
            <div>
              <div className="sidebar-mark-title">SatVistaar</div>
              <span className="sidebar-mark-sub font-mono">EARTH INTELLIGENCE</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`sidebar-nav-item ${activeSection === s.id ? 'is-active' : ''}`}
                onClick={() => scrollToSection(s.id)}
              >
                <span className="sidebar-nav-num font-mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="sidebar-nav-label">{s.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="about-cta-orange-btn sidebar-cta"
            onClick={() => navigateTo('/analysis')}
          >
            <Play size={15} fill="currentColor" />
            <span>Launch Analysis Dashboard</span>
          </button>
        </aside>

        {/* Scrolling content column */}
        <main className="about-content">
          {/* Hero — split two-column, not a banner */}
          <div className="about-hero">
            <div className="hero-copy">
              <span className="gov-section-badge font-mono">PLATFORM OVERVIEW // ARCHITECTURE &amp; DESIGN</span>
              <h1 className="about-title">About SatVistaar</h1>
              <p className="about-lead">
                We're building the conversational layer for satellite imagery — so asking a question
                about a piece of land is as simple as asking a question about anything else.
              </p>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <svg viewBox="0 0 240 240" className="orbit-svg">
                <defs>
                  <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--flame-orange)" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="var(--flame-orange)" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="node1-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--flame-orange)" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="var(--flame-orange)" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="node2-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--info)" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="var(--info)" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="node3-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Static concentric orbit tracks */}
                <circle cx="120" cy="120" r="100" className="orbit-ring orbit-ring-1" />
                <circle cx="120" cy="120" r="72" className="orbit-ring orbit-ring-2" />
                <circle cx="120" cy="120" r="44" className="orbit-ring orbit-ring-3" />

                {/* Outer Orbit (r=100) — Rotating */}
                <g className="orbit-group orbit-group-1">
                  <line x1="120" y1="120" x2="120" y2="20" className="orbit-tether" />
                  <circle cx="120" cy="20" r="11" fill="url(#node1-glow)" className="orbit-node-glow" />
                  <circle cx="120" cy="20" r="5" className="orbit-node orbit-node-1" />
                </g>

                {/* Middle Orbit (r=72) — Rotating */}
                <g className="orbit-group orbit-group-2">
                  <circle cx="171" cy="171" r="10" fill="url(#node2-glow)" className="orbit-node-glow" />
                  <circle cx="171" cy="171" r="4" className="orbit-node orbit-node-2" />
                </g>

                {/* Inner Orbit (r=44) — Rotating */}
                <g className="orbit-group orbit-group-3">
                  <circle cx="82" cy="142" r="9" fill="url(#node3-glow)" className="orbit-node-glow" />
                  <circle cx="82" cy="142" r="3.5" className="orbit-node orbit-node-3" />
                </g>

                {/* Central Sensor Core */}
                <circle cx="120" cy="120" r="14" fill="url(#core-glow)" className="orbit-core-pulse" />
                <circle cx="120" cy="120" r="4.5" className="orbit-core" />
              </svg>
            </div>
          </div>

          {/* 1. About */}
          <section id="about" ref={registerRef('about')} className="about-section">
            <h2 className="section-title">Who We Are</h2>
            <p className="section-text">
              <strong>SatVistaar</strong> is a geospatial intelligence platform that lets anyone interrogate satellite imagery in plain language — no GIS training, no manual band math, no separate tool for every question. Upload an image, ask what you want to know, and get an answer grounded in the pixels themselves. We built SatVistaar because the people who most need insight from Earth observation data — planners, responders, analysts, researchers — are usually the ones furthest from the software built to extract it.
            </p>
          </section>

          {/* 2. Problem Statement */}
          <section id="problem" ref={registerRef('problem')} className="about-section">
            <h2 className="section-title">The Problem</h2>
            <p className="section-text">
              Open satellite archives from missions like Sentinel-2 and Landsat put more Earth observation data in front of us every day than any team could manually review. The bottleneck was never access to imagery — it's turning that imagery into an answer.
            </p>
            <div className="problem-grid">
              <div className="problem-item">
                <h4>A steep learning curve</h4>
                <p>Getting a straight answer out of a raster traditionally means learning GIS software, hand-picking band combinations, and writing custom scripts.</p>
              </div>
              <div className="problem-item">
                <h4>The wrong shape of tool</h4>
                <p>Field teams, planners, and responders usually just have a question — not the time or training to stand up a full analysis pipeline to answer it.</p>
              </div>
              <div className="problem-item">
                <h4>Fragmented workflows</h4>
                <p>Asking a question, spotting a feature, and tracking change over time are usually three separate tools that don't talk to each other.</p>
              </div>
            </div>
          </section>

          {/* 3. Proposed Solution — vertical timeline (genuine sequence) */}
          <section id="solution" ref={registerRef('solution')} className="about-section">
            <h2 className="section-title">Our Approach</h2>
            <p className="section-text">
              You bring <strong>an image and a question</strong> — SatVistaar handles the rest. Behind that simple exchange, an agentic pipeline does the work a GIS analyst would normally do by hand:
            </p>
            <div className="solution-timeline">
              {[
                { n: '01', t: 'Automated Intent Classification', d: 'Categorizes queries into VQA, Scene Description, Feature Identification, or Bi-Temporal Change.' },
                { n: '02', t: 'Geospatial Preprocessing', d: 'Extracts coordinate reference systems (CRS), dimensions, and multi-band metadata via Python Rasterio.' },
                { n: '03', t: 'Provider-Agnostic Model Routing', d: 'Routes inference to high-speed cloud VLM (Groq Qwen3.8-27B) with local Ollama fallback.' },
                { n: '04', t: 'Structured Intelligence Dossier', d: 'Synthesizes answers, spatial grounding overlays, and side-by-side temporal visualizers.' },
              ].map((step, idx, arr) => (
                <div className="timeline-row" key={step.n}>
                  <div className="timeline-rail">
                    <span className="timeline-dot font-mono">{step.n}</span>
                    {idx < arr.length - 1 && <span className="timeline-line" />}
                  </div>
                  <div className="timeline-body">
                    <h4>{step.t}</h4>
                    <p>{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. How the System Works */}
          <section id="workflow" ref={registerRef('workflow')} className="about-section">
            <h2 className="section-title">How the System Works</h2>
            <p className="section-text">The end-to-end execution flow is deterministic and structured:</p>
            <div className="process-flow-container">
              <div className="process-flow-laser" />
              <div className="process-flow-track font-mono">
                {/* Primary Step Sequence */}
                {[
                  { n: '01', t: 'Image & Query Input' },
                  { n: '02', t: 'Raster Preprocessing' },
                  { n: '03', t: 'Intent & Compatibility' },
                  { n: '04', t: 'Model Router (VLM)' },
                  { n: '05', t: 'Evidence Overlay' },
                ].map((step) => (
                  <React.Fragment key={`f1-${step.n}`}>
                    <div className="flow-node">
                      <span className="flow-node-num">{step.n}</span>
                      <span className="flow-node-title">{step.t}</span>
                    </div>
                    <div className="flow-arrow">→</div>
                  </React.Fragment>
                ))}

                {/* Seamless Cloned Sequence for Infinite Running Loop */}
                {[
                  { n: '01', t: 'Image & Query Input' },
                  { n: '02', t: 'Raster Preprocessing' },
                  { n: '03', t: 'Intent & Compatibility' },
                  { n: '04', t: 'Model Router (VLM)' },
                  { n: '05', t: 'Evidence Overlay' },
                ].map((step) => (
                  <React.Fragment key={`f2-${step.n}`}>
                    <div className="flow-node" aria-hidden="true">
                      <span className="flow-node-num">{step.n}</span>
                      <span className="flow-node-title">{step.t}</span>
                    </div>
                    <div className="flow-arrow" aria-hidden="true">→</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* 5. AI / VLM Architecture — stacked rows instead of 3-col grid */}
          <section id="architecture" ref={registerRef('architecture')} className="about-section">
            <h2 className="section-title">AI / VLM Architecture</h2>
            <p className="section-text">
              SatVistaar utilizes multimodal Vision-Language Models capable of cross-modal reasoning between text prompts and visual feature maps:
            </p>
            <div className="architecture-stack">
              <div className="arch-row">
                <div className="arch-label t-orange font-mono">Primary VLM</div>
                <div className="arch-body">
                  <div className="arch-impl">Groq Cloud Qwen3.8-27B Vision / Llama-3.2-11B</div>
                  <div className="arch-role">High-throughput cloud inference with retry mechanics</div>
                </div>
              </div>
              <div className="arch-row">
                <div className="arch-label t-blue font-mono">Fallback VLM</div>
                <div className="arch-body">
                  <div className="arch-impl">Ollama Local Daemon (qwen2-vl)</div>
                  <div className="arch-role">Deterministic offline fallback if primary provider times out</div>
                </div>
              </div>
              <div className="arch-row">
                <div className="arch-label t-green font-mono">Preprocessing</div>
                <div className="arch-body">
                  <div className="arch-impl">Python 3.10 + Rasterio + Flask Microservice</div>
                  <div className="arch-role">Extracts GeoTIFF CRS, bounds, and converts multi-band rasters to optimized visual RGB</div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Supported Analysis Tasks — ghost numeral list */}
          <section id="tasks" ref={registerRef('tasks')} className="about-section">
            <h2 className="section-title">What You Can Do</h2>
            <div className="tasks-numeral-list">
              <div className="task-row">
                <span className="task-ghost-num font-mono">01</span>
                <div>
                  <h4>Visual Question Answering (VQA)</h4>
                  <p>Answer specific natural-language questions regarding visible land cover, infrastructure, water, or facilities. Requires 1 image.</p>
                </div>
              </div>
              <div className="task-row">
                <span className="task-ghost-num font-mono">02</span>
                <div>
                  <h4>Scene Description &amp; Captioning</h4>
                  <p>Generate a structured visual summary detailing terrain, dominant vegetation, urban footprint, and transport corridors. Requires 1 image.</p>
                </div>
              </div>
              <div className="task-row">
                <span className="task-ghost-num font-mono">03</span>
                <div>
                  <h4>Visual Grounding / Feature Identification</h4>
                  <p>Identify requested objects or geographical boundaries with approximate spatial bounding box overlays. Requires 1 image.</p>
                </div>
              </div>
              <div className="task-row">
                <span className="task-ghost-num font-mono">04</span>
                <div>
                  <h4>Bi-Temporal Change Analysis</h4>
                  <p>Compare baseline historical reference (Image A) with comparison (Image B) to describe qualitative visual differences. Requires 2 images.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Technology Stack — inline wrapped tags */}
          <section id="stack" ref={registerRef('stack')} className="about-section">
            <h2 className="section-title">Technology Stack</h2>
            <div className="tech-tag-cloud font-mono">
              <span className="tech-tag"><strong>Frontend</strong>React 19 · Vite 8 · Lucide Icons</span>
              <span className="tech-tag"><strong>Backend Gateway</strong>Node.js · Express 5 (ESM) · Multer</span>
              <span className="tech-tag"><strong>Security &amp; Auth</strong>JWT · HTTP-Only Cookies · Bcrypt.js</span>
              <span className="tech-tag"><strong>Geospatial Engine</strong>Python Flask · Rasterio · Pillow · NumPy</span>
              <span className="tech-tag"><strong>VLM Inference</strong>Groq Cloud API · Ollama Local Daemon</span>
            </div>
          </section>

          {/* 8. Limitations */}
          <section id="limitations" ref={registerRef('limitations')} className="about-section limitations-section">
            <div className="section-title-with-icon">
              <AlertTriangle size={18} className="warn-icon" />
              <h2 className="section-title">Capabilities &amp; Limitations</h2>
            </div>
            <p className="section-text">
              We'd rather be upfront about what SatVistaar is good at today than oversell it. Here's where the platform currently stands:
            </p>
            <ul className="about-bullets-list">
              <li><strong>Built for qualitative reasoning:</strong> SatVistaar's Vision-Language Models excel at describing scenes, identifying features, and explaining change — not at replacing a full remote-sensing analysis suite.</li>
              <li><strong>Not a source of calibrated indices:</strong> We don't yet compute calibrated radiometric indices (like NDVI) or pixel-level segmentation masks — that's on our roadmap, not in the product today.</li>
              <li><strong>Grounding is approximate:</strong> Bounding overlays reflect the model's visual attention, not survey-grade shapefiles. Treat them as a strong first look, not a legal boundary.</li>
            </ul>
          </section>

          {/* 9. What's Next */}
          <section id="roadmap" ref={registerRef('roadmap')} className="about-section">
            <h2 className="section-title">What's Next</h2>
            <ul className="about-bullets-list">
              <li><strong>Pixel-level segmentation:</strong> Bringing in dedicated segmentation models so land-cover masks are calibrated, not just described.</li>
              <li><strong>Optical + SAR fusion:</strong> Combining radar amplitude and phase data with optical imagery for analysis that works day or night, clear skies or cloud cover.</li>
              <li><strong>Native spectral indices:</strong> Server-side NDVI, NDWI, and NBR calculations you can trust as data, not just description.</li>
              <li><strong>Interactive mapping:</strong> Full slippy-map support with Cloud-Optimized GeoTIFF tiles, so you can pan and zoom instead of uploading crops.</li>
            </ul>
          </section>

          {/* 10. Team */}
          <section id="team" ref={registerRef('team')} className="about-section">
            <h2 className="section-title">The Team</h2>
            <p className="section-text">
              SatVistaar is built by a small team that cares more about whether a planner in the field can get a useful answer than about how impressive the underlying model sounds on paper. We work closely with the people who use satellite data day to day — disaster response coordinators, agricultural analysts, urban planners — to keep the product honest about what it can and can't do yet.
            </p>
            <div className="team-meta-row font-mono">
              <div><strong>Status:</strong> Actively developed</div>
              <div><strong>License:</strong> ISC License</div>
            </div>
          </section>

          {/* Mobile-only CTA (sidebar CTA is hidden on small screens) */}
          <div className="about-bottom-cta">
            <button
              type="button"
              className="about-cta-orange-btn"
              onClick={() => navigateTo('/analysis')}
            >
              <Play size={16} fill="currentColor" />
              <span>Launch Analysis Dashboard</span>
            </button>
          </div>
        </main>
      </div>

      <style>{`
        .gov-about-page {
          background: var(--bg-main);
          min-height: 100vh;
        }

        .about-shell {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 3rem;
          max-width: 1240px;
          margin: 0 auto;
          padding: 3rem 2rem 5rem;
          align-items: start;
        }

        /* ---------- Sidebar ---------- */
        .about-sidebar {
          position: sticky;
          top: 5.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          padding-right: 1.25rem;
          border-right: 1px solid var(--border-subtle);
        }
        .sidebar-mark {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .sidebar-mark-icon {
          color: var(--accent-orange);
          flex-shrink: 0;
        }
        .sidebar-mark-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }
        .sidebar-mark-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          text-align: left;
          padding: 0.45rem 0.5rem;
          border-radius: var(--radius-sm);
          border-left: 2px solid transparent;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.82rem;
          line-height: 1.3;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .sidebar-nav-item:hover {
          color: var(--text-secondary);
        }
        .sidebar-nav-item.is-active {
          color: var(--text-main);
          border-left-color: var(--accent-orange);
        }
        .sidebar-nav-num {
          font-size: 0.7rem;
          color: var(--accent-orange-text, var(--accent-orange));
          flex-shrink: 0;
        }
        .sidebar-cta {
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 900px) {
          .about-shell {
            grid-template-columns: 1fr;
            padding: 1.75rem 1.25rem 3.5rem;
          }
          .about-sidebar {
            position: static;
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
            padding-right: 0;
            padding-bottom: 1.25rem;
          }
          .sidebar-nav {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 0.4rem;
          }
          .sidebar-nav-item {
            border-left: none;
            border: 1px solid var(--border-subtle);
          }
          .sidebar-nav-item.is-active {
            border-color: var(--accent-orange);
          }
          .sidebar-cta {
            display: none;
          }
        }

        /* ---------- Hero ---------- */
        .about-hero {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 2.5rem;
          align-items: center;
          padding-bottom: 2.5rem;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .hero-copy {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .gov-section-badge {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--accent-orange);
        }
        .about-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          line-height: 1.05;
        }
        .about-lead {
          font-size: 1.02rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 46ch;
        }
        .hero-visual {
          display: flex;
          justify-content: center;
        }
        .orbit-svg {
          width: 100%;
          max-width: 210px;
          height: auto;
          overflow: visible;
          filter: drop-shadow(0 0 16px rgba(255, 82, 37, 0.12));
        }
        .orbit-ring {
          fill: none;
          stroke: var(--border-medium);
          stroke-width: 1;
        }
        .orbit-ring-2 { stroke: var(--border-subtle); }
        .orbit-ring-3 { stroke: rgba(255, 255, 255, 0.08); }

        .orbit-group {
          transform-origin: 120px 120px;
          will-change: transform;
        }
        .orbit-group-1 {
          animation: orbit-rotate 22s linear infinite;
        }
        .orbit-group-2 {
          animation: orbit-rotate 15s linear infinite;
        }
        .orbit-group-3 {
          animation: orbit-rotate-reverse 10s linear infinite;
        }

        .orbit-core {
          fill: var(--accent-orange);
          filter: drop-shadow(0 0 6px rgba(255, 82, 37, 0.9));
        }
        .orbit-core-pulse {
          animation: core-pulse 2.4s ease-in-out infinite;
          transform-origin: 120px 120px;
        }
        .orbit-tether {
          stroke: var(--border-medium);
          stroke-width: 1;
          stroke-dasharray: 2 3;
          opacity: 0.8;
        }
        .orbit-node-1 {
          fill: var(--accent-orange);
          filter: drop-shadow(0 0 6px var(--flame-orange));
        }
        .orbit-node-2 {
          fill: var(--info);
          filter: drop-shadow(0 0 6px var(--info));
        }
        .orbit-node-3 {
          fill: var(--success);
          filter: drop-shadow(0 0 6px var(--success));
        }
        .orbit-node-glow {
          opacity: 0.75;
          animation: node-pulse 2s ease-in-out infinite alternate;
        }

        @keyframes orbit-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbit-rotate-reverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes core-pulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.2);
          }
        }

        @keyframes node-pulse {
          0% {
            opacity: 0.35;
            transform: scale(0.9);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.15);
          }
        }

        @media (max-width: 700px) {
          .about-hero {
            grid-template-columns: 1fr;
          }
          .hero-visual { order: -1; }
          .orbit-svg { max-width: 140px; }
          .about-title { font-size: 2rem; }
        }

        /* ---------- Sections ---------- */
        .about-content {
          display: flex;
          flex-direction: column;
          gap: 2.75rem;
          min-width: 0;
        }
        .about-section {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          scroll-margin-top: 5.5rem;
          max-width: 720px;
        }
        .section-title-with-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .warn-icon { color: var(--accent-orange); }
        .section-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .section-text {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }
        .about-bullets-list {
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        /* Problem grid — asymmetric, left-aligned, no cards */
        .problem-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.25rem;
        }
        .problem-item {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 1rem;
          padding: 0.85rem 0;
          border-top: 1px solid var(--border-subtle);
        }
        .problem-item h4 {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .problem-item p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        @media (max-width: 560px) {
          .problem-item { grid-template-columns: 1fr; gap: 0.3rem; }
        }

        /* Solution timeline (vertical) */
        .solution-timeline {
          display: flex;
          flex-direction: column;
          margin-top: 0.5rem;
        }
        .timeline-row {
          display: grid;
          grid-template-columns: 2.5rem 1fr;
          gap: 1rem;
        }
        .timeline-rail {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .timeline-dot {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--bg-main);
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: var(--accent-orange);
          flex-shrink: 0;
        }
        .timeline-line {
          flex: 1;
          width: 1px;
          background: var(--border-subtle);
          min-height: 1.25rem;
        }
        .timeline-body {
          padding-bottom: 1.5rem;
        }
        .timeline-body h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }
        .timeline-body p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Process flow running diagram */
        .process-flow-container {
          position: relative;
          overflow: hidden;
          background: var(--bg-main);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 1rem 0;
          mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
        }
        .process-flow-laser {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent-orange), var(--accent-blue), transparent);
          background-size: 200% 100%;
          animation: laser-slide 3s linear infinite;
        }
        .process-flow-track {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          width: max-content;
          animation: flow-marquee 22s linear infinite;
          padding: 0 0.5rem;
          will-change: transform;
        }
        .process-flow-track:hover {
          animation-play-state: paused;
        }
        .flow-node {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          padding: 0.45rem 0.75rem;
          border-radius: 4px;
          color: var(--accent-blue-text);
          font-size: 0.75rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          flex-shrink: 0;
        }
        .flow-node:hover {
          border-color: var(--accent-orange);
          box-shadow: 0 0 10px rgba(255, 82, 37, 0.2);
        }
        .flow-node-num {
          color: var(--accent-orange-text, var(--accent-orange));
          font-size: 0.65rem;
          font-weight: 700;
        }
        .flow-node-title {
          font-weight: 600;
          color: var(--light-gray);
        }
        .flow-arrow {
          color: var(--accent-orange);
          font-weight: 800;
          font-size: 0.85rem;
          padding: 0 0.2rem;
          animation: arrow-flicker 1.8s ease-in-out infinite alternate;
          flex-shrink: 0;
        }

        @keyframes flow-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes laser-slide {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes arrow-flicker {
          0% {
            opacity: 0.5;
            transform: translateX(-1px);
          }
          100% {
            opacity: 1;
            transform: translateX(2px);
          }
        }

        /* Architecture stacked rows */
        .architecture-stack {
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--border-subtle);
        }
        .arch-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 1.25rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        .arch-label {
          font-size: 0.78rem;
          font-weight: 700;
          padding-top: 0.15rem;
        }
        .t-orange { color: var(--accent-orange-text, var(--accent-orange)); }
        .t-blue { color: var(--accent-blue-text); }
        .t-green { color: var(--status-green-text); }
        .arch-impl {
          font-size: 0.88rem;
          color: var(--text-main);
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .arch-role {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        @media (max-width: 560px) {
          .arch-row { grid-template-columns: 1fr; gap: 0.3rem; }
        }

        /* Task ghost-numeral list */
        .tasks-numeral-list {
          display: flex;
          flex-direction: column;
        }
        .task-row {
          display: grid;
          grid-template-columns: 3.25rem 1fr;
          gap: 1rem;
          padding: 1.1rem 0;
          border-top: 1px solid var(--border-subtle);
        }
        .task-ghost-num {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--border-medium);
          line-height: 1;
        }
        .task-row h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }
        .task-row p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Tech tag cloud */
        .tech-tag-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: 0.25rem;
        }
        .tech-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-main);
          border: 1px solid var(--border-subtle);
          padding: 0.45rem 0.8rem;
          border-radius: 999px;
          font-size: 0.76rem;
          color: var(--text-secondary);
        }
        .tech-tag strong {
          color: var(--text-main);
        }

        /* Limitations */
        .limitations-section {
          border-left: 3px solid var(--accent-orange);
          padding-left: 1.25rem;
        }
        .team-meta-row {
          display: flex;
          gap: 2rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        /* Bottom CTA — only visible on small screens where sidebar CTA hides */
        .about-bottom-cta {
          display: none;
          justify-content: center;
          margin-top: 0.5rem;
        }
        @media (max-width: 900px) {
          .about-bottom-cta { display: flex; }
        }

        .about-cta-orange-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--accent-orange);
          color: var(--white);
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        .about-cta-orange-btn:hover {
          background: var(--accent-orange-hover);
        }
      `}</style>
    </div>
  );
}

export default AboutPage;
