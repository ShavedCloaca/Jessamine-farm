# Stage 1: Build & install production dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .

# Stage 2: Production execution environment
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app /app

# Switch to the unprivileged 'node' user (UID 1000) for hardening
USER node
EXPOSE 8080

CMD ["node", "server.js"]