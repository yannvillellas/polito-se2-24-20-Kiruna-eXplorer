describe("ShenzenDiagram Component Integration", () => {
  beforeEach(() => {
    cy.fixture("example.json").then((data) => {
      // Mock GET for documents
      cy.intercept("GET", "/api/documents", data.documents).as("getDocuments");
      // Mock GET for associations
      cy.intercept("GET", "/api/associations", data.associations).as(
        "getAssociations"
      );
      // Mock POST for saving node positions
      cy.intercept("POST", "/api/diagram/nodes", { success: true }).as(
        "postNodes"
      );
      // Mock GET for session data
      cy.intercept("GET", "/api/sessions/current", {
        statusCode: 200,
        body: { user: "testUser", role: "urbanPlanner" },
      }).as("getSession");
    });

    cy.viewport(1920, 1080);
    cy.visit("/diagram"); // Correct URL for the diagram page

    cy.wait("@getSession");
    cy.wait("@getDocuments");
    cy.wait("@getAssociations");
  });

  // ---------------- Nodes Testing ----------------
  it("renders nodes correctly within ShenzenDiagram", () => {
    cy.get("svg").within(() => {
      cy.get("circle", { timeout: 10000 }).should("have.length", 2); // Two nodes in mock data
    });
  });

  it("opens a modal when a node is clicked", () => {
    cy.get("circle", { timeout: 10000 }).first().click({ force: true });

    cy.wait("@postNodes");

    cy.get(".modal", { timeout: 10000 }).should("be.visible");
    cy.get(".modal-title").should("contain", "Document 1");
  });

  it("supports dragging only for nodes with incomplete issuance dates", () => {
    cy.fixture("example.json").then((data) => {
      const draggableNodes = data.documents.filter((doc) => {
        // Check for incomplete issuance dates (missing day or month)
        const parts = doc.issuanceDate.split("/");
        return parts.length < 3; // Incomplete date has fewer than 3 parts
      });

      if (draggableNodes.length > 0) {
        // Target only the nodes that are draggable
        cy.get("g.exclude", { timeout: 10000 })
          .should("have.length", draggableNodes.length)
          .first()
          .trigger("mousedown", {
            which: 1,
            clientX: 100,
            clientY: 100,
            force: true,
          }) // Start drag
          .trigger("mousemove", { clientX: 300, clientY: 300, force: true }) // Move drag
          .trigger("mouseup", { force: true }); // Release drag

        // Verify the position has changed
        cy.get("circle")
          .first()
          .then(($circle) => {
            const position = $circle.position();
            expect(position.left).to.be.greaterThan(150);
            expect(position.top).to.be.greaterThan(150);
          });
      } else {
        cy.log("No nodes with incomplete issuance dates are draggable.");
      }
    });
  });

  // ---------------- Links Testing ----------------
  it("renders links correctly within ShenzenDiagram", () => {
    cy.get("path", { timeout: 10000 }).should("have.length.at.least", 1); // Verify links exist
  });
});
