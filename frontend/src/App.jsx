import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import ModeSelector, { ANALYSIS_MODES } from './components/ModeSelector.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import QueryInput from './components/QueryInput.jsx';
import AnalyzeButton from './components/AnalyzeButton.jsx';
import AnalysisResult from './components/AnalysisResult.jsx';
import { checkBackendHealth, analyzeSatelliteImages } from './services/api.js';
import { normalizeAnalysisResponse } from './utils/responseNormalizer.js';
import { generateBiTemporalDatePair } from './utils/dateGenerator.js';

export function App() {
  const [backendHealth, setBackendHealth] = useState({ ok: false, status: 'checking' });
  const [selectedMode, setSelectedMode] = useState('VQA');
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [biTemporalDates, setBiTemporalDates] = useState(() => generateBiTemporalDatePair());
  const [query, setQuery] = useState('What is visible in this satellite image?');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Check health on mount and periodically every 30s
  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      const health = await checkBackendHealth();
      if (mounted) setBackendHealth(health);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // When mode changes, update default query if query matches previous default
  const handleSelectMode = (newMode) => {
    const currentModeConfig = ANALYSIS_MODES.find(m => m.id === selectedMode);
    const newModeConfig = ANALYSIS_MODES.find(m => m.id === newMode);

    if (query === currentModeConfig?.defaultQuery || !query.trim()) {
      setQuery(newModeConfig?.defaultQuery || '');
    }

    // If switching to CHANGE_ANALYSIS mode and no biTemporal dates yet, regenerate fresh pair
    if (newMode === 'CHANGE_ANALYSIS' && (!biTemporalDates?.dateA || !biTemporalDates?.dateB)) {
      setBiTemporalDates(generateBiTemporalDatePair());
    }

    setSelectedMode(newMode);
    setError(null);
  };

  // Run analysis
  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError('Please provide an analysis query.');
      return;
    }

    if (!imageA?.fileId) {
      setError('Please upload the primary satellite image.');
      return;
    }

    if (selectedMode === 'CHANGE_ANALYSIS' && !imageB?.fileId) {
      setError('Bi-Temporal Change Analysis requires two satellite images (Image A & Image B).');
      return;
    }

    const isDual = selectedMode === 'CHANGE_ANALYSIS';
    const fileIds = isDual
      ? [imageA.fileId, imageB.fileId]
      : [imageA.fileId];

    const timestamps = isDual
      ? [
          imageA?.metadata?.timestamp || biTemporalDates.dateA,
          imageB?.metadata?.timestamp || biTemporalDates.dateB
        ]
      : (imageA?.metadata?.timestamp ? [imageA.metadata.timestamp] : undefined);

    setLoading(true);
    setError(null);

    try {
      const rawResponse = await analyzeSatelliteImages({
        query: query.trim(),
        fileIds,
        requestedTask: selectedMode,
        timestamps
      });

      const normalized = normalizeAnalysisResponse(rawResponse);
      setAnalysisResult(normalized);
    } catch (err) {
      console.error('[App Analysis Error]:', err);
      setError(err.message || 'Failed to analyze satellite imagery. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const isDualMode = selectedMode === 'CHANGE_ANALYSIS';
  const isAnalyzeDisabled = !imageA?.fileId || (isDualMode && !imageB?.fileId) || !query.trim();

  // Create enriched image objects with timestamps for visualizers
  const enrichedImageA = imageA ? {
    ...imageA,
    metadata: {
      ...(imageA.metadata || {}),
      timestamp: imageA.metadata?.timestamp || (isDualMode ? biTemporalDates.dateA : null)
    }
  } : null;

  const enrichedImageB = imageB ? {
    ...imageB,
    metadata: {
      ...(imageB.metadata || {}),
      timestamp: imageB.metadata?.timestamp || (isDualMode ? biTemporalDates.dateB : null)
    }
  } : null;

  return (
    <div className="app-root">
      <Navbar backendHealth={backendHealth} />

      <main className="main-content">
        <div className="container workspace-layout">
          {/* Left Column: Mission Controls & Input */}
          <section className="input-column glass-panel">
            <ModeSelector
              selectedMode={selectedMode}
              onSelectMode={handleSelectMode}
            />

            <ImageUploader
              selectedMode={selectedMode}
              imageA={imageA}
              setImageA={setImageA}
              imageB={imageB}
              setImageB={setImageB}
              biTemporalDates={biTemporalDates}
              setBiTemporalDates={setBiTemporalDates}
            />

            <QueryInput
              selectedMode={selectedMode}
              query={query}
              setQuery={setQuery}
            />

            <AnalyzeButton
              loading={loading}
              onClick={handleAnalyze}
              disabled={isAnalyzeDisabled}
              selectedMode={selectedMode}
            />
          </section>

          {/* Right Column: AI Analysis Result & Visuals */}
          <section className="output-column">
            <AnalysisResult
              analysisResult={analysisResult}
              loading={loading}
              error={error}
              selectedMode={selectedMode}
              imageA={enrichedImageA}
              imageB={enrichedImageB}
            />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container footer-inner">
          <span>SatVistaar Autonomous Geospatial Platform</span>
          <span className="footer-dot">•</span>
          <span>Source of Truth: Real Backend VLM API</span>
        </div>
      </footer>

      <style>{`
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: radial-gradient(circle at 50% 0%, rgba(13, 27, 62, 0.4) 0%, rgba(7, 10, 18, 1) 75%);
        }
        .main-content {
          flex: 1;
          padding: 1.5rem 0 3rem 0;
        }
        .workspace-layout {
          display: grid;
          grid-template-columns: minmax(360px, 480px) minmax(0, 1fr);
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .workspace-layout {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
        .input-column {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .output-column {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .app-footer {
          border-top: 1px solid var(--border-subtle);
          background: rgba(13, 19, 34, 0.7);
          padding: 1rem 0;
          font-size: 0.725rem;
          color: var(--text-dim);
        }
        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .footer-dot {
          color: var(--border-medium);
        }
      `}</style>
    </div>
  );
}

export default App;
