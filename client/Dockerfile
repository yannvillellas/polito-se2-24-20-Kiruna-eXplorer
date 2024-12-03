# Step 1: Use an official Node.js image
FROM node:20-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --timeout=600000

# Step 5: Copy the application files
COPY . .

# Step 6: Expose the port React dev server will use
EXPOSE 5173

# Step 7: Start the React development server
CMD ["npm", "run", "dev"]
