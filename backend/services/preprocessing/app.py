import os
import sys
from flask import Flask, request, jsonify
from metadata_extractor import extract_metadata

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "satquery-preprocessing-python"
    }), 200

@app.route("/metadata", methods=["POST"])
def get_metadata():
    try:
        data = request.get_json(force=True, silent=True)
        if not data or "filePath" not in data:
            return jsonify({
                "success": False,
                "error": {
                    "code": "MISSING_FILE_PATH",
                    "message": "filePath parameter is required"
                }
            }), 400

        file_path = data["filePath"]

        if not os.path.exists(file_path):
            return jsonify({
                "success": False,
                "error": {
                    "code": "FILE_NOT_FOUND",
                    "message": f"File does not exist: {file_path}"
                }
            }), 404

        metadata = extract_metadata(file_path)

        return jsonify({
            "success": True,
            "data": metadata
        }), 200

    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": {
                "code": "FILE_NOT_FOUND",
                "message": str(e)
            }
        }), 404

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": {
                "code": "UNREADABLE_RASTER",
                "message": str(e)
            }
        }), 400

    except Exception as e:
        return jsonify({
            "success": False,
            "error": {
                "code": "PREPROCESSING_ERROR",
                "message": str(e)
            }
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PREPROCESSING_PORT", 5001))
    print(f"Python Preprocessing Service running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
