import React, { createContext, useContext, useState, useCallback } from 'react';
import { ANALYSIS_MODES } from '../components/ModeSelector.jsx';
import { analyzeSatelliteImages } from '../services/api.js';
import { normalizeAnalysisResponse } from '../utils/responseNormalizer.js';
import { generateBiTemporalDatePair } from '../utils/dateGenerator.js';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [selectedMode, setSelectedMode] = useState('VQA');
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [biTemporalDates, setBiTemporalDates] = useState(() => generateBiTemporalDatePair());
  const [query, setQuery] = useState('What is visible in this satellite image?');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleSelectMode = useCallback((newMode) => {
    const currentModeConfig = ANALYSIS_MODES.find(m => m.id === selectedMode);
    const newModeConfig = ANALYSIS_MODES.find(m => m.id === newMode);

    if (query === currentModeConfig?.defaultQuery || !query.trim()) {
      setQuery(newModeConfig?.defaultQuery || '');
    }

    if (newMode === 'CHANGE_ANALYSIS' && (!biTemporalDates?.dateA || !biTemporalDates?.dateB)) {
      setBiTemporalDates(generateBiTemporalDatePair());
    }

    setSelectedMode(newMode);
    setError(null);
  }, [selectedMode, query, biTemporalDates]);

  const selectMissionAndPrompt = useCallback((modeId, prompt = null) => {
    const modeConfig = ANALYSIS_MODES.find(m => m.id === modeId);
    setSelectedMode(modeId);
    if (prompt) {
      setQuery(prompt);
    } else if (modeConfig) {
      setQuery(modeConfig.defaultQuery);
    }
    if (modeId === 'CHANGE_ANALYSIS' && (!biTemporalDates?.dateA || !biTemporalDates?.dateB)) {
      setBiTemporalDates(generateBiTemporalDatePair());
    }
    setError(null);
  }, [biTemporalDates]);

  const handleAnalyze = useCallback(async () => {
    if (!query.trim()) {
      setError('Please provide an analysis query.');
      return null;
    }

    if (!imageA?.fileId) {
      setError('Please upload the primary satellite image.');
      return null;
    }

    if (selectedMode === 'CHANGE_ANALYSIS' && !imageB?.fileId) {
      setError('Bi-Temporal Change Analysis requires two satellite images (Image A & Image B).');
      return null;
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
      return normalized;
    } catch (err) {
      console.error('[AnalysisContext Error]:', err);
      const errMsg = err.message || 'Failed to analyze satellite imagery. Please check backend connection.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [query, imageA, imageB, selectedMode, biTemporalDates]);

  const resetWorkspace = useCallback(() => {
    setImageA(null);
    setImageB(null);
    setAnalysisResult(null);
    setError(null);
    const vqaConfig = ANALYSIS_MODES.find(m => m.id === 'VQA');
    setSelectedMode('VQA');
    setQuery(vqaConfig?.defaultQuery || 'What is visible in this satellite image?');
    setBiTemporalDates(generateBiTemporalDatePair());
  }, []);

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

  const value = {
    selectedMode,
    setSelectedMode,
    handleSelectMode,
    selectMissionAndPrompt,
    imageA,
    setImageA,
    imageB,
    setImageB,
    enrichedImageA,
    enrichedImageB,
    biTemporalDates,
    setBiTemporalDates,
    query,
    setQuery,
    loading,
    error,
    setError,
    analysisResult,
    setAnalysisResult,
    handleAnalyze,
    resetWorkspace,
    isDualMode,
    isAnalyzeDisabled
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}

export default AnalysisContext;
