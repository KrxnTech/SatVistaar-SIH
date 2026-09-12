import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Compass,
  ArrowRight,
  ShieldAlert,
  CheckCircle
} from 'lucide-react';

export default function PriorityZonesPanel({ disasterResult }) {
  const defaultZones = [
    {
      id: 'P1',
      rank: 1,
      name: 'Priority 1: Urgent Life Safety & Access Breach',
      color: '#ef4444',
      cssClass: 'priority-p1',
      target: 'Barpeta Civil Hospital Corridor & NH-31 Embankment Breach',
      threat: 'Imminent isolation of medical facility; road bridge cut. High water depth (> 1.8m).',
      recommendations: [
        'Deploy boat-based logistics and amphibious triage to northern hospital gate.',
        'Stage sandbag and geotextile containment near scoured bridge abutment.'
      ]
    },
    {
      id: 'P2',
      rank: 2,
      name: 'Priority 2: High Built-up Settlement Exposure',
      color: '#f97316',
      cssClass: 'priority-p2',
      target: 'Barpeta Town Western Periphery & Railway Colony',
      threat: 'Over 120 residential units inundated to ground level; potable water supplies compromised.',
      recommendations: [
        'Establish relief supply drop points at elevated railway berm.',
        'Issue contamination warnings for shallow tube wells.'
      ]
    },
    {
      id: 'P3',
      rank: 3,
      name: 'Priority 3: Agricultural Inundation & Secondary Corridors',
      color: '#3b82f6',
      cssClass: 'priority-p3',
      target: 'South Riparian Paddy Fields & Rural Feeder Roads',
      threat: 'Extensive crop submersion; rural transport severed but life risk localized.',
      recommendations: [
        'Monitor livestock evacuation towards flood shelters on elevated mounds (chapories).'
      ]
    }
  ];

  const rawZones = disasterResult?.priorityZones;
  let pZones = defaultZones;

  if (Array.isArray(rawZones) && rawZones.length > 0) {
    pZones = rawZones.map((z, idx) => ({
      ...z,
      id: z.id || `P${idx + 1}`,
      rank: z.rank || (idx + 1),
      name: z.name || z.level || `Priority ${idx + 1}`,
      color: z.color || (idx === 0 ? '#ef4444' : idx === 1 ? '#f97316' : '#3b82f6'),
      cssClass: z.cssClass || (idx === 0 ? 'priority-p1' : idx === 1 ? 'priority-p2' : 'priority-p3'),
      target: z.target || 'Designated AOI Sector',
      threat: z.threat || z.description || 'Elevated threat dynamics detected.',
      recommendations: Array.isArray(z.recommendations)
        ? z.recommendations
        : (z.recommendedAction ? [z.recommendedAction] : ['Monitor zone and verify lifeline continuity.'])
    }));
  } else if (rawZones && typeof rawZones === 'object') {
    const entries = Object.entries(rawZones);
    if (entries.length > 0) {
      pZones = entries.map(([key, val], idx) => {
        const isP1 = key.toLowerCase().includes('1') || idx === 0;
        const isP2 = key.toLowerCase().includes('2') || idx === 1;
        const isP3 = key.toLowerCase().includes('3') || idx === 2;
        return {
          id: val?.id || key,
          rank: val?.rank || (idx + 1),
          name: val?.name || val?.level || (isP1 ? 'Priority 1: Urgent Life Safety' : isP2 ? 'Priority 2: High Settlement Exposure' : isP3 ? 'Priority 3: Moderate Impact' : 'Monitoring & Follow-up'),
          color: val?.color || (isP1 ? '#ef4444' : isP2 ? '#f97316' : isP3 ? '#eab308' : '#64748b'),
          cssClass: isP1 ? 'priority-p1' : isP2 ? 'priority-p2' : 'priority-p3',
          target: val?.target || (val?.count != null ? `${val.count} critical identified clusters in AOI sector` : 'Designated AOI Sector'),
          threat: val?.description || val?.threat || 'Elevated threat dynamics detected in sector.',
          recommendations: Array.isArray(val?.recommendations)
            ? val.recommendations
            : (val?.recommendedAction ? [val.recommendedAction] : ['Conduct rapid assessment and verify lifeline continuity.'])
        };
      });
    }
  }

  return (
    <div className="container">
      <div className="disaster-setup-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: '#ef4444', color: '#ffffff', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>7</span>
            Operational Priority Triage & Response Zones
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: 600 }}>
            TACTICAL ACTION MATRIX
          </span>
        </div>

        <div style={{ marginTop: '1rem' }}>
          {(Array.isArray(pZones) ? pZones : []).map((zone) => (
            <div key={zone.id} className={`priority-card ${zone.cssClass}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.88rem', color: zone.color, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertOctagon size={16} />
                  {zone.name}
                </strong>
                <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '4px', color: '#f8fafc', fontFamily: 'monospace' }}>
                  RANK #{zone.rank}
                </span>
              </div>

              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#f8fafc', fontWeight: 500 }}>
                📍 <strong>Focal Area:</strong> {zone.target}
              </div>

              <p style={{ margin: '0.35rem 0', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                ⚠️ <strong>Threat Dynamics:</strong> {zone.threat}
              </p>

              <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Recommended Operational Directives:
                </span>
                <ul style={{ margin: '0.3rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.74rem', color: '#f1f5f9', lineHeight: '1.45' }}>
                  {(Array.isArray(zone.recommendations) ? zone.recommendations : []).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
