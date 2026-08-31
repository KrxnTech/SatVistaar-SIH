# SatVistaar / SatQuery AI - First-Round VLM MVP Scope & Specification

This document defines the frozen scope, capabilities, inputs, architecture, and explicitly unsupported features for the **First-Round MVP** of **SatVistaar / SatQuery AI** (SIH 2026, Problem Statement SIH26167).

---

## 🎯 1. Supported MVP Tasks

For the first SIH round, the system supports **ONLY** four major capabilities using Vision-Language Models (VLMs):

### 1. General VQA (`VQA`)
- **Example Query:** `"What is visible in this image?"`, `"Is there a bridge near the river?"`
- **Description:** General visual question answering on optical or visual satellite imagery.
- **Inputs:** 1 or 2 images + natural language query.

### 2. Image / Scene Description (`CAPTIONING`)
- **Example Query:** `"Describe this satellite image."`, `"Summarize the land cover in this scene."`
- **Description:** High-level spatial overview, land-cover summary, and scene description.
- **Inputs:** 1 image.

### 3. Feature / Object Identification (`FEATURE_IDENTIFICATION`)
- **Example Query:** `"Identify the buildings."`, `"Where are the water bodies?"`, `"Identify roads."`
- **Description:** Visual identification of major features (buildings, roads, water, vegetation) and approximate visual grounding.
- **Important Notice:** Generic VLMs do **NOT** claim pixel-level segmentation or geospatially precise bounding boxes for this MVP phase.

### 4. Simple Two-Image Change Analysis (`CHANGE_ANALYSIS`)
- **Example Query:** `"What changed between these two images?"`, `"Compare image A and image B."`
- **Description:** Vision-Language Based Change Analysis performing qualitative visual comparison between two temporal images.
- **Important Notice:** Labeled explicitly as **Vision-Language Based Change Analysis**. It is **NOT** a pixel-level calibrated remote-sensing change detection model.
- **Inputs:** Strictly 2 images + natural language query.

---

## 📷 2. MVP Supported Input Types

1. **Optical RGB Imagery:** Standard JPEG, PNG, WebP visual imagery.
2. **Optical Multispectral Visual Representation:** GeoTIFF or multispectral imagery converted to a model-compatible visual RGB representation via geospatial preprocessing (`rasterio` / `PIL`).
3. **Experimental SAR Imagery:** Synthetic Aperture Radar (SAR) imagery formatted into a visual representation for qualitative VLM context.

---

## 🚫 3. Explicitly Unsupported in Round 1 (Abstain Triggered)

The following operations are **NOT supported** in Round 1 and will cleanly return an `ABSTAIN` status:

- Custom-trained remote-sensing ML models or fine-tuned model checkpoints.
- Scientifically validated pixel-level semantic segmentation maps.
- Exact NDVI, EVI, or quantitative spectral index calculations.
- Raw multi-gigabyte hyperspectral cube reasoning.
- Scientifically validated radiometric change-detection rasters.
- Advanced raw thermal analytics.
- Database persistence or user authentication (owned by Database/Auth teams).

---

## 🏛️ 4. VLM Architecture & Providers

```
Frontend (React / Vite)
   ↓
Express Backend
   ↓
Input Validation & File Resolution
   ↓
Geospatial Metadata Extraction (rasterio / PIL)
   ↓
Intent / Task Classification (VQA | CAPTIONING | FEATURE_IDENTIFICATION | CHANGE_ANALYSIS)
   ↓
Compatibility Check (1 vs 2 images, modality)
   ↓
Model Router (Groq | Ollama | Fallback)
   ↓
VLM Model Provider
   ├── GroqProvider (Groq Cloud API)
   └── OllamaProvider (Local Ollama API)
   ↓
Normalized ToolResult (confidence = null)
   ↓
ExecutionTrace Logging
   ↓
Frontend Response
```

---

## ⚙️ 5. Configuration & Fallback Policy

- `MODEL_PROVIDER`: `auto` | `groq` | `ollama` | `mock`
- `MODEL_ROUTER_MODE`: `priority` | `fallback`
- **Fallback Policy:** The `ModelRouter` selects 1 primary model. If the primary provider fails or times out, 1 secondary fallback model is attempted deterministically before returning an error.
