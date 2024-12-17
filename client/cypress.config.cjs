const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "wfanj5",
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      // Add Node event listeners here if needed
    },
  },
});
