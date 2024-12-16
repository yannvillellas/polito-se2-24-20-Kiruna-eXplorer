describe("CustomMap Component", () => {
  beforeEach(() => {
    // Load mock data from fixtures
    cy.fixture("example.json").then((data) => {
      cy.intercept("GET", "/api/documents", data.documents).as("getDocuments");
      cy.intercept("GET", "/api/associations", data.associations).as(
        "getAssociations"
      );
    });

    // Visit the correct route for the MapPage component
    cy.visit("/mapPage");
  });

  it("renders the map correctly", () => {
    cy.get(".map-container").should("exist");
  });

  it("displays markers on the map", () => {
    cy.wait("@getDocuments");

    // Verify markers exist
    cy.get(".leaflet-marker-icon", { timeout: 10000 }).should(
      "have.length.at.least",
      1
    );
  });

  it("opens a popup when a marker is clicked", () => {
    cy.wait("@getDocuments");

    // Verify markers are loaded
    cy.get(".leaflet-marker-icon", { timeout: 10000 })
      .should("have.length.at.least", 1)
      .then((markers) => {
        cy.log(`Found ${markers.length} markers on the map`);
      });

    // Force trigger the click event explicitly
    cy.get(".leaflet-marker-icon")
      .first()
      .trigger("mouseover") // Trigger hover if necessary
      .trigger("click", { force: true });

    // Debug: Wait for 1 second to observe Leaflet rendering behavior
    cy.wait(1000);

    // Verify the popup is visible
    cy.get(".leaflet-popup", { timeout: 10000 }).should("be.visible");

    // Verify popup content
    cy.get(".leaflet-popup strong").should("contain", "Document 1");
  });

  it("filters documents by municipality button", () => {
    cy.wait("@getDocuments");

    // Verify initial markers
    cy.get(".leaflet-marker-icon", { timeout: 10000 }).should(
      "have.length.at.least",
      1
    );

    // Click municipality button
    cy.get(".btn-municipality").click();

    // Verify filtered markers
    cy.get(".leaflet-marker-icon", { timeout: 10000 }).should(
      "have.length.at.least",
      1
    );
  });
});
