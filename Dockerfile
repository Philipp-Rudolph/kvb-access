FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including dev dependencies
RUN npm install
RUN npm install @rollup/rollup-linux-arm64-musl

# Copy the rest of your app files
COPY package*.json ./
COPY src ./src
COPY public ./public

EXPOSE 8080

# Ensure Vite is installed and use npm to run dev
CMD ["npx", "vite"]
