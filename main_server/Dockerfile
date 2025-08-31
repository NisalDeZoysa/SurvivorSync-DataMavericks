# Stage 1: Build
FROM node:22 AS build

# Set working directory
WORKDIR /app

# Copy package*.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy built application from build stage
COPY --from=build /app/dist .

# Expose port 7000
EXPOSE 7000

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]