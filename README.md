
# Running the Project with Docker or Locally

This document explains how to run the project using Docker images and containers, as well as how to start the app locally without Docker.

## Run the application

### Method 1 (with Docker): Pull and Run Images Individually

#### Steps for 'docker pull' method

1. Pull the images:

   ```bash
   docker pull yannvillellas/polito-se2-24-20-kiruna-explorer:client
   docker pull yannvillellas/polito-se2-24-20-kiruna-explorer:server
   ```

1. Run the containers:

   ```bash
   docker run -d -p 5173:5173 yannvillellas/polito-se2-24-20-kiruna-explorer:client
   docker run -d -p 3001:3001 yannvillellas polito-se2-24-20-kiruna-explorer:server
   ```

### Method 2 (with Docker): Clone Repository and Build Images

#### Steps for 'docker-compose' method

1. Clone the repository:

   ```bash
   git clone https://github.com/yannvillellas/polito-se2-24-20-kiruna-explorer.git
   ```

1. Navigate to the project directory and use `docker-compose` to build and run the services:

   ```bash
   cd polito-se2-24-20-kiruna-explorer
   docker-compose up --build
   ```

### Method 3 (without Docker): Run Locally

#### Prerequisites

- Ensure that [Node.js](https://nodejs.org/) is installed on your system.

#### Clone the Repository

1. Clone the repository:

   ```bash
   git clone https://github.com/yannvillellas/polito-se2-24-20-kiruna-explorer.git
   ```

1. Navigate to the project directory:

   ```bash
   cd polito-se2-24-20-kiruna-explorer
   ```

#### Steps to Start the Backend

1. Navigate to the `server` directory:

   ```bash
   cd server
   ```

1. Install the dependencies:

   ```bash
   npm install
   ```

1. Start the backend server:

   ```bash
   npm start
   ```

#### Steps to Start the Frontend

1. Open a new terminal window.

1. Navigate to the `client` directory:

   ```bash
   cd client
   ```

1. Install the dependencies:

   ```bash

   npm install
   ```

1. Start the frontend application:

   ```bash
   npm run dev
   ```

## Accessing the Application on Localhost

### Access the Frontend

- Open a browser and navigate to [http://localhost:5173](http://localhost:5173).
- This will open the React-based frontend application.
- If you want to connnect as an urban planner, you can use the following credentials:
  - username:

      ```bash
      user1
      ```

  - password:
  
      ```bash
      password1
      ```

### Access the Backend API

- To interact with the backend API, use tools like `curl` or Postman, or navigate to [http://localhost:3001](http://localhost:3001) to see the API endpoints.

### Verify Communication Between Frontend and Backend

- Perform a test action in the frontend that requires interaction with the backend.
  - For example:
    - Log in or fetch data from the API.
    - Inspect the developer console (`F12` in most browsers) to ensure successful communication with the backend.

---

### Troubleshooting Tips

#### If the Frontend Fails to Load

- Ensure the container for the frontend (`client`) is running without errors.
- Confirm the port `5173` is not blocked by firewalls or another application.

#### If API Requests Fail

- Check that the backend (`server`) container is running properly.
- Verify the environment variables, especially `DB_PATH` in the backend.
