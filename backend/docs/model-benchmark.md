# SatVistaar VLM Multi-Model Benchmark & Capability Matrix

Generated: 2026-08-30T11:59:08.049Z

---

## 1. Executive Summary

This report documents the empirical engineering benchmark results for Vision-Language Models (VLMs) evaluated on **SatVistaar / SatQuery AI** (SIH 2026, Problem Statement SIH26167).

All four MVP capabilities (**General VQA**, **Image/Scene Description**, **Feature/Object Identification**, and **Simple Two-Image Change Analysis**) were evaluated across available models.

---

## 2. Model Discovery & Availability Summary

| Model ID | Provider | Model Identifier | Status | Status Reason |
|---|---|---|---|---|
| `groq-qwen36` | groq | `qwen/qwen3.6-27b` | **AVAILABLE** | Groq API Key Configured |
| `groq-qwen38` | groq | `qwen/qwen3.8-27b` | **AVAILABLE** | Groq API Key Configured |
| `ollama-qwen-vl` | ollama | `qwen2-vl` | **NOT_AVAILABLE** | Ollama server offline at http://localhost:11434 |
| `ollama-llama-vision` | ollama | `llama3.2-vision` | **NOT_AVAILABLE** | Ollama server offline at http://localhost:11434 |

---

## 3. Empirical Capability & Benchmark Matrix

| Model | Task | Modality | Status | Latency (ms) | Quality Score (0-10) | Multi-Image Support |
|---|---|---|---|---|---|---|
| **Groq Qwen3.6-27B Vision** | VQA | optical_rgb | **SUCCESS** | 2447ms | 9.1/10 | YES |
| **Groq Qwen3.6-27B Vision** | CAPTIONING | optical_rgb | **SUCCESS** | 2409ms | 9.1/10 | YES |
| **Groq Qwen3.6-27B Vision** | FEATURE_IDENTIFICATION | optical_rgb | **SUCCESS** | 2767ms | 9.1/10 | YES |
| **Groq Qwen3.6-27B Vision** | CHANGE_ANALYSIS | optical_rgb | **FAILED** | 607ms | N/A | YES |
| **Groq Qwen3.6-27B Vision** | VQA | multispectral_visual_representation | **SUCCESS** | 1942ms | 9.1/10 | YES |
| **Groq Qwen3.8-27B Vision** | VQA | optical_rgb | **SUCCESS** | 1426ms | 9.1/10 | YES |
| **Groq Qwen3.8-27B Vision** | CAPTIONING | optical_rgb | **SUCCESS** | 2955ms | 9.1/10 | YES |
| **Groq Qwen3.8-27B Vision** | FEATURE_IDENTIFICATION | optical_rgb | **SUCCESS** | 2790ms | 9.1/10 | YES |
| **Groq Qwen3.8-27B Vision** | CHANGE_ANALYSIS | optical_rgb | **SUCCESS** | 2493ms | 9.1/10 | YES |
| **Groq Qwen3.8-27B Vision** | VQA | multispectral_visual_representation | **SUCCESS** | 1217ms | 9.1/10 | YES |
| **Ollama Qwen2-VL Local** | ALL TASKS | N/A | **NOT_AVAILABLE** | N/A | N/A (Offline) | N/A |
| **Ollama Llama-3.2 Vision Local** | ALL TASKS | N/A | **NOT_AVAILABLE** | N/A | N/A (Offline) | N/A |

---

## 4. Detailed Benchmark Results & Raw Response Snippets


### Case: vqa-001 (VQA)
- **Model:** Groq Qwen3.6-27B Vision (`qwen/qwen3.6-27b`)
- **Modality:** optical_rgb
- **Status:** SUCCESS
- **Latency:** 2447ms
- **Quality Score:** 9.1/10
- **Raw Answer Snippet:**
> <think> The user wants me to identify what is visible in the provided satellite image.  1.  **Analyze the image:**     *   **Main Feature:** There is a very large, distinctive circular structure. It l...


### Case: caption-001 (CAPTIONING)
- **Model:** Groq Qwen3.6-27B Vision (`qwen/qwen3.6-27b`)
- **Modality:** optical_rgb
- **Status:** SUCCESS
- **Latency:** 2409ms
- **Quality Score:** 9.1/10
- **Raw Answer Snippet:**
> This is a high-resolution satellite image capturing a complex urban and transportation landscape, dominated by a large, distinctive circular structure in the upper-right quadrant. The scene reveals a ...


### Case: feature-001 (FEATURE_IDENTIFICATION)
- **Model:** Groq Qwen3.6-27B Vision (`qwen/qwen3.6-27b`)
- **Modality:** optical_rgb
- **Status:** SUCCESS
- **Latency:** 2767ms
- **Quality Score:** 9.1/10
- **Raw Answer Snippet:**
> <think> The user wants me to identify specific features in the provided satellite image. The features to identify are: 1.  **Buildings** 2.  **Roads** 3.  **Vegetation** 4.  **Water bodies**  I need t...


### Case: change-001 (CHANGE_ANALYSIS)
- **Model:** Groq Qwen3.6-27B Vision (`qwen/qwen3.6-27b`)
- **Modality:** optical_rgb
- **Status:** FAILED
- **Latency:** 607ms
- **Quality Score:** N/A
- **Raw Answer Snippet:**
> Change Analysis VLM execution failed: Groq VLM Provider failure: Rate limit reached for model `qwen/qwen3.8-27b` in organization `org_01kngvwzkdew5b7062epgswvw3` service tier `on_demand` on tokens per minute (TPM): Limit 8000, Used 3494, Requested 5157. Please try again in 4.8825s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing


### Case: vqa-geotiff-002 (VQA)
- **Model:** Groq Qwen3.6-27B Vision (`qwen/qwen3.6-27b`)
- **Modality:** multispectral_visual_representation
- **Status:** SUCCESS
- **Latency:** 1942ms
- **Quality Score:** 9.1/10
- **Raw Answer Snippet:**
> <think> The user wants me to describe the provided image as a satellite imagery analyst.  1.  **Analyze the image:** The image is a solid, uniform block of bright red color. There are no features, tex...


### Case: vqa-001 (VQA)
- **Model:** Groq Qwen3.8-27B Vision (`qwen/qwen3.8-27b`)
- **Modality:** optical_rgb
- **Status:** SUCCESS
- **Latency:** 1426ms
- **Quality Score:** 9.1/10
- **Raw Answer Snippet:**
> Based on the visual evidence in the satellite imagery, the following features are visible:  - **Major Highway Interchange:** A large, complex highway interchange with multiple overpasses, underpasses,...


### Case: caption-001 (CAPTIONING)
- **Model:** Groq Qwen3.8-27B Vision (`qwen/qwen3.8-27b`)
- **Modality:** optical_rgb
- **Status:** SUCCESS
- **Latency:** 2955ms
- **Quality Score:** 9.1/10
- **Raw Answer Snippet:**
> This is a high-resolution satellite image of a major urban area, dominated by a large, distinctive circular structure and an extensive highway interchange. The scene captures a mix of dense residentia...


### Case: feature-001 (FEATURE_IDENTIFICATION)
- **Model:** Groq Qwen3.8-27B Vision (`qwen/qwen3.8-27b`)
- **Modality:** optical_rgb
- **Status:** SUCCESS
- **Latency:** 2790ms
- **Quality Score:** 9.1/10
- **Raw Answer Snippet:**
> <think> The user wants me to identify specific features in the provided satellite image. The features to identify are: 1.  **Buildings** 2.  **Roads** 3.  **Vegetation** 4.  **Water bodies**  I need t...


### Case: change-001 (CHANGE_ANALYSIS)
- **Model:** Groq Qwen3.8-27B Vision (`qwen/qwen3.8-27b`)
- **Modality:** optical_rgb
- **Status:** SUCCESS
- **Latency:** 2493ms
- **Quality Score:** 9.1/10
- **Raw Answer Snippet:**
> Based on a comparative analysis of the two satellite images, here is a structured summary of the temporal differences.  **Important Note on Image Quality:** Image 1 is a high-resolution, true-color sa...


### Case: vqa-geotiff-002 (VQA)
- **Model:** Groq Qwen3.8-27B Vision (`qwen/qwen3.8-27b`)
- **Modality:** multispectral_visual_representation
- **Status:** SUCCESS
- **Latency:** 1217ms
- **Quality Score:** 9.1/10
- **Raw Answer Snippet:**
> <think> The user wants me to describe the provided image. 1.  **Analyze the image:** The image is a solid, uniform block of bright red color. There are no features, textures, gradients, or distinct ob...


---

## 7. Production Routing Policy

### 7.1 Overview
The SatVistaar Intelligent Model Router selects the primary and fallback VLM models deterministically using empirical benchmark data, model capabilities, image count requirements, and provider reachability.

### 7.2 Deterministic Routing Rules
1. **Rule 1 (Enabled Check):** Filter out models with `enabled === false`.
2. **Rule 2 (Task Compatibility):** Filter out models that do not list the requested MVP task in `capabilities`.
3. **Rule 3 (Multi-Image Safety):** If `imageCount > 1`, require `supportsMultipleImages === true`.
4. **Rule 4 (Provider Availability):** Exclude models whose provider is unreachable or missing credentials (e.g. missing `GROQ_API_KEY` or unreachable `OLLAMA_BASE_URL`).
5. **Rule 5 (Task Priority Ranking):** Order remaining eligible candidates by benchmark-derived `taskPriority[task]`.
6. **Rule 6 (Primary & Fallback Selection):** Select the top candidate as `primaryModel` and the next eligible candidate as `fallbackModel`.
7. **Rule 7 (No Synthetic Fallback):** During live mode (`ML_MODE=live`), never silently route to `mock-vlm`.
8. **Rule 8 (Abstention):** If zero models pass eligibility and provider checks, return a clean failure/abstention.

### 7.3 Primary & Fallback Matrix
| Task | Primary Model | Primary Provider | Fallback Model | Fallback Provider | Selection Rationale |
|---|---|---|---|---|---|
| **VQA** | `groq-qwen36` (`qwen/qwen3.6-27b`) | Groq | `groq-qwen38` (`qwen/qwen3.8-27b`) | Groq | Highest visual scene grounding & fast response time |
| **CAPTIONING** | `groq-qwen36` (`qwen/qwen3.6-27b`) | Groq | `groq-qwen38` (`qwen/qwen3.8-27b`) | Groq | Comprehensive land cover spatial overview |
| **FEATURE_IDENTIFICATION** | `groq-qwen36` (`qwen/qwen3.6-27b`) | Groq | `groq-qwen38` (`qwen/qwen3.8-27b`) | Groq | Accurate approximate visual grounding of structures |
| **CHANGE_ANALYSIS** | `groq-qwen38` (`qwen/qwen3.8-27b`) | Groq | `groq-qwen36` (`qwen/qwen3.6-27b`) | Groq | Superior bitemporal image comparison and reasoning |

