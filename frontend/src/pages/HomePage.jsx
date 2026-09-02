import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Play,
  Satellite,
  Cpu,
  Layers,
  Sparkles,
  Activity,
  Zap,
  ShieldCheck,
  Scan,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';
import { useAnalysis } from '../context/AnalysisContext.jsx';
import BadgeTag from '../components/ui/badge-tag';
import ScrollRevealContentA from '../components/ui/scroll-reveal-content-a';
import { Feature72 } from '../components/ui/feature-72';
import { FAQSection } from '../components/ui/faq-section-shadcnui';
import { ANALYSIS_MODES } from '../components/ModeSelector.jsx';

const SYSTEM_STAGES = [
  {
    id: 'ingest',
    num: '01',
    title: 'Multi-Sensor Satellite Ingestion',
    badge: 'STAGE 01 // INGESTION',
    icon: Satellite,
    description: 'Sub-meter GeoTIFF, Sentinel-2 & Landsat-8 raster ingestion with automated CRS reprojection, spatial bounds calculation, and band normalization.',
    techKey: 'Band Normalization',
    techVal: 'Python Rasterio · GDAL Pipeline',
    detail: 'Supports single & multi-temporal satellite rasters up to 50MB with instant geographic coordinate registration.',
    image: {
      url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
      width: 1200,
      height: 800,
      alt: 'Orbital Multi-Sensor Satellite Earth Ingestion',
    },
  },
  {
    id: 'classifier',
    num: '02',
    title: 'Deterministic Intent Classifier',
    badge: 'STAGE 02 // AGENTIC ROUTER',
    icon: Layers,
    description: 'Autonomous natural-language parser analyzes prompt semantics, verifies image count modal constraints, and formulates the multi-step execution plan.',
    techKey: 'Rule Engine',
    techVal: 'Intent Classifier · Guardrails',
    detail: 'Enforces strict modal integrity before triggering inference to ensure 100% execution compatibility.',
    image: {
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      width: 1200,
      height: 800,
      alt: 'Geospatial Grid and Planetary AI Layering',
    },
  },
  {
    id: 'routing',
    num: '03',
    title: 'Hybrid Cloud & Local VLM Routing',
    badge: 'STAGE 03 // VLM REASONING',
    icon: Cpu,
    description: 'Dispatches high-throughput multimodal spatial inference to Groq Cloud (Qwen3.8-27B Vision) with automatic seamless failover to local Ollama.',
    techKey: 'Primary Engine',
    techVal: 'Groq Qwen3.8-27B · Ollama Failover',
    detail: 'Sub-2-second visual reasoning with continuous latency telemetry and transparent provider failover.',
    image: {
      url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1200&q=80',
      width: 1200,
      height: 800,
      alt: 'High-Altitude Remote Sensing and Multimodal Inference',
    },
  },
  {
    id: 'grounding',
    num: '04',
    title: 'Visual Grounding & Spatial Telemetry',
    badge: 'STAGE 04 // SYNTHESIS',
    icon: Activity,
    description: 'Generates bounding box spatial quadrants, temporal difference overlays, and structured JSON contracts with cryptographic UUID tracing.',
    techKey: 'Telemetry Format',
    techVal: 'Standard JSON · Bounding Overlays',
    detail: 'Standardized output schema with normalized confidence metrics, execution traces, and visual grounding maps.',
    image: {
      url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1200&q=80',
      width: 1200,
      height: 800,
      alt: 'Visual Grounding Coordinate Predictions and Surface Terrain',
    },
  },
];

const ANALYSIS_FEATURES = [
  {
    id: 'QA',
    title: 'Visual Question Answering (VQA)',
    badge: '1 IMAGE // INQUIRY',
    description: 'Ask arbitrary natural language questions about visible objects, runway status, naval vessels, water bodies, or terrain features with sub-second VLM inference.',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1000&q=80',
    query: 'What is visible in this satellite image?',
  },
  {
    id: 'CAPTION',
    title: 'Comprehensive Scene Captioning',
    badge: '1 IMAGE // DESCRIPTION',
    description: 'Generates structured multi-sentence scene descriptions classifying land use, urban density, vegetation coverage, and marine activities.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
    query: 'Describe all terrain, infrastructure, and visible objects in this satellite scene.',
  },
  {
    id: 'GROUNDING',
    title: 'Visual Grounding & Localization',
    badge: '1 IMAGE + OVERLAY // SPATIAL',
    description: 'Detects and localizes specific targets such as aircraft, storage tanks, and bridges with bounding coordinates, quadrant attention maps, and structured JSON.',
    image: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1000&q=80',
    query: 'Locate and mark all runways and hangars in this airfield image.',
  },
  {
    id: 'CHANGE',
    title: 'Bi-Temporal Change Detection',
    badge: '2 IMAGES (PAIR) // DIFFERENCE',
    description: 'Compares co-registered multi-temporal satellite scenes (baseline vs comparison) to detect deforestation, flood extent, urban expansion, or disaster damage.',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1000&q=80',
    query: 'What changed between these two satellite scenes?',
  },
];

export function HomePage({ backendHealth }) {
  const { navigateTo } = useRouter();
  const { selectMissionAndPrompt } = useAnalysis();
  const [activeMode, setActiveMode] = useState(0);
  const [activePipelineStep, setActivePipelineStep] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <section className="reference-hero">
        <div className="hero-video-layer" aria-hidden="true">
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
        </div>
        <div className="hero-media-overlay" aria-hidden="true" />
        <div className="hero-grid-lines" aria-hidden="true" />

        <div className="container reference-hero-inner">
          <div className="hero-kicker">
            <span>REMOTE SENSING</span>
            <span>VISION INTELLIGENCE</span>
          </div>

          <div className="hero-main-copy">
            <div className="hero-badge-wrapper" style={{ marginBottom: '1.25rem' }}>
              <BadgeTag
                version="Beta Version (MVP)"
                text={isHealthy ? 'VLM Gateway Active' : 'API Connecting...'}
                isHealthy={isHealthy}
              />
            </div>

            <h1 className="hero-title">
              SATELLITE INTELLIGENCE THAT MOVES WITH PRECISION.
            </h1>

            <button type="button" className="hero-consultation-btn" onClick={() => navigateTo('/analysis')}>
              <span>Start Analysis</span>
              <span className="hero-consultation-icon">
                <ArrowRight size={26} />
              </span>
            </button>
          </div>

          <div className="hero-bottom-copy">
            <button type="button" className="hero-scroll-cue" onClick={() => document.querySelector('.how-it-works-editorial-section')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Scroll to workflow">
              <ArrowRight size={28} />
            </button>
            <p>
              We turn satellite imagery into structured answers, visual grounding and change insights for faster geospatial decisions.
            </p>
          </div>
        </div>
      </section>

      {/* 2. HOW THE SYSTEM WORKS — EDITORIAL INTRO & PARALLAX PIPELINE ARCHITECTURE */}
      <section className="how-it-works-editorial-section" id="how-the-system-works">
        {/* Editorial Headline Block (matches Framer reference layout) */}
        <div className="container">
          <div className="editorial-intro-grid">
            <div className="editorial-left-col">
              <div className="editorial-kicker">
                <span className="kicker-green-square" />
                <span className="kicker-text font-mono">INTRODUCTION</span>
              </div>
              <div className="editorial-meta font-mono">
                <span className="meta-tag">SYS_WORKFLOW // V1.0</span>
                <span className="meta-sub">AUTONOMOUS VLM ENGINE</span>
              </div>
            </div>

            <div className="editorial-right-col">
              <h2 className="editorial-statement">
                SatVistaar redefines the geospatial journey with a smarter, faster, and reliable approach to remote sensing intelligence. Combine multimodal Vision-Language models with optimized preprocessing to ensure real-time spatial visibility.
              </h2>
              <p className="editorial-subtext">
                From high-resolution single-scene feature identification to bi-temporal change detection and disaster damage assessment, SatVistaar translates raw multispectral pixels into deterministic geospatial intelligence in under 2 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Section Header — constrained width */}
        <div className="container" style={{ marginTop: '2.5rem', marginBottom: '0' }}>
          <div className="pipeline-section-header" style={{ marginBottom: '2rem' }}>
            <div className="pipeline-header-badge font-mono">
              <span className="pulse-dot" />
              <span>LIVE PIPELINE STREAM // 4 CONCURRENT CORE STAGES</span>
            </div>
            <h3 className="pipeline-subheading">End-to-End System Workflow</h3>
          </div>
        </div>

        {/* Sticky Scroll Reveal — full-width, seamless transition into Section 3 */}
        <ScrollRevealContentA
          contentA={SYSTEM_STAGES[0]}
          contentB={SYSTEM_STAGES[1]}
          contentC={SYSTEM_STAGES[2]}
          contentD={SYSTEM_STAGES[3]}
        />
      </section>

      {/* 3. SUPPORTED ANALYSIS TASKS (Feature72 Component) */}
      <Feature72
        category="CORE CAPABILITIES"
        heading="Supported Analysis Tasks"
        description="SatVistaar implements four verified analysis workflows strictly supported by our multimodal remote sensing pipeline."
        linkText="Open Analysis Dashboard"
        onLinkClick={() => navigateTo('/analysis')}
        features={ANALYSIS_FEATURES}
        onFeatureClick={(feature) => handleStartMission(feature.id, feature.query)}
      />

      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQSection Component) */}
      <FAQSection />

      {/* 5. IMMERSIVE THEMED CTA SECTION (Navy Blue & Flame Orange) */}
      <section className="satvistaar-themed-cta-section">
        <div className="container framer-cta-container">
          <div className="framer-cta-content">
            <h2 className="framer-cta-headline">
              Ready to accelerate your spatial intelligence with the future of autonomous remote sensing?
            </h2>
            <p className="framer-cta-subtext">
              Join defense, disaster response, and earth observation teams optimizing their mission workflow with SatVistaar.
            </p>

            <div className="framer-cta-actions">
              <button
                type="button"
                className="framer-pill-cta-btn"
                onClick={() => navigateTo('/analysis')}
              >
                <span>Launch Analysis Mission</span>
                <span className="framer-pill-arrow-circle">
                  <ArrowRight size={20} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .gov-home-root {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-bottom: 0;
          background: var(--bg-main);
        }

        /* ---------- Reference Video Hero ---------- */
        .reference-hero {
          position: relative;
          height: 100svh;
          min-height: 640px;
          max-height: 980px;
          overflow: hidden;
          background: var(--navy-blue);
          color: var(--white);
          isolation: isolate;
        }

        .hero-video-layer,
        .hero-media-overlay,
        .hero-grid-lines {
          position: absolute;
          inset: 0;
        }

        .hero-video-layer {
          z-index: 0;
        }

        .hero-bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
          filter: contrast(1.06) saturate(1.02) brightness(0.68);
          transform: scale(1.02);
          pointer-events: none;
        }

        .hero-media-overlay {
          z-index: 1;
          background:
            linear-gradient(180deg, rgba(0, 0, 102, 0.54) 0%, rgba(0, 0, 0, 0.12) 44%, rgba(0, 0, 0, 0.74) 100%),
            linear-gradient(90deg, rgba(0, 0, 0, 0.34) 0%, rgba(0, 0, 0, 0.04) 58%, rgba(255, 255, 255, 0.04) 100%);
        }

        .hero-grid-lines {
          z-index: 2;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.14) 1px, transparent 1px);
          background-size: 25vw 100%, 25vw 100%;
          opacity: 0.55;
        }

        .reference-hero-inner {
          position: relative;
          z-index: 3;
          min-height: 100%;
          display: grid;
          grid-template-columns: 0.35fr 1fr;
          grid-template-rows: 1fr auto;
          column-gap: clamp(2rem, 5vw, 5rem);
          padding-top: clamp(6.4rem, 11vh, 8rem);
          padding-bottom: clamp(1.4rem, 3vh, 2.2rem);
        }

        .hero-kicker {
          align-self: start;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          color: var(--white);
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(0.9rem, 1.3vw, 1.25rem);
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          padding-top: clamp(2rem, 9vh, 5rem);
        }

        .hero-main-copy {
          align-self: start;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: clamp(0.9rem, 2.1vh, 1.6rem);
          padding-top: clamp(1.8rem, 8vh, 4.8rem);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.55rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--success);
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.24);
          backdrop-filter: blur(10px);
        }
        .status-pill.healthy {
          background: rgba(34, 197, 94, 0.16);
          border-color: rgba(34, 197, 94, 0.28);
          color: var(--status-green-text);
        }
        .status-pill.checking {
          background: rgba(245, 158, 11, 0.16);
          border-color: rgba(245, 158, 11, 0.28);
          color: var(--warning);
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .hero-title {
          max-width: 12ch;
          font-size: clamp(3.3rem, 7vw, 8.2rem);
          font-weight: 700;
          color: var(--white);
          letter-spacing: 0;
          line-height: 0.96;
          text-transform: uppercase;
          text-wrap: balance;
        }

        .hero-consultation-btn {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          min-height: 64px;
          padding: 0.5rem 0.6rem 0.5rem 1.35rem;
          border-radius: 999px;
          background: var(--white);
          color: var(--dark-gray);
          font-size: clamp(1rem, 1.6vw, 1.35rem);
          font-weight: 600;
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.22);
        }

        .hero-consultation-icon {
          width: 50px;
          height: 50px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: var(--white);
          background: var(--flame-orange);
        }

        .hero-consultation-btn:hover .hero-consultation-icon {
          background: var(--accent-orange-hover);
          transform: translateX(2px);
        }

        .hero-bottom-copy {
          grid-column: 1 / -1;
          align-self: end;
          display: grid;
          grid-template-columns: 0.35fr 1fr;
          gap: clamp(2rem, 5vw, 5rem);
          align-items: end;
        }

        .hero-bottom-copy p {
          max-width: 760px;
          color: var(--white);
          font-family: var(--font-secondary);
          font-size: clamp(1rem, 1.8vw, 1.5rem);
          font-weight: 500;
          line-height: 1.45;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.32);
        }

        .hero-scroll-cue {
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: auto;
          color: var(--white);
          transform: rotate(90deg);
        }

        @media (max-width: 860px) {
          .reference-hero-inner,
          .hero-bottom-copy {
            grid-template-columns: 1fr;
          }

          .hero-kicker {
            padding-top: 0;
          }

          .hero-title {
            font-size: clamp(2.7rem, 12vw, 5.4rem);
          }

          .hero-consultation-btn {
            min-height: 66px;
          }

          .hero-consultation-icon {
            width: 50px;
            height: 50px;
          }
        }

        @media (max-height: 760px) and (min-width: 861px) {
          .reference-hero {
            min-height: 600px;
          }

          .reference-hero-inner {
            padding-top: 5.8rem;
            padding-bottom: 1.25rem;
          }

          .hero-kicker,
          .hero-main-copy {
            padding-top: 1.8rem;
          }

          .hero-title {
            font-size: clamp(3rem, 6vw, 6.8rem);
          }

          .hero-bottom-copy p {
            font-size: 1.05rem;
            max-width: 680px;
          }
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
          color: var(--text-main);
          letter-spacing: -0.02em;
        }
        .section-lead {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.55;
        }

        /* ---------- How the System Works — Editorial & Parallax Section ---------- */
        .how-it-works-editorial-section {
          position: relative;
          background: #ffffff;
          padding: 5rem 0 0 0;
          overflow: clip;
          border-bottom: 1px solid #e2e8f0;
        }

        .editorial-intro-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 3.5rem;
          align-items: start;
          margin-bottom: 5.5rem;
        }

        .editorial-left-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: sticky;
          top: 100px;
        }

        .editorial-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
        }

        .kicker-green-square {
          width: 13px;
          height: 13px;
          background: #84cc16; /* lime green from framer reference */
          border-radius: 2px;
          display: inline-block;
          box-shadow: 0 0 10px rgba(132, 204, 22, 0.45);
        }

        .kicker-text {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #0f172a;
          text-transform: uppercase;
        }

        .editorial-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding-left: 1.45rem;
          border-left: 2px solid #e2e8f0;
        }

        .meta-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--navy-blue);
        }

        .meta-sub {
          font-size: 0.65rem;
          color: #64748b;
          font-weight: 500;
        }

        .editorial-right-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .editorial-statement {
          font-size: clamp(2.2rem, 4.2vw, 3.8rem);
          font-weight: 700;
          color: #0f172a;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin: 0;
          font-family: var(--font-primary);
          text-wrap: balance;
        }

        .editorial-subtext {
          font-size: clamp(1.05rem, 1.35vw, 1.25rem);
          color: #475569;
          line-height: 1.65;
          max-width: 840px;
          margin: 0;
        }

        /* Parallax Pipeline Section */
        .parallax-pipeline-container {
          position: relative;
          margin-top: 1rem;
        }

        .pipeline-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pipeline-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 0, 102, 0.06);
          border: 1px solid rgba(0, 0, 102, 0.15);
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--navy-blue);
        }

        .pipeline-subheading {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .parallax-stages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .parallax-stage-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.75rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .parallax-stage-card:hover,
        .parallax-stage-card.stage-card-active {
          border-color: var(--navy-blue);
          box-shadow: 0 16px 36px rgba(0, 0, 102, 0.12);
        }

        .stage-card-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .stage-top-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stage-num {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--navy-blue);
        }

        .stage-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: #64748b;
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .stage-card-active .stage-tag {
          background: rgba(0, 0, 102, 0.1);
          color: var(--navy-blue);
        }

        .stage-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: var(--navy-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .stage-card-active .stage-icon-wrap {
          background: var(--navy-blue);
          color: #ffffff;
          border-color: var(--navy-blue);
        }

        .stage-title {
          font-size: 1.12rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .stage-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        .stage-telemetry-chip {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.45rem 0.65rem;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-top: 0.4rem;
        }

        .chip-label {
          color: #64748b;
          font-weight: 600;
        }

        .chip-value {
          color: var(--navy-blue);
          font-weight: 700;
        }

        .stage-card-backdrop-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(0, 0, 102, 0.04), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stage-card-active .stage-card-backdrop-glow {
          opacity: 1;
        }

        /* Live Inspector Bar */
        .live-arch-inspector-bar {
          background: #0b132b;
          color: #ffffff;
          border-radius: 14px;
          padding: 1.1rem 1.6rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          box-shadow: 0 10px 30px rgba(11, 19, 43, 0.15);
        }

        .inspector-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .inspector-pulse-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(255, 82, 37, 0.2);
          color: var(--flame-orange);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .inspector-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .inspector-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: #ffffff;
        }

        .inspector-detail {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .inspector-action-btn {
          background: var(--flame-orange);
          color: #ffffff;
          border: none;
          border-radius: 999px;
          padding: 0.6rem 1.2rem;
          font-size: 0.82rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(255, 82, 37, 0.35);
        }

        .inspector-action-btn:hover {
          background: var(--accent-orange-hover);
          transform: translateY(-1px);
        }

        /* Framer-style Floating Badge */
        .framer-style-watermark {
          position: absolute;
          bottom: 1.5rem;
          right: 2rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
          border-radius: 8px;
          padding: 0.4rem 0.8rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: #334155;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 2;
        }

        .framer-icon-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.8);
        }

        @media (max-width: 860px) {
          .editorial-intro-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            margin-bottom: 3.5rem;
          }
          .editorial-left-col {
            position: static;
          }
          .live-arch-inspector-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .inspector-action-btn {
            width: 100%;
            justify-content: center;
          }
          .framer-style-watermark {
            display: none;
          }
        }

        /* ---------- Mission Console ---------- */
        .console-shell {
          display: grid;
          grid-template-columns: 300px 1fr;
          background: var(--bg-card);
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
          background: var(--bg-card);
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
          background: var(--bg-card);
          border-left-color: var(--accent-orange);
          color: var(--text-main);
        }
        .console-tab-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: var(--bg-main);
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .console-tab-icon.mode-vqa { color: var(--accent-blue-text); }
        .console-tab-icon.mode-feature_identification { color: var(--accent-orange); }
        .console-tab-icon.mode-captioning { color: var(--status-green-text); }
        .console-tab-icon.mode-change_analysis { color: var(--error); }
        .console-tab-title {
          font-size: 0.85rem;
          font-weight: 600;
          flex: 1;
        }
        .console-tab-badge {
          font-size: 0.62rem;
          color: var(--text-dim);
          background: var(--bg-main);
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
          background: var(--bg-main);
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .console-detail-icon.mode-vqa { color: var(--accent-blue-text); border-color: rgba(59, 130, 246, 0.4); }
        .console-detail-icon.mode-feature_identification { color: var(--accent-orange); border-color: rgba(255, 82, 37, 0.4); }
        .console-detail-icon.mode-captioning { color: var(--status-green-text); border-color: rgba(34, 197, 94, 0.4); }
        .console-detail-icon.mode-change_analysis { color: var(--error); border-color: rgba(239, 68, 68, 0.4); }
        .console-detail-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .console-detail-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.55;
          max-width: 56ch;
        }
        .console-prompt-box {
          background: var(--bg-main);
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
          color: var(--white);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 700;
          margin-top: 0.25rem;
        }
        .console-launch-btn:hover {
          background: var(--accent-orange-hover);
        }

        /* ---------- Themed CTA Section (Navy Blue & Flame Orange) ---------- */
        .satvistaar-themed-cta-section {
          position: relative;
          background: linear-gradient(145deg, #000066 0%, #00004d 50%, #000033 100%);
          color: #ffffff;
          padding: 8.5rem 1.5rem 8.5rem 1.5rem;
          min-height: 68vh;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          overflow: hidden;
        }

        .satvistaar-themed-cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 80% 20%, rgba(255, 82, 37, 0.18), transparent 40%),
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.18), transparent 40%);
          pointer-events: none;
        }

        .framer-cta-container {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .framer-cta-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 880px;
        }

        .framer-cta-headline {
          font-size: clamp(2.4rem, 5.2vw, 4.3rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.035em;
          color: #ffffff;
          margin: 0 auto;
          text-wrap: balance;
          font-family: var(--font-primary);
        }

        .framer-cta-subtext {
          font-size: clamp(1rem, 1.4vw, 1.25rem);
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.55;
          margin: 1.8rem auto 3.2rem auto;
          max-width: 660px;
          font-family: var(--font-secondary);
        }

        .framer-cta-actions {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .framer-pill-cta-btn {
          background: #ffffff;
          color: #000066;
          border-radius: 999px;
          padding: 0.45rem 0.55rem 0.45rem 1.75rem;
          display: inline-flex;
          align-items: center;
          gap: 1.25rem;
          font-size: clamp(1rem, 1.3vw, 1.2rem);
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .framer-pill-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.45);
        }

        .framer-pill-arrow-circle {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          background: #ff5225;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .framer-pill-cta-btn:hover .framer-pill-arrow-circle {
          transform: translateX(3px);
          background: #e9461d;
        }

        @media (max-width: 768px) {
          .satvistaar-themed-cta-section {
            padding: 5.5rem 1.25rem;
            min-height: auto;
          }

          .framer-pill-cta-btn {
            padding: 0.4rem 0.5rem 0.4rem 1.35rem;
            gap: 0.85rem;
            font-size: 0.95rem;
          }

          .framer-pill-arrow-circle {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
