# Stage 1: Build the production app
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and lock file to install dependencies
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of your app files
COPY . . 

# Build the app for production
RUN npm run build

# Stage 2: Serve the production app with NGINX
FROM nginx:stable-alpine AS production

# Copy the custom NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the production build from the builder stage (dist folder)
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to serve the app
EXPOSE 80

# Default command to run NGINX
CMD ["nginx", "-g", "daemon off;"]
