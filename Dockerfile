# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then npm install --production; else npm install; fi

# Copy the entire project to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 3000

# Start the application
CMD [ "node", "src/app.js" ]
