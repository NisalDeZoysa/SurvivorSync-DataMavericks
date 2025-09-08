# Use Node.js LTS image
FROM node:22

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Expose backend port (your Express app listens on 7000)
EXPOSE 7000

# Start the Express server
CMD ["npm", "start"]
