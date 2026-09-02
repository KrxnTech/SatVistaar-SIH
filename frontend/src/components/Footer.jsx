import React from 'react';
import { Activity, ArrowRight, Code2, Globe2, Satellite, Send, Shield } from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', path: '/' },
      { label: 'Analysis Dashboard', path: '/analysis' },
      { label: 'About & Architecture', path: '/about' },
      { label: 'Help & Documentation', path: '/help' },
    ],
  },
  {
    title: 'Missions',
    links: [
      { label: 'Visual Question Answering', path: '/analysis' },
      { label: 'Scene Description', path: '/analysis' },
      { label: 'Visual Grounding', path: '/analysis' },
      { label: 'Change Analysis', path: '/analysis' },
    ],
  },
  {
    title: 'System',
    links: [
      { label: 'API Gateway', path: '/analysis' },
      { label: 'Model Routing', path: '/about' },
      { label: 'Preprocessing', path: '/about' },
      { label: 'Execution Trace', path: '/help' },
    ],
  },
];

export function Footer({ backendHealth }) {
  const { navigateTo } = useRouter();
  const isHealthy = backendHealth?.ok && (backendHealth.status === 'healthy' || backendHealth.status === 'ok');
  const year = new Date().getFullYear();

  return (
    <footer className="sat-footer-root">
      <div className="footer-stroke-wrap" aria-hidden="true">
        <h2 className="footer-stroke-title">SatVistaar</h2>
      </div>

      <div className="footer-panel">
        <div className="footer-panel-glass" aria-hidden="true" />
        <div className="container footer-panel-inner">
          <div className="footer-brand-block">
            <button type="button" className="footer-brand-lockup" onClick={() => navigateTo('/')}>
              <span className="footer-logo-mark">
                <Satellite size={28} />
              </span>
              <span className="footer-brand-copy">
                <span className="footer-brand-title">
                  Sat<span>Vistaar</span>
                </span>
                <span className="footer-brand-subtitle">Seeing Earth. Solving Tomorrow.</span>
              </span>
            </button>

            <p className="footer-statement">
              Actionable insights, smarter decisions and sustainable impact from multimodal remote-sensing intelligence.
            </p>

            <div className="footer-social-row" aria-label="Social links">
              <a className="footer-social-link" href="#" aria-label="X">
                <Globe2 size={17} />
              </a>
              <a className="footer-social-link" href="#" aria-label="LinkedIn">
                <Activity size={17} />
              </a>
              <a className="footer-social-link" href="#" aria-label="GitHub">
                <Code2 size={17} />
              </a>
              <a className="footer-social-link" href="mailto:hello@satvistaar.ai" aria-label="Email">
                <Send size={17} />
              </a>
            </div>
          </div>

          <div className="footer-link-grid">
            {footerSections.map((section) => (
              <nav key={section.title} className="footer-link-section" aria-label={section.title}>
                <h3>{section.title}</h3>
                <ul>
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.label}`}>
                      <button type="button" onClick={() => navigateTo(link.path)}>
                        <span>{link.label}</span>
                        <ArrowRight size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="container footer-bottom">
          <div className="footer-status">
            <span className={`footer-status-dot ${isHealthy ? 'healthy' : 'checking'}`} />
            <span className="font-mono">{isHealthy ? 'API Gateway Operational' : 'API Gateway Connecting'}</span>
          </div>

          <div className="footer-mini-flow">
            <span><Shield size={15} /> Observe</span>
            <ArrowRight size={13} />
            <span><Activity size={15} /> Analyze</span>
            <ArrowRight size={13} />
            <span><Satellite size={15} /> Act</span>
          </div>

          <p>© {year} SatVistaar MVP Design System v1.0</p>
        </div>
      </div>

      <style>{`
        .sat-footer-root {
          width: 100%;
          background: var(--flame-orange);
          position: relative;
          overflow: hidden;
          margin-top: 0;
          font-family: var(--font-primary);
        }

        .footer-stroke-wrap {
          position: relative;
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4.5rem 1.5rem 3.5rem;
          background: var(--flame-orange);
        }

        .footer-stroke-title {
          color: #ffffff;
          font-family: var(--font-primary);
          font-size: clamp(3.5rem, 12vw, 10.5rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.03em;
          opacity: 0.98;
          user-select: none;
          white-space: nowrap;
          text-align: center;
          margin: 0;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        }

        .footer-panel {
          position: relative;
          z-index: 1;
          background: var(--navy-blue);
          color: var(--white);
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }

        .footer-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 76% 12%, rgba(255, 82, 37, 0.22), transparent 28%),
            radial-gradient(circle at 18% 78%, rgba(59, 130, 246, 0.22), transparent 30%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 42%);
          pointer-events: none;
        }

        .footer-panel-glass {
          position: absolute;
          inset: 0;
          opacity: 0.26;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.22) 0,
              rgba(255, 255, 255, 0.22) 1px,
              transparent 1px,
              transparent 18px
            ),
            repeating-linear-gradient(
              115deg,
              rgba(255, 82, 37, 0.2) 0,
              rgba(255, 82, 37, 0.2) 1px,
              transparent 1px,
              transparent 26px
            );
          filter: blur(0.2px);
          pointer-events: none;
        }

        .footer-panel-inner {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: minmax(260px, 0.85fr) minmax(0, 1.35fr);
          gap: clamp(2rem, 6vw, 5rem);
          padding-top: clamp(4rem, 6vw, 5.5rem);
          padding-bottom: 3.5rem;
        }

        .footer-brand-block {
          display: flex;
          flex-direction: column;
          gap: 1.55rem;
          max-width: 410px;
        }

        .footer-brand-lockup {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          width: fit-content;
          min-height: auto;
          color: var(--white);
          text-align: left;
        }

        .footer-logo-mark {
          width: 54px;
          height: 54px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: var(--radius-md);
          color: var(--flame-orange);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
        }

        .footer-brand-copy {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .footer-brand-title {
          color: var(--white);
          font-size: clamp(1.65rem, 3vw, 2rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0;
        }

        .footer-brand-title span {
          color: var(--flame-orange);
        }

        .footer-brand-subtitle {
          color: rgba(255, 255, 255, 0.78);
          font-family: var(--font-secondary);
          font-size: 0.85rem;
        }

        .footer-statement {
          color: rgba(255, 255, 255, 0.82);
          font-size: 1rem;
          line-height: 1.65;
          max-width: 34ch;
        }

        .footer-social-row {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin-top: auto;
        }

        .footer-social-link {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--white);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }

        .footer-social-link:hover {
          color: var(--flame-orange);
          background: rgba(255, 255, 255, 0.18);
          transform: translateY(-1px);
        }

        .footer-link-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(150px, 1fr));
          gap: clamp(1.5rem, 4vw, 3rem);
        }

        .footer-link-section {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .footer-link-section h3 {
          color: var(--white);
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0;
        }

        .footer-link-section ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-link-section button {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          min-height: auto;
          padding: 0;
          color: rgba(255, 255, 255, 0.68);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: left;
        }

        .footer-link-section button svg {
          opacity: 0;
          transform: translateX(-3px);
          transition: opacity 0.15s ease, transform 0.15s ease;
        }

        .footer-link-section button:hover {
          color: var(--white);
        }

        .footer-link-section button:hover svg {
          opacity: 1;
          transform: translateX(0);
          color: var(--flame-orange);
        }

        .footer-bottom {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 1rem;
          padding-top: 1.15rem;
          padding-bottom: 1.15rem;
          border-top: 1px solid rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.76);
          font-size: 0.78rem;
        }

        .footer-status {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          min-width: 0;
        }

        .footer-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          flex: 0 0 auto;
          background: var(--warning);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.6);
        }

        .footer-status-dot.healthy {
          background: var(--success);
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
        }

        .footer-mini-flow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: var(--white);
          font-size: 0.78rem;
          white-space: nowrap;
        }

        .footer-mini-flow span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .footer-mini-flow > svg {
          color: var(--flame-orange);
        }

        .footer-bottom p {
          justify-self: end;
          margin: 0;
        }

        @media (max-width: 900px) {
          .footer-panel-inner {
            grid-template-columns: 1fr;
          }

          .footer-link-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .footer-bottom {
            grid-template-columns: 1fr;
            justify-items: start;
          }

          .footer-bottom p {
            justify-self: start;
          }
        }

        @media (max-width: 640px) {
          .footer-stroke-wrap {
            min-height: 108px;
            padding-top: 3rem;
          }

          .footer-link-grid {
            grid-template-columns: 1fr;
          }

          .footer-mini-flow {
            flex-wrap: wrap;
            justify-content: flex-start;
            white-space: normal;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
