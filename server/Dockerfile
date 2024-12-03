# Step 1: Use an official Node.js image
FROM node:20-alpine

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy all application files (including src directory)
COPY . .

# Step 6: Expose the server's port
EXPOSE 3001

# Step 7: Start the server with the correct entry point
CMD ["node", "server.mjs"]
