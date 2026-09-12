import React, { createContext, useContext, useState, useCallback } from 'react';
import { ANALYSIS_MODES } from '../components/ModeSelector.jsx';
import { analyzeSatelliteImages, analyzeRoiRegion } from '../services/api.js';
import { normalizeAnalysisResponse } from '../utils/responseNormalizer.js';
import { generateBiTemporalDatePair } from '../utils/dateGenerator.js';
import { computeClientGisMetrics } from '../utils/gisCalculator.js';

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
  const [history, setHistory] = useState([]);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // ── Universal ROI / Selected Area States ──
  const [roiGeometry, setRoiGeometry] = useState(null);
  const [activeRoiTool, setActiveRoiTool] = useState(null);
  const [activeScope, setActiveScope] = useState('FULL'); // 'FULL' | 'ROI'
  const [roiAnalysisResult, setRoiAnalysisResult] = useState(null);
  const [roiLoading, setRoiLoading] = useState(false);
  const [roiError, setRoiError] = useState(null);

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
      setError(selectedMode === 'OPTICAL_SAR_FUSION'
        ? 'Please upload the Optical / Multispectral satellite scene.'
        : 'Please upload the primary satellite image.');
      return null;
    }

    if (selectedMode === 'CHANGE_ANALYSIS' && !imageB?.fileId) {
      setError('Bi-Temporal Change Analysis requires two satellite images (Image A & Image B).');
      return null;
    }

    if (selectedMode === 'OPTICAL_SAR_FUSION' && !imageB?.fileId) {
      setError('Optical + SAR Fusion requires both Optical (Image A) and SAR (Image B) rasters.');
      return null;
    }

    const isDual = selectedMode === 'CHANGE_ANALYSIS' || selectedMode === 'OPTICAL_SAR_FUSION';
    const fileIds = isDual
      ? [imageA.fileId, imageB.fileId]
      : [imageA.fileId];

    const timestamps = selectedMode === 'CHANGE_ANALYSIS'
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

      // Save to session history
      const historyEntry = {
        id: normalized.requestId || `hist_${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode: selectedMode,
        query: query.trim(),
        result: normalized,
        imageA: imageA ? { ...imageA } : null,
        imageB: imageB ? { ...imageB } : null
      };
      setHistory(prev => [historyEntry, ...prev.filter(h => h.id !== historyEntry.id).slice(0, 19)]);

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

  const updateRoiGeometry = useCallback((newRoi) => {
    if (!newRoi || !newRoi.coordinates || newRoi.coordinates.length < 2) {
      setRoiGeometry(null);
      setRoiAnalysisResult(null);
      return;
    }
    const meta = imageA?.metadata || {};
    const enriched = computeClientGisMetrics(newRoi, meta);
    setRoiGeometry(enriched || newRoi);
    setRoiAnalysisResult(null);
    setRoiError(null);
  }, [imageA]);

  const clearRoi = useCallback(() => {
    setRoiGeometry(null);
    setActiveRoiTool(null);
    setActiveScope('FULL');
    setRoiAnalysisResult(null);
    setRoiError(null);
  }, []);

  const handleAnalyzeRoi = useCallback(async (customQuery) => {
    if (!roiGeometry || !roiGeometry.coordinates || roiGeometry.coordinates.length < 2) {
      setRoiError('Please select a region on the satellite image first.');
      return null;
    }

    const questionToAsk = customQuery?.trim() || 'Analyze land cover and features within this selected area.';
    const isDual = selectedMode === 'CHANGE_ANALYSIS' || selectedMode === 'OPTICAL_SAR_FUSION';
    const fileIds = isDual ? [imageA.fileId, imageB.fileId] : [imageA.fileId];

    const timestamps = selectedMode === 'CHANGE_ANALYSIS'
      ? [
          imageA?.metadata?.timestamp || biTemporalDates.dateA,
          imageB?.metadata?.timestamp || biTemporalDates.dateB
        ]
      : (imageA?.metadata?.timestamp ? [imageA.metadata.timestamp] : undefined);

    setRoiLoading(true);
    setRoiError(null);

    try {
      const response = await analyzeRoiRegion({
        query: questionToAsk,
        fileIds,
        requestedTask: selectedMode,
        roi: roiGeometry,
        timestamps
      });

      const normalized = normalizeAnalysisResponse(response);
      const resResult = response.data?.result || {};
      const roiPayload = {
        query: questionToAsk,
        answerText: resResult.answerText || normalized.answerText,
        dominantClass: resResult.dominantClass || 'Unknown',
        confidence: resResult.confidence !== undefined ? resResult.confidence : (normalized.confidence || 0.85),
        statistics: resResult.statistics || null,
        multimodal: resResult.multimodal,
        temporal: resResult.temporal,
        grounding: resResult.grounding,
        roiDebug: resResult.roiDebug || null,
        executionTrace: resResult.executionTrace || []
      };

      setRoiAnalysisResult(roiPayload);
      setActiveScope('ROI');
      return roiPayload;
    } catch (err) {
      console.error('[AnalysisContext ROI Error]:', err);
      const errMsg = err.message || 'Failed to analyze selected area.';
      setRoiError(errMsg);
      throw err;
    } finally {
      setRoiLoading(false);
    }
  }, [roiGeometry, selectedMode, imageA, imageB, biTemporalDates]);

  const resetWorkspace = useCallback(() => {
    setImageA(null);
    setImageB(null);
    setAnalysisResult(null);
    setError(null);
    const vqaConfig = ANALYSIS_MODES.find(m => m.id === 'VQA');
    setSelectedMode('VQA');
    setQuery(vqaConfig?.defaultQuery || 'What is visible in this satellite image?');
    setBiTemporalDates(generateBiTemporalDatePair());
    setRoiGeometry(null);
    setActiveRoiTool(null);
    setActiveScope('FULL');
    setRoiAnalysisResult(null);
    setRoiError(null);
  }, []);

  const restoreAnalysisFromHistory = useCallback((entry) => {
    if (!entry) return;
    if (entry.mode) setSelectedMode(entry.mode);
    if (entry.query) setQuery(entry.query);
    if (entry.result) setAnalysisResult(entry.result);
    if (entry.imageA) setImageA(entry.imageA);
    if (entry.imageB) setImageB(entry.imageB);
    setHistoryDrawerOpen(false);
  }, []);

  const isDualMode = selectedMode === 'CHANGE_ANALYSIS' || selectedMode === 'OPTICAL_SAR_FUSION';
  const isAnalyzeDisabled = !imageA?.fileId || (isDualMode && !imageB?.fileId) || !query.trim();

  // Create enriched image objects with timestamps for visualizers
  const enrichedImageA = imageA ? {
    ...imageA,
    metadata: {
      ...(imageA.metadata || {}),
      timestamp: imageA.metadata?.timestamp || (selectedMode === 'CHANGE_ANALYSIS' ? biTemporalDates.dateA : null)
    }
  } : null;

  const enrichedImageB = imageB ? {
    ...imageB,
    metadata: {
      ...(imageB.metadata || {}),
      timestamp: imageB.metadata?.timestamp || (selectedMode === 'CHANGE_ANALYSIS' ? biTemporalDates.dateB : null)
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
    history,
    setHistory,
    historyDrawerOpen,
    setHistoryDrawerOpen,
    restoreAnalysisFromHistory,
    isDualMode,
    isAnalyzeDisabled,
    // Universal ROI states and methods
    roiGeometry,
    setRoiGeometry,
    activeRoiTool,
    setActiveRoiTool,
    activeScope,
    setActiveScope,
    roiAnalysisResult,
    setRoiAnalysisResult,
    roiLoading,
    roiError,
    setRoiError,
    updateRoiGeometry,
    clearRoi,
    handleAnalyzeRoi
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
