FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PREPROCESSING_PORT=5001

WORKDIR /app

# Install system dependencies (curl for healthcheck, libexpat1 & libgomp1 for rasterio/numpy)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    libexpat1 \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY app.py metadata_extractor.py ./

# Create uploads directory placeholder for shared volume mount
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 5001

# Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Start Flask preprocessing microservice
CMD ["python", "app.py"]
