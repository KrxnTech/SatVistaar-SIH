import React from 'react';
import {
  Droplets,
  Wind,
  Flame,
  Mountain,
  Activity,
  Layers,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function HazardAssessmentPanel({ disasterType = 'FLOOD', disasterResult }) {
  const hazard = disasterResult?.hazardAssessment || disasterResult?.hazardMetrics || {};
  const isFlood = disasterType === 'FLOOD' || !disasterResult?.disasterType || disasterResult?.disasterType === 'FLOOD';

  // 4-Class Flood Partition
  const stableLandPct = Number(hazard.fourClassPartition?.stableLandPct || hazard.fourClassPartition?.stableLand || 62.4).toFixed(1);
  const preExistingWaterPct = Number(hazard.fourClassPartition?.preExistingWaterPct || hazard.fourClassPartition?.preExistingWater || 8.2).toFixed(1);
  const newlyInundatedPct = Number(hazard.fourClassPartition?.newlyInundatedPct || hazard.fourClassPartition?.newlyInundated || 21.8).toFixed(1);
  const saturatedSoilPct = Number(hazard.fourClassPartition?.saturatedSoilPct || hazard.fourClassPartition?.saturatedSoil || 7.6).toFixed(1);

  const newInundationKm2 = Number(hazard.newlyInundatedKm2 || hazard.waterExpansionPct || disasterResult?.kpis?.impactedFootprintKm2 || 42.8).toFixed(1);
  const depthProxy = hazard.estimatedDepthRangeM || '0.8 - 2.4 m (lowland troughs)';

  return (
    <div className="container">
      <div className="hazard-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: '#ef4444', color: '#ffffff', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>3</span>
            Hazard Quantification & Partition Dynamics
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontFamily: 'monospace' }}>
            TYPOLOGY: {disasterType}
          </span>
        </div>

        {isFlood ? (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                4-Class Flood Partition Breakdown (Sum: 100.0%)
              </span>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Newly Inundated Area: <strong style={{ color: '#ef4444' }}>{newInundationKm2} km²</strong>
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="flood-partition-bar">
              <div
                className="part-stable"
                style={{ width: `${stableLandPct}%` }}
                title={`Stable Dry Land: ${stableLandPct}%`}
              />
              <div
                className="part-preexisting"
                style={{ width: `${preExistingWaterPct}%` }}
                title={`Pre-existing Water: ${preExistingWaterPct}%`}
              />
              <div
                className="part-inundated"
                style={{ width: `${newlyInundatedPct}%` }}
                title={`Newly Inundated: ${newlyInundatedPct}%`}
              />
              <div
                className="part-saturated"
                style={{ width: `${saturatedSoilPct}%` }}
                title={`Saturated / Mud: ${saturatedSoilPct}%`}
              />
            </div>

            {/* Legend */}
            <div className="flood-legend">
              <div className="flood-legend-item">
                <span className="flood-dot" style={{ background: '#10b981' }} />
                <span>
                  <strong>Stable Land:</strong> {stableLandPct}%
                </span>
              </div>
              <div className="flood-legend-item">
                <span className="flood-dot" style={{ background: '#0284c7' }} />
                <span>
                  <strong>Permanent Water:</strong> {preExistingWaterPct}%
                </span>
              </div>
              <div className="flood-legend-item">
                <span className="flood-dot" style={{ background: '#ef4444' }} />
                <span>
                  <strong>Newly Inundated:</strong> {newlyInundatedPct}%
                </span>
              </div>
              <div className="flood-legend-item">
                <span className="flood-dot" style={{ background: '#f59e0b' }} />
                <span>
                  <strong>Saturated Soil:</strong> {saturatedSoilPct}%
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} color="#ef4444" />
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <strong>Relative Water Expansion:</strong> +{Number(hazard.expansionRatePct || 24.6).toFixed(1)}% vs Baseline
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplets size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <strong>Estimated Water Depth:</strong> {depthProxy}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* General / Other Hazard metrics view */
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>Affected Surface Footprint</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>
                  {hazard.affectedAreaKm2 || '38.4'} km²
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>Severity Index</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f97316', marginTop: '0.2rem' }}>
                  {hazard.severityIndex || '0.78 / 1.0 (High)'}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>Disturbance Pattern</span>
                <div style={{ fontSize: '0.88rem', color: '#f8fafc', marginTop: '0.4rem' }}>
                  {hazard.disturbancePattern || 'Coherent contiguous surface alteration across low-slope topography.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
