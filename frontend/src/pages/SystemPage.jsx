import React, { useState } from 'react';
import {
  Cpu,
  Server,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  Terminal,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Play
} from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import CyberCard from '../components/common/CyberCard.jsx';
import CyberButton from '../components/common/CyberButton.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';

export function SystemPage({ backendHealth }) {
  const { navigateTo } = useRouter();
  const [openFaq, setOpenFaq] = useState(null);

  const isHealthy = backendHealth?.ok && (backendHealth.status === 'healthy' || backendHealth.status === 'ok');

  const faqs = [
    {
      q: "What is SatVistaar's core mission and problem statement?",
      a: "SatVistaar was engineered for Smart India Hackathon (SIH26167) to solve the high technical barrier in interpreting remote-sensing data. Rather than requiring analysts to configure complex GIS software and manual band math, SatVistaar lets users ask direct natural language questions over satellite imagery."
    },
    {
      q: "How does the VLM Model Router and Fallback mechanism work?",
      a: "Analysis requests are first verified for modality and image count. Valid requests are dispatched to high-speed cloud Vision-Language Models (Groq Cloud Qwen3.8-27B Vision). If the cloud provider experiences rate limits (429) or timeouts, requests automatically fall back to local self-hosted Ollama (qwen2-vl) instances."
    },
    {
      q: "What satellite imagery formats and sensors are supported?",
      a: "SatVistaar supports GeoTIFF (.tif, .tiff), PNG, and JPEG files up to 50MB. It handles imagery from Sentinel-2 MSI, Landsat-8/9 OLI, and ISRO Earth Observation platforms with automatic coordinate reference system (CRS) and dimension extraction via Python Rasterio."
    },
    {
      q: "Does the current MVP perform calibrated pixel-level NDVI rasters?",
      a: "The MVP focus is on qualitative Vision-Language reasoning, natural language question answering, visual feature grounding, and bi-temporal change descriptions. Calibrated physical spectral calculations (NDVI, NDWI rasters) and pixel-level semantic segmentation are designated as planned future roadmap items."
    },
    {
      q: "How is user authentication and session security maintained?",
      a: "Authentication uses salted password hashing via Bcrypt (10 rounds). User sessions issue signed JSON Web Tokens (JWT) stored exclusively in secure, HTTP-only cookies with SameSite protection to prevent XSS and credential leakage."
    }
  ];

  return (
    <div className="system-page-root">
      <PageHeader
        title="System Architecture & Documentation"
        subtitle="End-to-end technical specifications, VLM inference routing, preprocessing microservice, and operational telemetry."
        tag="SAT_SPECS"
        breadcrumbs="SYSTEM_DOCS"
        accentColor="magenta"
        badge={
          <StatusBadge
            label={isHealthy ? 'SYSTEM OPERATIONAL' : 'SYSTEM DIAGNOSTICS'}
            variant={isHealthy ? 'magenta' : 'warning'}
          />
        }
        actions={
          <CyberButton
            variant="primary"
            size="sm"
            icon={Play}
            cutCorner
            onClick={() => navigateTo('/analysis')}
          >
            Launch Analysis
          </CyberButton>
        }
      />

      <main className="container system-container">
        {/* 1. LIVE TELEMETRY STATUS CARDS */}
        <section className="system-section">
          <div className="section-title-row">
            <Activity size={18} className="sec-icon magenta" />
            <h2 className="system-sec-title">Live System Diagnostics</h2>
          </div>

          <div className="diagnostics-grid">
            {/* Express API Gateway */}
            <div className="diag-card glass-panel">
              <div className="diag-header">
                <Server size={18} className="diag-icon cyan" />
                <span className="diag-service-name">API Gateway</span>
                <StatusBadge
                  label={isHealthy ? 'LIVE' : 'UNREACHABLE'}
                  variant={isHealthy ? 'success' : 'danger'}
                  dot
                />
              </div>
              <div className="diag-body font-mono">
                <div className="diag-row">
                  <span>FRAMEWORK:</span>
                  <strong>Express 5.2.1 (ESM)</strong>
                </div>
                <div className="diag-row">
                  <span>PORT:</span>
                  <strong>5000 /api/v1</strong>
                </div>
                <div className="diag-row">
                  <span>SECURITY:</span>
                  <strong>JWT / HttpOnly Cookies</strong>
                </div>
              </div>
            </div>

            {/* Preprocessing Microservice */}
            <div className="diag-card glass-panel">
              <div className="diag-header">
                <Layers size={18} className="diag-icon green" />
                <span className="diag-service-name">Preprocessing Service</span>
                <StatusBadge
                  label={backendHealth?.data?.services?.preprocessing === 'ok' ? 'HEALTHY' : 'STANDBY'}
                  variant={backendHealth?.data?.services?.preprocessing === 'ok' ? 'success' : 'warning'}
                  dot
                />
              </div>
              <div className="diag-body font-mono">
                <div className="diag-row">
                  <span>ENGINE:</span>
                  <strong>Python Flask + Rasterio</strong>
                </div>
                <div className="diag-row">
                  <span>PORT:</span>
                  <strong>5001 /metadata</strong>
                </div>
                <div className="diag-row">
                  <span>EXTENSIONS:</span>
                  <strong>GeoTIFF, TIFF, PNG, JPG</strong>
                </div>
              </div>
            </div>

            {/* VLM Inference Engine */}
            <div className="diag-card glass-panel">
              <div className="diag-header">
                <Cpu size={18} className="diag-icon magenta" />
                <span className="diag-service-name">VLM Engines</span>
                <StatusBadge label="READY" variant="magenta" dot />
              </div>
              <div className="diag-body font-mono">
                <div className="diag-row">
                  <span>PRIMARY:</span>
                  <strong>Groq Cloud Qwen3.8-27B</strong>
                </div>
                <div className="diag-row">
                  <span>FALLBACK:</span>
                  <strong>Ollama Local qwen2-vl</strong>
                </div>
                <div className="diag-row">
                  <span>TIMEOUT:</span>
                  <strong>30,000 ms</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MULTI-TIER ARCHITECTURE SPECIFICATION */}
        <section className="system-section">
          <div className="section-title-row">
            <Cpu size={18} className="sec-icon cyan" />
            <h2 className="system-sec-title">Multi-Tier Agentic Architecture</h2>
          </div>

          <div className="arch-layers-grid">
            {/* Layer 1 */}
            <CyberCard
              title="1. Frontend UI & Visual Layer"
              badge="REACT 19"
              badgeVariant="tertiary"
              className="arch-layer-card"
            >
              <p className="layer-desc">
                Built with React 19 and Vite 8, incorporating a responsive Cyberpunk HUD design system. Includes dual-timeline acquisition pickers, bounding box overlay visualizers, and collapsible execution trace telemetry inspectors.
              </p>
              <div className="layer-tech-tags font-mono">
                <span>React 19</span>
                <span>Lucide Icons</span>
                <span>Cyberpunk CSS</span>
                <span>Context API</span>
              </div>
            </CyberCard>

            {/* Layer 2 */}
            <CyberCard
              title="2. Backend API Gateway & Security"
              badge="EXPRESS 5"
              badgeVariant="primary"
              className="arch-layer-card"
            >
              <p className="layer-desc">
                High-throughput ES-module Node.js gateway managing multipart image uploads (up to 50MB buffer), rate-limiting middleware, request validation, Bcrypt 10-round salted password hashing, and signed JWT session hydration.
              </p>
              <div className="layer-tech-tags font-mono">
                <span>Node.js v20+</span>
                <span>Express 5.2</span>
                <span>Multer</span>
                <span>HttpOnly JWT</span>
              </div>
            </CyberCard>

            {/* Layer 3 */}
            <CyberCard
              title="3. Geospatial Preprocessing Microservice"
              badge="PYTHON / FLASK"
              badgeVariant="warning"
              className="arch-layer-card"
            >
              <p className="layer-desc">
                Dedicated Python microservice utilizing Rasterio, Pillow, and NumPy to extract spatial bounds, coordinate reference systems (CRS), affine transforms, and multi-band metadata from satellite rasters.
              </p>
              <div className="layer-tech-tags font-mono">
                <span>Python 3.10+</span>
                <span>Flask 3.0</span>
                <span>Rasterio</span>
                <span>NumPy</span>
              </div>
            </CyberCard>

            {/* Layer 4 */}
            <CyberCard
              title="4. Autonomous AI & VLM Routing"
              badge="GROQ / OLLAMA"
              badgeVariant="secondary"
              className="arch-layer-card"
            >
              <p className="layer-desc">
                Autonomous intent classifier and compatibility engine that inspects prompt patterns and image counts, executing inference on high-speed cloud VLM (Qwen3.8-27B) with deterministic fallback to local Ollama.
              </p>
              <div className="layer-tech-tags font-mono">
                <span>Qwen3.8-27B Vision</span>
                <span>Groq Cloud</span>
                <span>Ollama Fallback</span>
                <span>Trace Telemetry</span>
              </div>
            </CyberCard>
          </div>
        </section>

        {/* 3. CORE ANALYSIS MISSIONS BREAKDOWN */}
        <section className="system-section">
          <div className="section-title-row">
            <Layers size={18} className="sec-icon green" />
            <h2 className="system-sec-title">Analysis Missions Specification</h2>
          </div>

          <div className="missions-spec-grid">
            <div className="mission-spec-card glass-panel">
              <div className="spec-header">
                <span className="spec-badge">MISSION 01</span>
                <h4>Visual Question Answering (VQA)</h4>
              </div>
              <p>
                Open-ended conversational questions regarding visible objects, facilities, roads, water bodies, or terrain features. Requires 1 satellite image.
              </p>
              <div className="spec-meta-row font-mono">
                <span>INPUT: 1 Frame</span>
                <span>OUTPUT: Markdown Text</span>
              </div>
            </div>

            <div className="mission-spec-card glass-panel">
              <div className="spec-header">
                <span className="spec-badge">MISSION 02</span>
                <h4>Scene Description & Captioning</h4>
              </div>
              <p>
                Generates a structured, comprehensive spatial overview covering dominant land cover, built-up infrastructure, transportation corridors, and vegetation.
              </p>
              <div className="spec-meta-row font-mono">
                <span>INPUT: 1 Frame</span>
                <span>OUTPUT: Structured Overview</span>
              </div>
            </div>

            <div className="mission-spec-card glass-panel">
              <div className="spec-header">
                <span className="spec-badge">MISSION 03</span>
                <h4>Visual Grounding / Feature Identification</h4>
              </div>
              <p>
                Locates requested features (buildings, runways, reservoirs, parcels) and provides approximate relative spatial quadrant coordinates for bounding overlays.
              </p>
              <div className="spec-meta-row font-mono">
                <span>INPUT: 1 Frame</span>
                <span>OUTPUT: Coordinates & Box Overlay</span>
              </div>
            </div>

            <div className="mission-spec-card glass-panel">
              <div className="spec-header">
                <span className="spec-badge">MISSION 04</span>
                <h4>Bi-Temporal Change Analysis</h4>
              </div>
              <p>
                Compares historical baseline (Image A) with new comparison (Image B) imagery to highlight qualitative differences such as urban expansion or tree loss.
              </p>
              <div className="spec-meta-row font-mono">
                <span>INPUT: 2 Frames</span>
                <span>OUTPUT: Temporal Comparison</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FREQUENTLY ASKED QUESTIONS */}
        <section className="system-section">
          <div className="section-title-row">
            <HelpCircle size={18} className="sec-icon cyan" />
            <h2 className="system-sec-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div key={idx} className="faq-item glass-panel">
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  {isOpen && (
                    <div className="faq-answer-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <style>{`
        .system-page-root {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 4rem;
        }
        .system-container {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }
        .system-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .section-title-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .sec-icon.magenta { color: var(--secondary); }
        .sec-icon.cyan { color: var(--tertiary); }
        .sec-icon.green { color: var(--primary); }
        .system-sec-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
        }

        /* 1. Diagnostics Grid */
        .diagnostics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .diag-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .diag-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .diag-icon.cyan { color: var(--tertiary); }
        .diag-icon.green { color: var(--primary); }
        .diag-icon.magenta { color: var(--secondary); }
        .diag-service-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-bright);
          flex: 1;
        }
        .diag-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.725rem;
        }
        .diag-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .diag-row span { color: var(--text-dim); }
        .diag-row strong { color: var(--text-main); }

        /* 2. Architecture Grid */
        .arch-layers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .layer-desc {
          font-size: 0.825rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 1rem;
          flex: 1;
        }
        .layer-tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .layer-tech-tags span {
          font-size: 0.675rem;
          background: rgba(10, 10, 15, 0.7);
          border: 1px solid var(--border-subtle);
          color: var(--tertiary);
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
        }

        /* 3. Missions Spec */
        .missions-spec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }
        .mission-spec-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .spec-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .spec-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--primary);
        }
        .spec-header h4 {
          font-size: 0.95rem;
          color: #ffffff;
        }
        .mission-spec-card p {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.45;
          flex: 1;
        }
        .spec-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.675rem;
          color: var(--text-dim);
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        /* 4. FAQ */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .faq-item {
          overflow: hidden;
        }
        .faq-question-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-bright);
          text-align: left;
          min-height: 48px;
        }
        .faq-question-btn:hover {
          color: var(--tertiary);
          background: rgba(255, 255, 255, 0.02);
        }
        .faq-answer-body {
          padding: 0 1.25rem 1.25rem 1.25rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.6;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.85rem;
        }
      `}</style>
    </div>
  );
}

export default SystemPage;
