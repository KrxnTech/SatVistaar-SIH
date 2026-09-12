import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  CloudRain,
  Compass,
  Info
} from 'lucide-react';

export default function RiskScenarioPanel({ disasterResult }) {
  const rawScenario = disasterResult?.futureScenario || disasterResult?.riskScenario;
  const defaultRisks = [
    'Secondary levee erosion 3.2 km downstream of NH-31 Bridge Span #4.',
    'Flash waterlogging of low-lying rail embankment subway underpasses.',
    'Post-flood waterborne vector proliferation in stagnant wetland pools.'
  ];

  const scenario = {
    title: rawScenario?.title || 'Hydrological Progression & Cresting Projection (+24h to +72h)',
    progressionTrend: rawScenario?.progressionTrend || rawScenario?.narrative || (rawScenario?.modelTrend ? `Model Trend: ${rawScenario.modelTrend}` : 'EXPANDING (+12% to +18% potential expansion if upstream precipitation persists)'),
    secondaryRisks: Array.isArray(rawScenario?.secondaryRisks)
      ? rawScenario.secondaryRisks
      : (Array.isArray(rawScenario?.keyVulnerabilities)
        ? rawScenario.keyVulnerabilities
        : defaultRisks),
    topographicSlopeRisk: rawScenario?.topographicSlopeRisk || (rawScenario?.projectedAdditionalBuildings
      ? `Projected +${rawScenario.projectedFootprintPct || 14}% footprint expansion (~${rawScenario.projectedAdditionalBuildings} exposed structures)`
      : 'High vulnerability in areas below 45m MSL contour elevation.'),
    disclaimer: rawScenario?.disclaimer || 'Model-based spatial scenario projection synthesized from remote sensing elevation gradients and observed backscatter changes. SatVistaar does NOT issue official meteorological or hydrological flood forecasts. Always cross-reference with official CWC/IMD advisories.'
  };

  const secondaryRisks = Array.isArray(scenario.secondaryRisks) ? scenario.secondaryRisks : defaultRisks;

  return (
    <div className="container">
      <div className="disaster-setup-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: '#8b5cf6', color: '#ffffff', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>8</span>
            Future Risk Scenarios: "What Could Happen Next?"
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#c084fc', fontFamily: 'monospace' }}>
            +24h - +72h PROJECTION
          </span>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d8b4fe', fontSize: '0.75rem', fontWeight: 600 }}>
                <TrendingUp size={14} />
                <span>Anticipated Hazard Trajectory</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 600, marginTop: '0.35rem' }}>
                {scenario.progressionTrend}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                {scenario.topographicSlopeRisk}
              </span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5', fontSize: '0.75rem', fontWeight: 600 }}>
                <ShieldAlert size={14} />
                <span>Secondary Domino Hazards</span>
              </div>
              <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: '1.45' }}>
                {(Array.isArray(secondaryRisks) ? secondaryRisks : []).map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mandatory Gating Disclaimer Banner */}
          <div className="scenario-disclaimer-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <AlertTriangle size={15} color="#c084fc" />
              <strong style={{ color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Operational Advisory & Disclaimer:
              </strong>
            </div>
            <span>{scenario.disclaimer}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
