import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Play,
  Layers,
  Crosshair,
  MessageSquare,
  GitCompare,
  FileText,
  HelpCircle,
  LifeBuoy
} from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started Guide' },
  { id: 'task-guide', label: 'Detailed Task Guide' },
  { id: 'faq', label: 'Frequently Asked Questions' },
];

const FAQS = [
  {
    q: "What image formats and sizes are supported?",
    a: "SatVistaar accepts GeoTIFF (.tif, .tiff), PNG, JPG, and JPEG images up to 50MB per file. Multi-band optical rasters (such as Sentinel-2 or Landsat-8 GeoTIFFs) are automatically parsed by the Python Rasterio microservice to extract spatial dimensions, CRS, and visual RGB representations."
  },
  {
    q: "Why did the fallback model execute?",
    a: "If the primary cloud Vision-Language Model (Groq Cloud Qwen3.8-27B) encounters rate-limiting (HTTP 429), timeouts, or connectivity issues, the model router automatically falls back to your local self-hosted Ollama (qwen2-vl) daemon so analysis requests do not fail."
  },
  {
    q: "What does 'Approximate Visual Grounding' mean?",
    a: "Vision-Language Models localize features by analyzing cross-attention across image patches. The resulting bounding boxes represent spatial attention quadrants rather than survey-grade GIS polygon shapefiles. They are intended for quick visual confirmation of structures, water bodies, and facilities."
  },
  {
    q: "Why can the system return an 'ABSTAIN' status?",
    a: "The compatibility engine enforces strict modal constraints before invoking the VLM. For example, if a user selects Bi-Temporal Change Analysis but only uploads 1 image, or if an empty file ID is submitted, the engine abstains with an explicit explanation rather than wasting inference resources on invalid inputs."
  },
  {
    q: "Why can an image fail validation?",
    a: "An image will fail validation if it exceeds the 50MB size limit, is corrupted, or uses an unsupported MIME type. In Bi-Temporal Change mode, extreme spatial dimension mismatches between Image A and Image B will also trigger validation warnings."
  },
  {
    q: "What does the Request ID mean?",
    a: "Every analysis request is assigned a unique UUID (e.g. 543409cd-f847-...). This allows end-to-end execution tracing across the Node.js gateway, Python preprocessing microservice, and VLM provider for auditing and telemetry."
  }
];

const TASK_GUIDES = [
  {
    key: 'vqa',
    icon: MessageSquare,
    accent: 'blue',
    title: 'Visual Question Answering (VQA)',
    what: 'Answers specific questions about objects, roads, facilities, or bodies of water.',
    input: '1 Satellite Image + Question',
    example: '"Is there an airport terminal or runway visible in the frame?"',
    output: 'Concise natural language answer with relevant spatial context.',
  },
  {
    key: 'scene',
    icon: FileText,
    accent: 'green',
    title: 'Scene Description / Captioning',
    what: 'Generates a structured narrative overview of dominant land cover, built-up areas, and terrain.',
    input: '1 Satellite Image',
    example: '"Describe this satellite image in detail."',
    output: 'Structured paragraph covering land use, urban density, vegetation, and transportation corridors.',
  },
  {
    key: 'grounding',
    icon: Crosshair,
    accent: 'orange',
    title: 'Visual Grounding / Feature Identification',
    what: 'Identifies target structures and provides approximate spatial bounding box overlays.',
    input: '1 Satellite Image + Localization Query',
    example: '"Where are the major buildings and facilities located?"',
    output: 'Answer text + interactive bounding overlays rendered directly on top of the original image.',
    limitation: 'Generates approximate attention quadrants (not survey-level CAD polygons).',
  },
  {
    key: 'change',
    icon: GitCompare,
    accent: 'red',
    title: 'Bi-Temporal Change Analysis',
    what: 'Compares two co-registered satellite scenes to identify visual change between timestamps.',
    input: '2 Satellite Images (Image A Baseline + Image B Comparison)',
    example: '"What changed between these two satellite images?"',
    output: 'Qualitative change description highlighting gains, losses, and stable features alongside side-by-side visuals.',
  },
];

export function HelpPage({ backendHealth }) {
  const { navigateTo } = useRouter();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeSection, setActiveSection] = useState('getting-started');

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

  return (
    <div className="gov-help-page">
      <div className="help-shell">
        {/* Sticky sidebar nav */}
        <aside className="help-sidebar">
          <div className="sidebar-mark">
            <LifeBuoy size={18} className="sidebar-mark-icon" />
            <div>
              <div className="sidebar-mark-title">Help Center</div>
              <span className="sidebar-mark-sub font-mono">USER MANUAL</span>
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
        </aside>

        {/* Scrolling content column */}
        <main className="help-content">
          {/* Hero */}
          <div className="help-hero">
            <span className="gov-section-badge font-mono">USER MANUAL // SYSTEM PROTOCOLS</span>
            <h1 className="help-title">Help &amp; Documentation</h1>
            <p className="help-lead">
              Step-by-step guidance on uploading satellite imagery, selecting analysis missions, understanding VLM outputs, and troubleshooting.
            </p>
          </div>

          {/* 1. Getting Started */}
          <section id="getting-started" ref={registerRef('getting-started')} className="help-section">
            <div className="section-title-row">
              <BookOpen size={18} className="sec-icon orange" />
              <h2 className="section-heading">Getting Started Guide</h2>
            </div>

            <div className="steps-timeline">
              {[
                { t: 'Upload Satellite Imagery', d: 'Drag and drop or click to upload your satellite frame (.tif, .png, .jpg up to 50MB). For Bi-Temporal Change mode, upload two images (Baseline Image A and Comparison Image B).' },
                { t: 'Select Analysis Task', d: 'Choose from Visual Q&A (VQA), Scene Description, Visual Grounding, or Bi-Temporal Change according to what you need to discover.' },
                { t: 'Enter Your Query Prompt', d: 'Type a specific natural-language question or click one of the suggested preset queries (e.g. "Where are the major buildings?").' },
                {
                  t: 'Run Analysis', jsx: (
                    <>Click the <strong className="t-orange">Run Analysis</strong> button. The agentic pipeline validates inputs, routes to the VLM engine, and generates structured observations in under 2 seconds.</>
                  )
                },
                { t: 'Inspect the Intelligence Dossier', d: 'Review the formatted answers, bounding box overlays on the original image, temporal side-by-side comparators, and execution telemetry.' },
              ].map((step, idx, arr) => (
                <div className="timeline-row" key={step.t}>
                  <div className="timeline-rail">
                    <span className="timeline-dot font-mono">{idx + 1}</span>
                    {idx < arr.length - 1 && <span className="timeline-line" />}
                  </div>
                  <div className="timeline-body">
                    <h4>{step.t}</h4>
                    <p>{step.jsx || step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Task-by-task guide — alternating rows */}
          <section id="task-guide" ref={registerRef('task-guide')} className="help-section">
            <div className="section-title-row">
              <Layers size={18} className="sec-icon blue" />
              <h2 className="section-heading">Detailed Task Guide</h2>
            </div>

            <div className="task-guides-list">
              {TASK_GUIDES.map((task, idx) => {
                const Icon = task.icon;
                const reversed = idx % 2 === 1;
                return (
                  <div
                    key={task.key}
                    className={`task-guide-row accent-${task.accent} ${reversed ? 'is-reversed' : ''}`}
                  >
                    <div className="task-guide-icon-col">
                      <div className={`task-icon-badge accent-${task.accent}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <div className="task-guide-copy">
                      <h3>{task.title}</h3>
                      <p className="task-what">{task.what}</p>
                      <dl className="task-meta-list">
                        <div className="task-meta-row">
                          <dt>Input required</dt>
                          <dd>{task.input}</dd>
                        </div>
                        <div className="task-meta-row">
                          <dt>Example query</dt>
                          <dd>{task.example}</dd>
                        </div>
                        <div className="task-meta-row">
                          <dt>Expected output</dt>
                          <dd>{task.output}</dd>
                        </div>
                        {task.limitation && (
                          <div className="task-meta-row">
                            <dt>Limitations</dt>
                            <dd>{task.limitation}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. FAQ */}
          <section id="faq" ref={registerRef('faq')} className="help-section">
            <div className="section-title-row">
              <HelpCircle size={18} className="sec-icon orange" />
              <h2 className="section-heading">Frequently Asked Questions</h2>
            </div>

            <div className="faq-accordion-list">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="faq-accordion-item">
                    <button
                      type="button"
                      className="faq-toggle-btn"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {isOpen && (
                      <div className="faq-drawer-content">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      <style>{`
        .gov-help-page {
          background: var(--bg-main);
          min-height: 100vh;
        }

        .help-shell {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 3rem;
          max-width: 1240px;
          margin: 0 auto;
          padding: 3rem 2rem 5rem;
          align-items: start;
        }

        /* ---------- Sidebar ---------- */
        .help-sidebar {
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
          .help-shell {
            grid-template-columns: 1fr;
            padding: 1.75rem 1.25rem 3.5rem;
          }
          .help-sidebar {
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
        .help-hero {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          padding-bottom: 2.5rem;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
          max-width: 640px;
        }
        .gov-section-badge {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--accent-orange);
        }
        .help-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          line-height: 1.05;
        }
        .help-lead {
          font-size: 1.02rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* ---------- Sections ---------- */
        .help-content {
          display: flex;
          flex-direction: column;
          gap: 2.75rem;
          min-width: 0;
        }
        .help-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          scroll-margin-top: 5.5rem;
        }
        .section-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .sec-icon.orange { color: var(--accent-orange); }
        .sec-icon.blue { color: var(--accent-blue-text); }
        .section-heading {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .t-orange { color: var(--accent-orange-text); }

        /* Steps timeline */
        .steps-timeline {
          display: flex;
          flex-direction: column;
          max-width: 640px;
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
          border-radius: var(--radius-sm);
          background: rgba(255, 82, 37, 0.12);
          border: 1px solid rgba(255, 82, 37, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--accent-orange);
          flex-shrink: 0;
        }
        .timeline-line {
          flex: 1;
          width: 1px;
          background: var(--border-subtle);
          min-height: 1.1rem;
        }
        .timeline-body {
          padding-bottom: 1.4rem;
        }
        .timeline-body h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }
        .timeline-body p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        /* Task guides — alternating rows */
        .task-guides-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .task-guide-row {
          display: grid;
          grid-template-columns: 4rem 1fr;
          gap: 1.5rem;
          padding: 1.25rem 0;
          border-top: 1px solid var(--border-subtle);
        }
        .task-guide-row.is-reversed {
          grid-template-columns: 1fr 4rem;
        }
        .task-guide-row.is-reversed .task-guide-icon-col {
          order: 2;
        }
        .task-guide-row.is-reversed .task-guide-copy {
          order: 1;
          text-align: right;
        }
        .task-guide-row.is-reversed .task-meta-row {
          grid-template-columns: 1fr 140px;
          text-align: right;
        }
        .task-guide-row.is-reversed .task-meta-row dt {
          order: 2;
        }
        .task-guide-row.is-reversed .task-meta-row dd {
          order: 1;
        }
        .task-guide-icon-col {
          display: flex;
          justify-content: center;
          padding-top: 0.15rem;
        }
        .task-icon-badge {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-main);
          border: 1px solid var(--border-medium);
        }
        .task-icon-badge.accent-blue { color: var(--accent-blue-text); }
        .task-icon-badge.accent-green { color: var(--status-green-text); }
        .task-icon-badge.accent-orange { color: var(--accent-orange); }
        .task-icon-badge.accent-red { color: var(--status-red-text); }

        .task-guide-copy h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.35rem;
        }
        .task-what {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: 0.75rem;
        }
        .task-meta-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .task-meta-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 0.75rem;
          font-size: 0.8rem;
        }
        .task-meta-row dt {
          color: var(--text-muted);
          font-weight: 600;
        }
        .task-meta-row dd {
          color: var(--text-secondary);
          line-height: 1.45;
        }

        @media (max-width: 640px) {
          .task-guide-row,
          .task-guide-row.is-reversed {
            grid-template-columns: 3rem 1fr;
          }
          .task-guide-row.is-reversed .task-guide-icon-col { order: 0; }
          .task-guide-row.is-reversed .task-guide-copy {
            order: 0;
            text-align: left;
          }
          .task-guide-row.is-reversed .task-meta-row {
            grid-template-columns: 110px 1fr;
            text-align: left;
          }
          .task-guide-row.is-reversed .task-meta-row dt { order: 0; }
          .task-guide-row.is-reversed .task-meta-row dd { order: 0; }
          .task-meta-row { grid-template-columns: 110px 1fr; }
        }

        /* FAQ Accordion */
        .faq-accordion-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          max-width: 720px;
        }
        .faq-accordion-item {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--bg-main);
        }
        .faq-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.15rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-main);
          text-align: left;
          background: var(--bg-main);
        }
        .faq-toggle-btn:hover {
          background: var(--bg-card);
          color: var(--accent-orange-text);
        }
        .faq-drawer-content {
          padding: 0 1.15rem 1.15rem 1.15rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.75rem;
          background: var(--bg-card);
        }

        /* Bottom CTA — only visible where sidebar CTA hides */
        .help-bottom-cta {
          display: none;
          justify-content: center;
          margin-top: 0.5rem;
        }
        @media (max-width: 900px) {
          .help-bottom-cta { display: flex; }
        }

        .help-cta-orange-btn {
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
        .help-cta-orange-btn:hover {
          background: var(--accent-orange-hover);
        }
      `}</style>
    </div>
  );
}

export default HelpPage;
