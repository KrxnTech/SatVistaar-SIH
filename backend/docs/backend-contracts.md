# SatQuery AI - Backend API Contracts & Integration Boundaries

This document defines the frozen API contracts, schemas, error codes, and handoff specifications for the **SatQuery AI** backend (SIH 2026, Problem Statement SIH26167).

---

## 1. 📤 Upload API Contract

- **Endpoint**: `POST /api/v1/uploads` (or `POST /api/uploads`)
- **Headers**: `Content-Type: multipart/form-data`
- **Field Name**: `images` (1 to 2 files)
- **Supported Extensions**: `.png`, `.jpg`, `.jpeg`, `.tif`, `.tiff` (GeoTIFF)
- **Size Limit**: Enforced by `MAX_UPLOAD_SIZE_MB` (Default: 50MB)

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Images uploaded and validated successfully",
  "data": {
    "files": [
      {
        "id": "a82b9921-ef78-433c-8438-e6b7dd2c9f41",
        "originalName": "sentinel2_sample.tif",
        "filename": "a82b9921-ef78-433c-8438-e6b7dd2c9f41.tif",
        "mimeType": "image/tiff",
        "size": 1420580,
        "path": "uploads/a82b9921-ef78-433c-8438-e6b7dd2c9f41.tif"
      }
    ]
  },
  "requestId": "d828bb89-b399-472b-95bc-194208811027"
}
```

---

## 2. 🗺️ Geospatial Metadata API Contract

- **Endpoint**: `GET /api/v1/uploads/:fileId/metadata`

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Image metadata extracted successfully",
  "data": {
    "fileId": "a82b9921-ef78-433c-8438-e6b7dd2c9f41",
    "metadata": {
      "format": "GTiff",
      "width": 2048,
      "height": 2048,
      "bands": 4,
      "crs": "EPSG:4326",
      "bounds": {
        "left": 70.0,
        "bottom": 20.0,
        "right": 71.0,
        "top": 21.0
      },
      "transform": [1.0, 0.0, 0.0, 0.0, -1.0, 0.0],
      "timestamp": null,
      "modality": null,
      "isGeoreferenced": true,
      "warnings": []
    }
  },
  "requestId": "d828bb89-b399-472b-95bc-194208811027"
}
```

---

## 3. 🧠 Analysis API Contract

- **Endpoint**: `POST /api/v1/analysis` (or `POST /api/analysis`)
- **Headers**: `Content-Type: application/json`
- **Body Schema**:
```json
{
  "query": "Highlight the water body in this image.",
  "fileIds": [
    "a82b9921-ef78-433c-8438-e6b7dd2c9f41"
  ],
  "requestedTask": null,
  "benchmarkMode": false
}
```

### Successful Execution Response (`200 OK` - Status: `READY`)
```json
{
  "success": true,
  "message": "Analysis completed",
  "data": {
    "analysisRequest": {
      "requestId": "d828bb89-b399-472b-95bc-194208811027",
      "query": "Highlight the water body in this image.",
      "inputs": [
        {
          "fileId": "a82b9921-ef78-433c-8438-e6b7dd2c9f41",
          "metadata": { ... }
        }
      ],
      "requestedTask": null,
      "benchmarkMode": false
    },
    "intent": {
      "name": "GROUNDING",
      "confidence": 0.91,
      "reason": "The query requests spatial localization or highlighting of specific objects or regions.",
      "warnings": []
    },
    "compatibility": {
      "compatible": true,
      "status": "READY",
      "selectedIntent": "GROUNDING",
      "reasons": [],
      "warnings": [],
      "requirements": {
        "minImages": 1,
        "maxImages": 1,
        "temporalPair": false,
        "spatialMetadataRecommended": true,
        "requiredModalities": []
      }
    },
    "executionPlan": {
      "selectedIntent": "GROUNDING",
      "status": "READY",
      "selectedTools": [
        {
          "name": "mock-grounding",
          "task": "GROUNDING",
          "version": "0.1.0",
          "description": "Mock visual grounding and spatial localization tool"
        }
      ]
    },
    "result": {
      "task": "GROUNDING",
      "answerText": "Mock grounding localization result for query: \"Highlight the water body in this image.\"",
      "confidence": 0,
      "evidence": [
        {
          "type": "bbox",
          "source": "mock",
          "coordinates": [10, 10, 150, 150],
          "description": "Mock synthetic bounding box placeholder"
        }
      ],
      "modelName": "mock-grounding",
      "modelVersion": "0.1.0",
      "parametersUsed": {},
      "warnings": [
        "Mock bounding box. No real grounding inference was performed."
      ],
      "status": "success"
    },
    "trace": {
      "requestId": "d828bb89-b399-472b-95bc-194208811027",
      "selectedIntent": "GROUNDING",
      "validationResults": [],
      "selectedTools": [
        {
          "name": "mock-grounding",
          "version": "0.1.0"
        }
      ],
      "startedAt": "2026-08-29T13:55:00.000Z",
      "endedAt": "2026-08-29T13:55:00.015Z",
      "durationMs": 15,
      "modelVersions": {
        "mock-grounding": "0.1.0"
      },
      "parameters": {},
      "outputReferences": [
        {
          "type": "bbox",
          "source": "mock",
          "description": "Mock synthetic bounding box placeholder"
        }
      ],
      "events": [
        { "type": "REQUEST_RECEIVED", "timestamp": "..." },
        { "type": "INTENT_SELECTED", "timestamp": "...", "intent": "GROUNDING" },
        { "type": "COMPATIBILITY_CHECKED", "timestamp": "...", "status": "READY" },
        { "type": "TOOL_STARTED", "timestamp": "...", "intent": "GROUNDING" },
        { "type": "TOOL_COMPLETED", "timestamp": "...", "status": "success" },
        { "type": "RESPONSE_READY", "timestamp": "..." }
      ],
      "finalStatus": "success"
    }
  },
  "requestId": "d828bb89-b399-472b-95bc-194208811027"
}
```

### Abstain Response (`200 OK` - Status: `ABSTAIN`)
```json
{
  "success": true,
  "message": "Analysis abstained because inputs are incompatible",
  "data": {
    "intent": {
      "name": "CHANGE_DETECTION",
      "confidence": 0.93
    },
    "compatibility": {
      "compatible": false,
      "status": "ABSTAIN",
      "selectedIntent": "CHANGE_DETECTION",
      "reasons": [
        "Change detection requires two temporal images."
      ]
    },
    "executionPlan": {
      "selectedIntent": "CHANGE_DETECTION",
      "status": "ABSTAIN",
      "selectedTools": []
    },
    "result": null,
    "trace": {
      "requestId": "...",
      "selectedIntent": "CHANGE_DETECTION",
      "validationResults": [
        "Change detection requires two temporal images."
      ],
      "selectedTools": [],
      "finalStatus": "abstained"
    }
  },
  "requestId": "..."
}
```

---

## 4. 🤖 ML Team Handoff Contract

The backend interacts with specialist ML models through an adapter pattern over HTTP. The ML team owns model training, PyTorch checkpoint loading, and Python model inference endpoints.

### Expected ML Microservice Request (`POST ${ML_SERVICE_URL}/predict`)
```json
{
  "requestId": "d828bb89-b399-472b-95bc-194208811027",
  "task": "GROUNDING",
  "query": "Highlight the water body",
  "inputs": [
    {
      "fileId": "a82b9921-ef78-433c-8438-e6b7dd2c9f41",
      "path": "C:\\Users\\krish\\Desktop\\SatVistaar\\backend\\uploads\\a82b9921-ef78-433c-8438-e6b7dd2c9f41.tif",
      "metadata": { ... }
    }
  ],
  "parameters": {}
}
```

### Expected ML Microservice Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "task": "GROUNDING",
    "answerText": "Water body localized in top-left region.",
    "confidence": 0.94,
    "evidence": [
      {
        "type": "bbox",
        "source": "model",
        "coordinates": [100, 150, 450, 500],
        "description": "Detected water body boundary"
      }
    ],
    "modelName": "satquery-grounding-v1",
    "modelVersion": "1.0.0",
    "parametersUsed": {},
    "warnings": [],
    "status": "success"
  }
}
```

---

## 5. 🗄️ Database Team Handoff Contract

The Database/Data team owns PostgreSQL/PostGIS persistence, migrations, and history storage. The backend exposes the following stable domain entities for persistence:

1. **`AnalysisRequest`**: `requestId`, `query`, `fileIds`, `requestedTask`, `benchmarkMode`, `createdAt`.
2. **`IntentResult`**: `name`, `confidence`, `reason`, `warnings`.
3. **`CompatibilityResult`**: `compatible`, `status`, `selectedIntent`, `reasons`, `warnings`.
4. **`ToolResult`**: `task`, `answerText`, `confidence`, `evidence`, `modelName`, `modelVersion`, `status`.
5. **`ExecutionTrace`**: `requestId`, `selectedIntent`, `startedAt`, `endedAt`, `durationMs`, `modelVersions`, `events`, `finalStatus`.

---

## 6. 🚨 Frozen Error Codes Contract

| Error Code | HTTP Status | Description |
|---|---|---|
| `INVALID_QUERY` | `400` | Query is missing or empty |
| `QUERY_TOO_LONG` | `400` | Query exceeds 1000 characters |
| `INVALID_FILE_IDS` | `400` | fileIds missing or not array of 1-2 items |
| `TOO_MANY_FILE_IDS` | `400` | More than 2 file IDs provided |
| `INVALID_FILE_ID` | `400` | Invalid file ID string format |
| `FILE_NOT_FOUND` | `404` | Uploaded file ID does not exist |
| `UNSUPPORTED_FILE_TYPE` | `400` | Uploaded file format not allowed |
| `FILE_TOO_LARGE` | `400` | File exceeds maximum upload size |
| `PREPROCESSING_SERVICE_UNAVAILABLE` | `503` | Python preprocessing microservice down |
| `PREPROCESSING_FAILED` | `400` / `500` | Preprocessing extraction failed |
| `ML_SERVICE_UNAVAILABLE` | `503` | ML inference service down |
| `ML_INFERENCE_FAILED` | `500` | ML inference exception |
| `INTERNAL_SERVER_ERROR` | `500` | Unhandled backend exception |
