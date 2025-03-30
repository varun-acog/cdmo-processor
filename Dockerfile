# Use official Node.js 20 slim image as base
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies for pdf-parse and faiss-node
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package.json .
COPY package-lock.json* .

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose port (optional for API, not required for CLI)
EXPOSE 3000

# Default command for the container
CMD ["npm", "run", "cli", "--", "--help"]
