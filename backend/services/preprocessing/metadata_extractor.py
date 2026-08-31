import os
import rasterio
from PIL import Image

def extract_metadata(file_path: str) -> dict:
    """
    Extracts geospatial & raster metadata from an image file using rasterio / PIL.
    
    Returns structured metadata object according to SatQuery contract specifications.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    warnings = []

    # 1. Attempt extraction using rasterio (ideal for GeoTIFF / TIFF)
    try:
        with rasterio.open(file_path) as src:
            width = src.width
            height = src.height
            bands = src.count
            driver_format = src.driver or "GTiff"

            # CRS extraction
            crs_str = None
            if src.crs:
                crs_str = src.crs.to_string()

            # Georeferencing & bounds
            is_georeferenced = False
            bounds_dict = None
            transform_list = None

            if src.crs and src.bounds:
                is_georeferenced = True
                bounds_dict = {
                    "left": float(src.bounds.left),
                    "bottom": float(src.bounds.bottom),
                    "right": float(src.bounds.right),
                    "top": float(src.bounds.top)
                }

            if src.transform:
                # Store affine matrix elements [a, b, c, d, e, f]
                t = src.transform
                transform_list = [float(t.a), float(t.b), float(t.c), float(t.d), float(t.e), float(t.f)]

            # Timestamp extraction from tags
            timestamp = None
            tags = src.tags()
            if "TIFFTAG_DATETIME" in tags:
                timestamp = tags["TIFFTAG_DATETIME"]
            elif "DATETIME" in tags:
                timestamp = tags["DATETIME"]

            if not is_georeferenced or not crs_str:
                warnings.append("CRS information is not available for this image.")

            return {
                "format": driver_format,
                "width": width,
                "height": height,
                "bands": bands,
                "crs": crs_str,
                "bounds": bounds_dict,
                "transform": transform_list,
                "timestamp": timestamp,
                "modality": None, # Never inferred from filename
                "isGeoreferenced": is_georeferenced,
                "warnings": warnings
            }
    except Exception as rasterio_err:
        # Fallback to PIL for standard web imagery (PNG/JPEG)
        try:
            with Image.open(file_path) as img:
                width, height = img.size
                mode = img.mode
                # Map mode to band count
                mode_band_map = {"RGB": 3, "RGBA": 4, "L": 1, "P": 1, "1": 1, "CMYK": 4}
                bands = mode_band_map.get(mode, len(img.getbands()) if hasattr(img, "getbands") else 3)
                img_format = img.format or os.path.splitext(file_path)[1].replace(".", "").upper()

                warnings.append("CRS information is not available for this image.")

                return {
                    "format": img_format,
                    "width": width,
                    "height": height,
                    "bands": bands,
                    "crs": None,
                    "bounds": None,
                    "transform": None,
                    "timestamp": None,
                    "modality": None,
                    "isGeoreferenced": False,
                    "warnings": warnings
                }
        except Exception as pil_err:
            raise ValueError(f"Failed to read image raster data: {str(rasterio_err)} / {str(pil_err)}")
