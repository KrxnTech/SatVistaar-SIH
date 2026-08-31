import { processAnalysisRequest } from '../services/analysis.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Controller handling POST /api/v1/analysis requests
 */
export const createAnalysis = async (req, res, next) => {
  try {
    const analysisResult = await processAnalysisRequest(req.body, req.requestId);
    const status = analysisResult?.compatibility?.status || 'READY';
    
    let message = 'Analysis completed';
    if (status === 'ABSTAIN') {
      message = 'Analysis abstained because inputs are incompatible';
    } else if (status === 'UNKNOWN') {
      message = 'Analysis intent could not be determined';
    }

    return sendSuccess(res, 200, message, analysisResult);
  } catch (error) {
    next(error);
  }
};

export default {
  createAnalysis
};
