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

            # Resolution & Datatype & NoData
            resolution = None
            if hasattr(src, "res") and src.res and src.res[0] is not None:
                resolution = f"{abs(float(src.res[0])):.1f} m"

            datatype = src.dtypes[0] if hasattr(src, "dtypes") and src.dtypes else None
            nodata_val = src.nodata if hasattr(src, "nodata") else None

            # Polarization & Sensor Platform tags
            polarization = None
            sensor = None
            tags = src.tags()
            tags_lower = {k.lower(): str(v) for k, v in tags.items()}

            for pol_key in ["polarization", "polarisation", "polarization_channels", "radar_polarization", "pols"]:
                if pol_key in tags_lower:
                    polarization = tags_lower[pol_key].upper()
                    break

            if not polarization:
                # Check for VV/VH or HH/HV in tag values
                combined_tag_str = " ".join(tags_lower.values()).upper()
                if "VV+VH" in combined_tag_str or ("VV" in combined_tag_str and "VH" in combined_tag_str):
                    polarization = "VV / VH (Dual-pol)"
                elif "HH+HV" in combined_tag_str or ("HH" in combined_tag_str and "HV" in combined_tag_str):
                    polarization = "HH / HV (Dual-pol)"
                elif "VV" in combined_tag_str:
                    polarization = "VV (Single-pol)"
                elif "HH" in combined_tag_str:
                    polarization = "HH (Single-pol)"

            for sensor_key in ["satellite", "spacecraft_name", "platform", "mission", "mission_name", "sensor_id"]:
                if sensor_key in tags_lower:
                    sensor = tags_lower[sensor_key]
                    break

            # Timestamp extraction from tags
            timestamp = None
            if "TIFFTAG_DATETIME" in tags:
                timestamp = tags["TIFFTAG_DATETIME"]
            elif "DATETIME" in tags:
                timestamp = tags["DATETIME"]

            if not is_georeferenced or not crs_str:
                warnings.append("CRS information is not available for this image.")

            # Modality hint if detectable from sensor/bands
            modality_hint = None
            if sensor:
                s_up = sensor.upper()
                if any(k in s_up for k in ["SENTINEL-1", "S1", "RISAT", "TERRASAR", "ALOS", "RADARSAT"]):
                    modality_hint = "SAR"
                elif any(k in s_up for k in ["SENTINEL-2", "S2", "LANDSAT", "SPOT", "PLANET"]):
                    modality_hint = "OPTICAL"
            if not modality_hint and polarization:
                modality_hint = "SAR"

            return {
                "format": driver_format,
                "width": width,
                "height": height,
                "bands": bands,
                "crs": crs_str,
                "bounds": bounds_dict,
                "transform": transform_list,
                "resolution": resolution,
                "datatype": str(datatype) if datatype else None,
                "nodata": nodata_val,
                "polarization": polarization,
                "sensor": sensor,
                "timestamp": timestamp,
                "modality": modality_hint,
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
                    "resolution": None,
                    "datatype": str(mode),
                    "nodata": None,
                    "polarization": None,
                    "sensor": None,
                    "timestamp": None,
                    "modality": None,
                    "isGeoreferenced": False,
                    "warnings": warnings
                }
        except Exception as pil_err:
            raise ValueError(f"Failed to read image raster data: {str(rasterio_err)} / {str(pil_err)}")
