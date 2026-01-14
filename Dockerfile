# Multi-stage Dockerfile for Pong9 Server
# Builds the server and serves the static client files

# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install all dependencies (including dev dependencies for building)
RUN npm install

# Copy source files
COPY shared/ ./shared/
COPY server/ ./server/
COPY client/ ./client/

# Build all packages
RUN npm run build

# ===== Stage 2: Production =====
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files for production install
COPY package.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install production dependencies only
RUN npm install --omit=dev --workspace=server --workspace=shared

# Copy built artifacts from builder stage
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/*.js ./shared/
COPY --from=builder /app/shared/*.d.ts ./shared/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=2567

# Expose the Colyseus server port
EXPOSE 2567

# Start the server
CMD ["node", "--enable-source-maps", "server/dist/main.js"]
