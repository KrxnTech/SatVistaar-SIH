import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  TrendingDown,
  Activity,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function DisasterTimelinePanel({ disasterResult }) {
  const [activeEpochIdx, setActiveEpochIdx] = useState(1);

  const epochs = [
    {
      id: 'ep_0',
      label: 'T-0 Baseline',
      date: disasterResult?.temporalContext?.preDate || '2026-08-10',
      status: 'Normal Pre-event Condition',
      waterKm2: 12.4,
      desc: 'Pre-monsoon stable dry land conditions with normal river channels.'
    },
    {
      id: 'ep_1',
      label: 'T+1 Surge Peak',
      date: disasterResult?.temporalContext?.postDate || '2026-08-18',
      status: 'Current Active Inundation',
      waterKm2: 42.8,
      desc: 'Peak backscatter drop detected across floodplain. Levee breach active.'
    },
    {
      id: 'ep_2',
      label: 'T+2 (+72h Projection)',
      date: '2026-08-21',
      status: 'Plateau & Early Runoff',
      waterKm2: 36.2,
      desc: 'Initial cresting with slow gravity drainage along southern tributaries.'
    },
    {
      id: 'ep_3',
      label: 'T+3 (+7 Days Recovery)',
      date: '2026-08-25',
      status: 'Recession & Residue Silt',
      waterKm2: 21.0,
      desc: 'Substantial standing water recession; heavy sediment and mud deposit phase.'
    }
  ];

  const currentEpoch = epochs[activeEpochIdx];

  return (
    <div className="container">
      <div className="disaster-setup-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: '#06b6d4', color: '#070b14', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>9</span>
            Event Timeline & Multi-Epoch Recovery Monitoring
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#67e8f9', fontFamily: 'monospace' }}>
            RECESSION TRACKER
          </span>
        </div>

        {/* Timeline Stepper */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginTop: '1rem' }}>
          {epochs.map((ep, idx) => {
            const isSelected = activeEpochIdx === idx;
            return (
              <div
                key={ep.id}
                onClick={() => setActiveEpochIdx(idx)}
                style={{
                  background: isSelected ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? '#67e8f9' : '#cbd5e1' }}>
                    {ep.label}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {ep.date}
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isSelected ? '#ffffff' : '#94a3b8', marginTop: '0.35rem' }}>
                  {ep.waterKm2} km²
                </div>
                <span style={{ fontSize: '0.7rem', color: isSelected ? '#a5f3fc' : '#64748b', display: 'block', marginTop: '0.2rem' }}>
                  {ep.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Epoch Detail Box */}
        <div style={{ marginTop: '0.85rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.85rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong style={{ fontSize: '0.84rem', color: '#67e8f9' }}>
              Selected Epoch: {currentEpoch.label} ({currentEpoch.date})
            </strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#e2e8f0' }}>
              {currentEpoch.desc}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6,182,212,0.1)', padding: '4px 10px', borderRadius: '6px' }}>
            <TrendingDown size={14} color="#06b6d4" />
            <span style={{ fontSize: '0.72rem', color: '#67e8f9', fontWeight: 600 }}>
              Water Extent: {currentEpoch.waterKm2} km²
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
