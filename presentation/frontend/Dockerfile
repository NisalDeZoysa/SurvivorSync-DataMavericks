# Use Node.js image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the Vite dev server port
EXPOSE 8080

# Start the dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
