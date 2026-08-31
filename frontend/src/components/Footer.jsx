import React from 'react';
import { Satellite, Shield, Cpu, Activity } from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';

export function Footer({ backendHealth }) {
  const { navigateTo } = useRouter();
  const isHealthy = backendHealth?.ok && (backendHealth.status === 'healthy' || backendHealth.status === 'ok');

  return (
    <footer className="gov-footer-root">
      <div className="container footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <div className="footer-brand" onClick={() => navigateTo('/')}>
              <div className="footer-logo-badge">
                <Satellite size={18} />
              </div>
              <div className="footer-title-group">
                <span className="footer-title">SatVistaar</span>
              </div>
            </div>
            <p className="footer-desc">
              Autonomous Vision-Language Platform for Multimodal Remote-Sensing Intelligence. Query optical and multispectral satellite imagery using natural language.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform Pages</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-item" onClick={() => navigateTo('/')}>
                  Home
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-item" onClick={() => navigateTo('/analysis')}>
                  Analysis Dashboard
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-item" onClick={() => navigateTo('/about')}>
                  About & Architecture
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-item" onClick={() => navigateTo('/help')}>
                  Help & Documentation
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Missions */}
          <div className="footer-col">
            <h4 className="footer-heading">Supported Missions</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-item" onClick={() => navigateTo('/analysis')}>
                  Visual Question Answering (VQA)
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-item" onClick={() => navigateTo('/analysis')}>
                  Scene Description / Captioning
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-item" onClick={() => navigateTo('/analysis')}>
                  Visual Grounding & Overlays
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-item" onClick={() => navigateTo('/analysis')}>
                  Bi-Temporal Change Analysis
                </button>
              </li>
            </ul>
          </div>

          {/* System Telemetry */}
          <div className="footer-col">
            <h4 className="footer-heading">System Telemetry</h4>
            <div className="footer-telemetry-box">
              <div className="telemetry-item">
                <span className="t-lbl">API Gateway:</span>
                <span className={`t-val font-mono ${isHealthy ? 't-green' : 't-amber'}`}>
                  {isHealthy ? 'OPERATIONAL' : 'CONNECTING'}
                </span>
              </div>
              <div className="telemetry-item">
                <span className="t-lbl">Primary VLM:</span>
                <span className="t-val t-blue font-mono">Qwen3.8-27B (Groq)</span>
              </div>
              <div className="telemetry-item">
                <span className="t-lbl">Fallback VLM:</span>
                <span className="t-val t-blue font-mono">Ollama Local</span>
              </div>
              <div className="telemetry-item">
                <span className="t-lbl">Preprocessing:</span>
                <span className="t-val t-blue font-mono">Python / Rasterio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-left">
            <span>© {new Date().getFullYear()} SatVistaar Geospatial Intelligence Platform</span>
            <span className="dot-sep">•</span>
            <span>Government Space Intelligence Control Center</span>
          </div>
        </div>
      </div>

      <style>{`
        .gov-footer-root {
          background: #06070a;
          color: #8492a6;
          border-top: 1px solid var(--border-subtle);
          padding: 3rem 0 1.5rem 0;
          margin-top: auto;
        }
        .footer-container {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.2fr 1.3fr;
          gap: 2rem;
        }
        @media (max-width: 960px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 580px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          cursor: pointer;
          width: fit-content;
        }
        .footer-logo-badge {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: #141722;
          border: 1px solid #2a3044;
          color: var(--accent-orange);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-title-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .footer-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #f8fafc;
        }
        .footer-tag {
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          background: rgba(249, 115, 22, 0.1);
          color: var(--accent-orange-text);
          border: 1px solid rgba(249, 115, 22, 0.3);
        }
        .footer-desc {
          font-size: 0.8rem;
          color: #8492a6;
          line-height: 1.5;
          max-width: 320px;
        }
        .footer-sih-tag {
          font-size: 0.7rem;
          color: #cbd5e1;
          background: #12151f;
          padding: 0.25rem 0.55rem;
          border-radius: 4px;
          border: 1px solid var(--border-subtle);
          width: fit-content;
        }
        .footer-sih-tag strong {
          color: var(--accent-orange);
        }
        .footer-heading {
          font-size: 0.8rem;
          font-weight: 700;
          color: #f8fafc;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.4rem;
          width: fit-content;
        }
        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .footer-link-item {
          font-size: 0.825rem;
          color: #8492a6;
          text-align: left;
          padding: 0.15rem 0;
          min-height: auto;
          transition: color 0.15s ease;
        }
        .footer-link-item:hover {
          color: var(--accent-orange-text);
        }
        .footer-telemetry-box {
          background: #12151f;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .telemetry-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.725rem;
        }
        .t-lbl {
          color: #525f76;
        }
        .t-val {
          font-weight: 600;
          font-size: 0.7rem;
        }
        .t-green { color: var(--status-green-text); }
        .t-amber { color: #fbbf24; }
        .t-blue { color: var(--accent-blue-text); }

        .footer-bottom-bar {
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.725rem;
          color: #525f76;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .footer-bottom-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .dot-sep { color: var(--border-subtle); }
      `}</style>
    </footer>
  );
}

export default Footer;
