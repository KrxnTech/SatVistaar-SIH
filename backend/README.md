# SatQuery AI / SatVistaar Backend - VLM MVP Architecture (SIH 2026)

Interactive Vision-Language Assistant for Multimodal Remote-Sensing Image Analysis (Problem Statement SIH26167).

This backend provides a provider-agnostic **Vision-Language Model (VLM)** architecture supporting **Groq** and **Ollama** coupled with a Python Preprocessing Microservice for remote-sensing image upload, geospatial metadata extraction (`rasterio` / `PIL`), task classification, agentic compatibility evaluation, Model Router selection, specialist VLM tool execution, and structured `ExecutionTrace` logging.

---

## 🏛️ VLM Backend Architecture

```
                    CLIENT (React / Vite)
                              │
                              ▼
                         EXPRESS API
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
         UPLOAD                              ANALYSIS
            │                                   │
            ▼                                   ▼
      File Storage                       AnalysisRequest
            │                                   │
            ▼                                   ▼
       Metadata                          Intent Classifier
            │                           (VQA | CAPTIONING |
            │                            FEATURE_ID | CHANGE)
            │                                   │
            └─────────────────┬─────────────────┘
                              ▼
                     Compatibility Engine
                              │
                         READY / ABSTAIN / UNKNOWN
                              │
                              ▼
                        Model Router
                (Groq / Ollama / Fallback)
                              │
                              ▼
                        Tool Registry
                              │
                              ▼
                        Tool Executor
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
      Groq / Ollama                        ToolResult
       VLM Adapter                   (confidence = null)
            │                                   │
            └─────────────────┬─────────────────┘
                              ▼
                       Execution Trace
                              │
                              ▼
                      Backend Response
```

---

## 🎯 Supported MVP Tasks

1. **GENERAL VQA (`VQA`):** General visual question answering on optical or visual satellite imagery (`"What is visible in this image?"`).
2. **IMAGE / SCENE DESCRIPTION (`CAPTIONING`):** High-level spatial overview and scene summary (`"Describe this satellite image."`).
3. **FEATURE / OBJECT IDENTIFICATION (`FEATURE_IDENTIFICATION`):** Visual identification of major features/objects (buildings, roads, water bodies, vegetation) and approximate visual grounding.
4. **SIMPLE TWO-IMAGE CHANGE ANALYSIS (`CHANGE_ANALYSIS`):** Qualitative visual comparison between two temporal images (`"What changed between these two images?"`).

---

## 📷 MVP Input Types

- **Optical RGB Imagery:** JPEG, PNG, WebP visual imagery.
- **Optical Multispectral Visual Representation:** GeoTIFF or multispectral imagery converted to a model-compatible visual RGB representation.
- **Experimental SAR Imagery:** Visual representations of SAR products.

---

## ⚙️ Environment Variables & VLM Configuration

Copy `.env.example` to `.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
API_PREFIX=/api/v1
MAX_UPLOAD_SIZE_MB=50
UPLOAD_DIR=uploads
PREPROCESSING_SERVICE_URL=http://localhost:5001

# VLM / ML Mode Configuration
ML_MODE=mock # 'real' or 'mock'
MODEL_PROVIDER=auto # 'auto', 'groq', 'ollama', or 'mock'
MODEL_ROUTER_MODE=priority # 'priority' or 'fallback'
VLM_TIMEOUT_MS=30000

# Groq VLM Provider
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.2-11b-vision-preview

# Ollama Local VLM Provider
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2-vl
```

---

## 🤖 Model Router & Providers

- **Provider Abstraction:** Model calls are decoupled into provider adapters inside `src/providers/` (`GroqProvider`, `OllamaProvider`).
- **Model Registry:** Managed candidate models and capabilities in `src/agent/modelRegistry.js`.
- **Model Router:** Selects primary model and deterministic 1-step fallback model in `src/agent/modelRouter.js`.
- **Mock Mode:** When `ML_MODE=mock`, synthetic responses are returned without calling external APIs.

---

## 🚀 Running the Server & Services

1. **Install Dependencies:**
   ```bash
   npm install
   pip install -r services/preprocessing/requirements.txt
   ```

2. **Start Preprocessing Service (Port 5001):**
   ```bash
   python services/preprocessing/app.py
   ```

3. **Start Express Backend (Port 5000):**
   ```bash
   npm run dev
   ```

4. **Run Test Suite:**
   ```bash
   node tests/mvp-vlm.test.js
   ```

---

## 📄 Documentation

- [MVP Scope & Detailed Specification](docs/mvp-scope.md)
- [Backend API Contracts](docs/backend-contracts.md)
