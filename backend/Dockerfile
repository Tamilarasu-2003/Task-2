# Use Node.js as the base image
FROM node:20.17.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port (change as needed)
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
