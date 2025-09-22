# Multi-stage build for AquaAlert
FROM node:18-alpine as base

# Install dependencies for both backend and frontend
RUN apk add --no-cache git

# Backend Stage
FROM base as backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Frontend Build Stage
FROM base as frontend-build
WORKDIR /app
COPY package*.json ./
COPY vite.config.js ./
COPY postcss.config.cjs ./
COPY tailwind.config.js ./
COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm ci && npm run build

# Production Stage
FROM node:18-alpine as production
RUN apk add --no-cache dumb-init
WORKDIR /app

# Copy backend dependencies and code
COPY --from=backend /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-build /app/dist ./frontend/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S aquaalert -u 1001
RUN chown -R aquaalert:nodejs /app
USER aquaalert

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({port:3001,path:'/health'},r=>process.exit(r.statusCode===200?0:1)).end()"

# Start the application
CMD ["dumb-init", "node", "backend/server.js"]