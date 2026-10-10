# ── Stage 1: Build the C parser ──────────────────────────────────────────────
FROM node:18-bullseye-slim AS builder

# Install build tools (flex, bison, gcc, make)
RUN apt-get update && apt-get install -y --no-install-recommends \
    flex bison gcc make \
    && rm -rf /var/lib/apt/lists/*

# Copy parser source and compile
WORKDIR /app/parser
COPY parser/ .
RUN make clean && make

# ── Stage 2: Runtime (Node.js backend) ───────────────────────────────────────
FROM node:18-bullseye-slim

WORKDIR /app

# Copy compiled parser binary from builder stage
COPY --from=builder /app/parser /app/parser

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Expose port (Render injects $PORT)
EXPOSE 5000

# Start the server
CMD ["node", "backend/src/server.js"]
