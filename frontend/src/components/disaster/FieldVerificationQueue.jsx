import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit3,
  Save,
  MessageSquare
} from 'lucide-react';

export default function FieldVerificationQueue({ disasterResult }) {
  const [queue, setQueue] = useState([
    {
      id: 'chk_1',
      cluster: 'Barpeta Civil Hospital Approach',
      level: 4,
      severity: 'HIGH',
      status: 'NEEDS_CHECK',
      analystNotes: 'Request NDRF boat team to verify structural clearance of emergency ramp.'
    },
    {
      id: 'chk_2',
      cluster: 'NH-31 Bridge Span #4 Abutment',
      level: 4,
      severity: 'HIGH',
      status: 'VERIFIED',
      analystNotes: 'Confirmed by PWD drone feed: scour erosion around eastern pier #4.'
    },
    {
      id: 'chk_3',
      cluster: 'Northwest Substation High-Voltage Berm',
      level: 2,
      severity: 'LOW',
      status: 'FALSE_POSITIVE',
      analystNotes: 'Radar backscatter was caused by localized water accumulation in drainage trench; transformers dry.'
    },
    {
      id: 'chk_4',
      cluster: 'Sarbhog Secondary School Grounds',
      level: 3,
      severity: 'MODERATE',
      status: 'NEEDS_CHECK',
      analystNotes: 'Check if second-story rooms can be reached for evacuee staging.'
    }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  const updateStatus = (id, newStatus) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const startEditNotes = (item) => {
    setEditingId(item.id);
    setTempNotes(item.analystNotes || '');
  };

  const saveNotes = (id) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, analystNotes: tempNotes } : item))
    );
    setEditingId(null);
  };

  const needsCheckCount = queue.filter((q) => q.status === 'NEEDS_CHECK').length;
  const verifiedCount = queue.filter((q) => q.status === 'VERIFIED').length;
  const falsePositiveCount = queue.filter((q) => q.status === 'FALSE_POSITIVE').length;

  return (
    <div className="container">
      <div className="disaster-setup-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: '#f59e0b', color: '#070b14', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>10</span>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff' }}>
              Field Verification & Analyst Ground-Truthing Queue
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', background: 'rgba(245,158,11,0.15)', color: '#fde047', padding: '2px 8px', borderRadius: '4px' }}>
              Pending: {needsCheckCount}
            </span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', padding: '2px 8px', borderRadius: '4px' }}>
              Verified: {verifiedCount}
            </span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(148,163,184,0.15)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
              FP: {falsePositiveCount}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="verification-table">
            <thead>
              <tr>
                <th>Cluster / Target</th>
                <th>Damage Level</th>
                <th>Validation Status</th>
                <th>Operational Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#ffffff' }}>{item.cluster}</strong>
                  </td>
                  <td>
                    <span className={`damage-level-badge damage-level-${item.level}`}>
                      Level {item.level} ({item.severity})
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className={`verification-status-btn needs-check ${item.status === 'NEEDS_CHECK' ? 'active' : ''}`}
                        onClick={() => updateStatus(item.id, 'NEEDS_CHECK')}
                        title="Mark as pending ground verification"
                      >
                        Needs Check
                      </button>
                      <button
                        type="button"
                        className={`verification-status-btn verified ${item.status === 'VERIFIED' ? 'active' : ''}`}
                        onClick={() => updateStatus(item.id, 'VERIFIED')}
                        title="Confirm feature verified on ground"
                      >
                        Verified
                      </button>
                      <button
                        type="button"
                        className={`verification-status-btn false-positive ${item.status === 'FALSE_POSITIVE' ? 'active' : ''}`}
                        onClick={() => updateStatus(item.id, 'FALSE_POSITIVE')}
                        title="Mark as sensor artefact or false positive"
                      >
                        False Positive
                      </button>
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    {editingId === item.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="text"
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          style={{ padding: '3px 6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff', width: '100%' }}
                        />
                        <button
                          type="button"
                          className="disaster-action-btn"
                          style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                          onClick={() => saveNotes(item.id)}
                        >
                          <Save size={12} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                          {item.analystNotes || 'No notes added.'}
                        </span>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          onClick={() => startEditNotes(item)}
                          title="Edit analyst note"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                      {item.id}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
