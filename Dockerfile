FROM ubuntu:22.04

# Install toolchain and Node.js
RUN apt-get update && apt-get install -y \
    build-essential \
    flex \
    bison \
    make \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy repository content
COPY . .

# Build parser binary
RUN cd parser && make clean && make

# Install backend & frontend packages
RUN cd backend && npm install
RUN cd frontend && npm install && npm run build

EXPOSE 3000 5000

CMD ["sh", "-c", "node backend/src/server.js & npm --prefix frontend run dev -- --host"]
