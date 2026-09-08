import os
import sys
from flask import Flask, request, jsonify

from water_detector import compute_ndwi
from change_detector import detect_changes
from rs_vlm import rs_vlm_engine, safe_resolve_path

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

if __name__ == "__main__":
    port = int(os.environ.get("ML_INFERENCE_PORT", 5002))
    print(f"Python ML Inference Service running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
