# Step 1: Use official Node.js image to build the App
FROM node:18 AS build 

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the source code
COPY . .

# Step 6: Build the App for production
RUN npm run build

# Step 7: Use official Nginx image to serve the App
FROM nginx:alpine

# Step 8: Copy the build output to the Nginx server
COPY --from=build /app/dist /usr/share/nginx/html

# Step 9: Expose the port
EXPOSE 80

# Step 10: Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]