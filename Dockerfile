# Use Node.js 22.12+ (latest LTS)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend_ndi_2025/package*.json ./frontend_ndi_2025/
COPY backend_ndi_2025/package*.json ./backend_ndi_2025/

# Install dependencies
RUN cd frontend_ndi_2025 && npm ci
RUN cd backend_ndi_2025 && npm ci

# Copy all source files
COPY frontend_ndi_2025 ./frontend_ndi_2025
COPY backend_ndi_2025 ./backend_ndi_2025

# Build frontend
RUN cd frontend_ndi_2025 && npm run build

# Build backend
RUN cd backend_ndi_2025 && npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "backend_ndi_2025/dist/main.js"]
