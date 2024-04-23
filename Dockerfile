# Define base image
FROM node:lts-alpine AS builder

# Set working directory
WORKDIR /

# Copy package.json and .env
COPY package.json .env ./ server.js /public /views

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Define a slimmer runtime image
FROM node:lts-alpine AS runner

# Copy only production files
COPY 

# Expose ports (HTTP and Socket.io)
EXPOSE 3000

# Start the application (replace 'index.js' with your entry point)
CMD [ "node", "server.js" ]
