import os
import sys
from flask import Flask, request, jsonify

from water_detector import compute_ndwi
from change_detector import detect_changes
from rs_vlm import rs_vlm_engine, safe_resolve_path
from fusion_analyzer import fusion_engine
from roi_analyzer import roi_engine
from geoint_analyzer import geoint_engine
from disaster_analyzer import disaster_engine

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "satquery-ml-inference-python",
        "device": rs_vlm_engine.device,
        "isVlmLoaded": rs_vlm_engine.is_loaded
    }), 200

@app.route("/predict/vqa", methods=["POST"])
def vqa_predict():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_JSON", "message": "JSON body is required"}
            }), 400

        prompt = data.get("prompt", "What is visible in this satellite image?")
        image_paths = data.get("imagePaths", [])

        if not image_paths or not isinstance(image_paths, list):
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_IMAGE_PATHS", "message": "imagePaths list is required"}
            }), 400

        result = rs_vlm_engine.analyze_vqa(image_paths, prompt)
        first_img = safe_resolve_path(image_paths[0]) if image_paths else None
        grounding = rs_vlm_engine.analyze_grounding(first_img, prompt)
        boxes = grounding.get("groundingBoxes", [])
        result["groundingBoxes"] = boxes
        result["boundingBoxes"] = boxes
        result["bounding_boxes"] = boxes

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": {"code": "FILE_NOT_FOUND", "message": str(e)}
        }), 404
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": {"code": "INVALID_INPUT", "message": str(e)}
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {"code": "VQA_INFERENCE_ERROR", "message": str(e)}
        }), 500

@app.route("/predict/ndwi", methods=["POST"])
def ndwi_predict():
    try:
        data = request.get_json(force=True, silent=True)
        if not data or "imagePath" not in data:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_IMAGE_PATH", "message": "imagePath parameter is required"}
            }), 400

        image_path = data["imagePath"]
        threshold = float(data.get("threshold", 0.0))

        result = compute_ndwi(image_path, threshold=threshold)
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": {"code": "FILE_NOT_FOUND", "message": str(e)}
        }), 404
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": {"code": "UNREADABLE_IMAGE", "message": str(e)}
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {"code": "NDWI_ERROR", "message": str(e)}
        }), 500

@app.route("/predict/change", methods=["POST"])
def change_predict():
    try:
        data = request.get_json(force=True, silent=True)
        if not data or "imagePath1" not in data or "imagePath2" not in data:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_IMAGE_PATHS", "message": "imagePath1 and imagePath2 are required"}
            }), 400

        image_path_1 = data["imagePath1"]
        image_path_2 = data["imagePath2"]
        threshold = int(data.get("threshold", 30))
        min_area = int(data.get("minArea", 500))

        prompt = data.get("query", data.get("prompt", ""))
        result = detect_changes(image_path_1, image_path_2, threshold=threshold, min_area=min_area, query=prompt)
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": {"code": "FILE_NOT_FOUND", "message": str(e)}
        }), 404
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": {"code": "UNREADABLE_IMAGE", "message": str(e)}
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {"code": "CHANGE_DETECTION_ERROR", "message": str(e)}
        }), 500

@app.route("/predict/fusion", methods=["POST"])
def fusion_predict():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_JSON", "message": "JSON body is required"}
            }), 400

        optical_path = data.get("opticalImagePath", data.get("imagePath1", ""))
        sar_path = data.get("sarImagePath", data.get("imagePath2", ""))
        query = data.get("query", data.get("prompt", "Analyze optical and SAR features together"))
        mode = data.get("mode", None)

        if not optical_path or not sar_path:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_FUSION_PATHS", "message": "Both opticalImagePath and sarImagePath are required"}
            }), 400

        result = fusion_engine.analyze_fusion(optical_path, sar_path, query=query, requested_mode=mode)
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": {"code": "FILE_NOT_FOUND", "message": str(e)}
        }), 404
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": {"code": "INVALID_INPUT", "message": str(e)}
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {"code": "FUSION_ANALYSIS_ERROR", "message": str(e)}
        }), 500

@app.route("/predict/roi", methods=["POST"])
def roi_predict():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_JSON", "message": "JSON body is required"}
            }), 400

        image_paths = data.get("imagePaths", [])
        if not image_paths and "imagePath" in data:
            image_paths = [data["imagePath"]]

        if not image_paths:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_IMAGE_PATHS", "message": "imagePaths list is required"}
            }), 400

        roi_data = data.get("roi", {})
        query = data.get("query", data.get("prompt", "Analyze selected area"))
        task = data.get("task", "VQA")
        metadata = data.get("metadata", {})

        result = roi_engine.analyze_roi(image_paths, roi_data, query=query, task=task, metadata=metadata)
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": {"code": "FILE_NOT_FOUND", "message": str(e)}
        }), 404
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": {"code": "INVALID_INPUT", "message": str(e)}
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {"code": "ROI_ANALYSIS_ERROR", "message": str(e)}
        }), 500

@app.route("/predict/geoint", methods=["POST"])
def geoint_predict():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_JSON", "message": "JSON body is required"}
            }), 400

        task = str(data.get("task", "ALL")).upper()
        roi_data = data.get("roi", {})
        query = data.get("query", "")
        observations = data.get("observations", [])
        image_paths = data.get("imagePaths", [])
        metadata = data.get("metadata", {})

        # If observations not provided directly, synthesize from imagePaths and timestamps
        if not observations and image_paths:
            timestamps = data.get("timestamps", [])
            for idx, p in enumerate(image_paths):
                t_str = timestamps[idx] if idx < len(timestamps) else f"Epoch-{idx+1}"
                modality = "SAR" if any(kw in p.lower() for kw in ["sar", "s1", "radar"]) else "Optical"
                observations.append({
                    "path": p,
                    "date": t_str,
                    "sensor": "Sentinel-1 SAR" if modality == "SAR" else "Sentinel-2 MSI",
                    "modality": modality
                })

        result = {}

        # 1. Time-Series Analysis
        if task in ["TIME_SERIES", "ALL", "TIMELINE"]:
            if len(observations) >= 2:
                result["timeSeries"] = geoint_engine.analyze_timeseries(observations, roi_geometry=roi_data, query=query)
            elif len(image_paths) >= 2:
                obs_list = [{"path": p, "date": f"Epoch-{i+1}"} for i, p in enumerate(image_paths)]
                result["timeSeries"] = geoint_engine.analyze_timeseries(obs_list, roi_geometry=roi_data, query=query)

        # 2. Flood Extent & Impact Analysis
        if task in ["FLOOD_ANALYSIS", "FLOOD", "ALL"]:
            pre_p = image_paths[0] if len(image_paths) > 0 else (observations[0]["path"] if observations else None)
            post_p = image_paths[1] if len(image_paths) > 1 else (observations[1]["path"] if len(observations) > 1 else pre_p)
            post_sar_p = data.get("postSarPath") or (image_paths[2] if len(image_paths) > 2 else None)
            if pre_p and post_p:
                result["flood"] = geoint_engine.analyze_flood(pre_p, post_p, post_sar_path=post_sar_p, roi_geometry=roi_data, metadata=metadata)

        # 3. Land-Cover Change Matrix
        if task in ["CHANGE_MATRIX", "MATRIX", "ALL"]:
            pre_p = image_paths[0] if len(image_paths) > 0 else (observations[0]["path"] if observations else None)
            post_p = image_paths[1] if len(image_paths) > 1 else (observations[1]["path"] if len(observations) > 1 else pre_p)
            if pre_p and post_p:
                result["changeMatrix"] = geoint_engine.analyze_change_matrix(pre_p, post_p, roi_geometry=roi_data, metadata=metadata)

        # 4. Optical vs SAR Difference Explorer
        if task in ["OPTICAL_SAR_DIFFERENCE", "DIFF", "OPTICAL_SAR_DIFF", "ALL"]:
            opt_p = data.get("opticalPath") or (image_paths[0] if len(image_paths) > 0 else None)
            sar_p = data.get("sarPath") or (image_paths[1] if len(image_paths) > 1 else None)
            if opt_p and sar_p:
                result["opticalSarDiff"] = geoint_engine.analyze_optical_sar_diff(opt_p, sar_p, roi_geometry=roi_data, metadata=metadata)

        # 5. Object Inventory
        if task in ["OBJECT_INVENTORY", "INVENTORY", "OBJECTS", "ALL"]:
            target_p = image_paths[0] if len(image_paths) > 0 else (observations[0]["path"] if observations else None)
            filter_cat = data.get("filterCategory", "all")
            min_conf = float(data.get("minConfidence", 0.60))
            if target_p:
                result["objectInventory"] = geoint_engine.analyze_object_inventory(target_p, roi_geometry=roi_data, filter_category=filter_cat, min_confidence=min_conf, metadata=metadata)

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": {"code": "FILE_NOT_FOUND", "message": str(e)}
        }), 404
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": {"code": "INVALID_INPUT", "message": str(e)}
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {"code": "GEOINT_ANALYSIS_ERROR", "message": str(e)}
        }), 500


@app.route("/predict/disaster", methods=["POST"])
def disaster_predict():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_JSON", "message": "JSON body is required"}
            }), 400

        disaster_type = data.get("disasterType", "Flood")
        pre_path = data.get("preImagePath", None)
        post_path = data.get("postImagePath", None)
        sar_path = data.get("sarImagePath", None)
        post_sar_path = data.get("postSarImagePath", None)

        # Fallback extraction from imagePaths array if individual paths omitted
        image_paths = data.get("imagePaths", [])
        if image_paths:
            if not pre_path and len(image_paths) >= 2:
                pre_path = image_paths[0]
                post_path = image_paths[1]
            elif not post_path and len(image_paths) >= 1:
                post_path = image_paths[0]
                pre_path = image_paths[0]

        roi_data = data.get("roi", {})
        event_details = data.get("eventDetails", {})
        sensor_metadata = data.get("sensorMetadata", {})
        query = data.get("query", "")

        result = disaster_engine.analyze_disaster(
            disaster_type=disaster_type,
            pre_image_path=pre_path,
            post_image_path=post_path,
            sar_image_path=sar_path,
            post_sar_image_path=post_sar_path,
            roi_geometry=roi_data,
            event_details=event_details,
            sensor_metadata=sensor_metadata,
            query=query
        )

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": {"code": "FILE_NOT_FOUND", "message": str(e)}
        }), 404
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": {"code": "INVALID_INPUT", "message": str(e)}
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {"code": "DISASTER_ANALYSIS_ERROR", "message": str(e)}
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("ML_INFERENCE_PORT", 5002))
    print(f"Python ML Inference Service running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
