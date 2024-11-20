
# Explanation of Dockerfile and docker-compose.yml

This document explains the purpose and functionality of the `Dockerfile` and `docker-compose.yml` used in this project.

## Dockerfile Explanation

### Client Dockerfile

```Dockerfile
# Step 1: Use an official Node.js image
FROM node:20-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the application files
COPY . .

# Step 6: Expose the port React dev server will use
EXPOSE 5173

# Step 7: Start the React development server
CMD ["npm", "run", "dev"]
```

1. **`FROM node:20-alpine`**: Specifies the base image for the client. The Alpine version is lightweight and suitable for production.
2. **`WORKDIR /app`**: Sets the working directory inside the container to `/app`.
3. **`COPY package*.json ./`**: Copies `package.json` and `package-lock.json` to the working directory.
4. **`RUN npm install`**: Installs the dependencies specified in `package.json`.
5. **`COPY . .`**: Copies the remaining application files into the container.
6. **`EXPOSE 5173`**: Exposes port `5173`, the default port for Vite development server.
7. **`CMD ["npm", "run", "dev"]`**: Runs the Vite development server.

### Server Dockerfile

```Dockerfile
# Step 1: Use an official Node.js image
FROM node:20-alpine

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --production

# Step 5: Copy all application files (including src directory)
COPY . .

# Step 6: Expose the server's port
EXPOSE 3001

# Step 7: Start the server with the correct entry point
CMD ["node", "server.mjs"]
```

1. **`FROM node:20-alpine`**: Specifies the base image for the server, lightweight and optimized for production.
2. **`WORKDIR /usr/src/app`**: Sets the working directory inside the container to `/usr/src/app`.
3. **`COPY package*.json ./`**: Copies `package.json` and `package-lock.json` to the working directory.
4. **`RUN npm install --production`**: Installs only the production dependencies.
5. **`COPY . .`**: Copies the remaining application files into the container.
6. **`EXPOSE 3001`**: Exposes port `3001` for the backend server.
7. **`CMD ["node", "server.mjs"]`**: Starts the backend server.

## docker-compose.yml Explanation

```yaml
services:
  client:
    image: yannvillellas/polito-se2-24-20-kiruna-explorer:client
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "5173:5173"

  server:
    image: yannvillellas/polito-se2-24-20-kiruna-explorer:server
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    volumes:
      - ./server/src/database:/usr/src/app/src/database
    environment:
      NODE_ENV: production
      DB_PATH: /usr/src/app/src/database/database.db
```

### Services

- **Client**:
  - **`image`**: Specifies the Docker image for the client.
  - **`ports`**: Maps the container port `5173` to the host's port `5173`.
- **Server**:
  - **`image`**: Specifies the Docker image for the server.
  - **`ports`**: Maps the container port `3001` to the host's port `3001`.
  - **`volumes`**: Maps the host's `./server/src/database` to the container's `/usr/src/app/src/database` for SQLite persistence. This volume will have to be removed if the database is hosted externally in a production environment.
  - **`environment`**: Configures environment variables for the server, including `NODE_ENV` and `DB_PATH`.
