import os
import numpy as np
import cv2

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)

# 1. Urban Satellite Scene (Buildings, asphalt streets, concrete pavement, high edge density)
urban_img = np.full((512, 512, 3), (115, 115, 115), dtype=np.uint8) # Neutral concrete pavement (R=G=B=115)

# Draw asphalt road grid (dark gray lines)
for x in range(0, 512, 64):
    cv2.line(urban_img, (x, 0), (x, 512), (45, 45, 45), 10)
for y in range(0, 512, 64):
    cv2.line(urban_img, (0, y), (512, y), (45, 45, 45), 10)

# Draw rectangular buildings with high contrast edges and rooftop structures
np.random.seed(42)
for bx in range(12, 500, 64):
    for by in range(12, 500, 64):
        w = np.random.randint(34, 48)
        h = np.random.randint(34, 48)
        # Rooftop color (medium-bright neutral or terracotta)
        roof_color = (
            np.random.randint(140, 200),
            np.random.randint(140, 200),
            np.random.randint(140, 200)
        )
        cv2.rectangle(urban_img, (bx, by), (bx + w, by + h), roof_color, -1)
        cv2.rectangle(urban_img, (bx, by), (bx + w, by + h), (25, 25, 25), 2) # sharp roof border
        # Rooftop HVAC / mechanical structures
        cv2.rectangle(urban_img, (bx + 6, by + 6), (bx + 14, by + 14), (75, 75, 75), -1)

# Add fine high-frequency noise typical of urban built structures
noise = np.random.normal(0, 8, (512, 512, 3)).astype(np.int16)
urban_noisy = np.clip(urban_img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
urban_path = os.path.join(uploads_dir, "test_urban_scene.png")
cv2.imwrite(urban_path, urban_noisy)
print(f"Created: {urban_path}")

# 2. River Scene (Curving water body through vegetated flood plain)
river_img = np.zeros((512, 512, 3), dtype=np.uint8)
# Lush vegetation background (High green: B=35, G=150, R=45)
for y in range(512):
    for x in range(512):
        g = np.random.randint(130, 175)
        r = np.random.randint(30, 55)
        b = np.random.randint(25, 50)
        river_img[y, x] = (b, g, r)

# Draw wide river channel down the middle: B=170, G=110, R=35
pts = np.array([
    [180, 0], [220, 100], [260, 200], [240, 300], [300, 400], [330, 512],
    [410, 512], [380, 400], [320, 300], [340, 200], [300, 100], [260, 0]
], np.int32)
cv2.fillPoly(river_img, [pts], (170, 110, 35))
# Smooth the river to reflect calm water physics
river_img = cv2.GaussianBlur(river_img, (3, 3), 0)

river_path = os.path.join(uploads_dir, "test_river_scene.png")
cv2.imwrite(river_path, river_img)
print(f"Created: {river_path}")
