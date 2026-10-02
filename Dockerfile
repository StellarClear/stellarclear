# Multi-stage Docker build for StellarClear services
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and TypeScript configurations
COPY package*.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY services/ ./services/

# Install dependencies and compile all packages & services
RUN npm ci
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy compiled artifacts, node_modules, and manifests from builder
COPY --from=builder /app ./

# Default exposed port for API service
EXPOSE 3000

# Default command starts the REST API service
CMD ["node", "services/api/dist/main.js"]
