# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the application files
COPY . .

# Expose port 3000 for the Node.js server
EXPOSE 3000

# Start the Node.js application
CMD ["node", "app.js"]
