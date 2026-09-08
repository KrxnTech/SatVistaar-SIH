import os
import numpy as np
from PIL import Image

def compute_ndwi(image_path, threshold=0.0):
    """
    Computes Normalized Difference Water Index (NDWI) on satellite imagery.
    Formula: NDWI = (Green - NIR) / (Green + NIR)
    
    Supports:
    - 4-channel multispectral images (R, G, B, NIR)
    - 3-channel RGB imagery (using NIR estimation heuristic)
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image path does not exist: {image_path}")

    with Image.open(image_path) as img:
        img_arr = np.array(img).astype(np.float32)

    if img_arr.ndim < 2:
        raise ValueError("Invalid image dimensions for NDWI calculation.")

    # 4-channel (multispectral) vs 3-channel (RGB) handling
    if img_arr.ndim == 3 and img_arr.shape[2] >= 4:
        # Standard GeoTIFF / Multispectral: Green = Channel 1, NIR = Channel 3 (0-indexed)
        green = img_arr[:, :, 1]
        nir = img_arr[:, :, 3]
    elif img_arr.ndim == 3 and img_arr.shape[2] == 3:
        # RGB Approximation: Green = Channel 1, Synthetic NIR = (Red + Blue) / 2
        red = img_arr[:, :, 0]
        green = img_arr[:, :, 1]
        blue = img_arr[:, :, 2]
        nir = (red * 0.6 + blue * 0.4)
    else:
        # Grayscale / Single channel
        green = img_arr if img_arr.ndim == 2 else img_arr[:, :, 0]
        nir = green * 0.8

    # Prevent divide by zero
    denominator = green + nir
    denominator[denominator == 0] = 1e-6

    ndwi = (green - nir) / denominator
    
    # Binary water mask (NDWI > threshold)
    water_mask = (ndwi > threshold)
    
    total_pixels = int(ndwi.size)
    water_pixels = int(np.sum(water_mask))
    water_percentage = round((water_pixels / total_pixels) * 100, 2)
    mean_ndwi = float(np.mean(ndwi))
    max_ndwi = float(np.max(ndwi))
    min_ndwi = float(np.min(ndwi))

    return {
        "waterPercentage": water_percentage,
        "waterPixelCount": water_pixels,
        "totalPixelCount": total_pixels,
        "meanNdwi": round(mean_ndwi, 4),
        "maxNdwi": round(max_ndwi, 4),
        "minNdwi": round(min_ndwi, 4),
        "thresholdUsed": threshold,
        "isWaterPresent": water_percentage > 1.0,
        "waterMaskSummary": {
            "height": int(ndwi.shape[0]),
            "width": int(ndwi.shape[1]),
            "coverageCategory": (
                "High" if water_percentage > 30.0 else
                "Moderate" if water_percentage > 10.0 else
                "Low" if water_percentage > 1.0 else "Negligible"
            )
        }
    }
