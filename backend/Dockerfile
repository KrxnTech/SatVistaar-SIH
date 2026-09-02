FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production \
    PORT=5000 \
    UPLOAD_DIR=uploads

WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

# Copy package definition files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source code and configuration
COPY src ./src

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

# Expose backend port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Start the Node.js Express server
CMD ["node", "src/server.js"]
