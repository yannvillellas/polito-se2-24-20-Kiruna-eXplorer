describe("HomePage Component Tests", () => {
  const apiBaseURL = "http://localhost:3001/api"; // Update with your base endpoint

  beforeEach(() => {
    // Mock login
    cy.request("POST", "http://localhost:3001/api/sessions", {
      username: "user1",
      password: "password1",
    }).then((response) => {
      expect(response.status).to.eq(201);
      // Save the token in localStorage
      window.localStorage.setItem("authToken", response.body.token);
    });

    // Intercept required API calls
    cy.intercept("GET", `${apiBaseURL}/documents/stakeholders`, {
      statusCode: 200,
      body: [
        { shId: 1, name: "stake1" },
        { shId: 2, name: "stake2" },
      ],
    }).as("getStakeholders");

    cy.intercept("GET", `${apiBaseURL}/documents/scales`, {
      statusCode: 200,
      body: [
        { scaleId: 1, name: "scale1" },
        { scaleId: 2, name: "scale2" },
      ],
    }).as("getScales");

    cy.intercept("GET", `${apiBaseURL}/documents/types`, {
      statusCode: 200,
      body: [
        { typeId: 1, type: "type1" },
        { typeId: 2, type: "type2" },
      ],
    }).as("getDocumentTypes");

    cy.visit("http://localhost:5173/homePage");
  });

  it("should open the form and insert a document correctly", () => {
    // Step 1: Click the "+" button to open the form
    cy.get(".btn-add-document").click(); // Ensure the button is targeted correctly

    // Step 2: Fill out the Title field
    cy.get(".col-md-5 > :nth-child(1) > .form-control")
      .should("have.value", "") // Verify the field is initially empty
      .type("Document 1") // Enter the document title
      .should("have.value", "Document 1"); // Verify the value

    // Step 3: Select a stakeholder from the dropdown
    cy.get(".col-md-5 > :nth-child(2) > .custom-dropdown-trigger").click(); // Open the dropdown

    cy.get(".stakeholders-container")
      .contains("stake1") // Match the desired option
      .click(); // Select the option

    cy.get(".custom-dropdown-trigger") // Verify the selected value
      .should("contain", "stake1");

    // Step 4: Select a scale
    cy.get(
      ":nth-child(3) > .css-b62m3t-container > .css-13cymwt-control"
    ).click(); // Adjust selector to match the scale dropdown
    cy.get("#react-select-5-option-0").click();
    cy.get(":nth-child(3)")
      .eq(18)
      .then((el) => {
        console.log(el);
      });
    cy.get(":nth-child(3)").eq(18).should("contain", "scale1");

    // insert issuance date
    // .then((el) => {console.log(el);})
    cy.get('input[placeholder="Enter date in yyyy/mm/dd format"]').type(
      "2024/12/31"
    );

    //insert description
    cy.get("textarea").type("document decription");

    //slect a type
    cy.get(
      ":nth-child(5) > .css-b62m3t-container > .css-13cymwt-control"
    ).click(); // Adjust selector to match the scale dropdown
    cy.get("#react-select-7-option-0").click();
    cy.get(":nth-child(5)")
      .eq(4)
      .then((el) => {
        console.log(el);
      }); //.eq(18).then((el) => { console.log(el); })
    cy.get(":nth-child(5)").eq(4).should("include.text", "type1");

    // Step 5: Submit the form
    cy.contains("button", "Next →").click(); // Replace with the actual selector for the submit button

    // Step 6: Verify the result
    cy.intercept("POST", `${apiBaseURL}/documents`, (req) => {
      expect(req.body).to.deep.equal({
        title: "Document 1",
        stakeholder: "stake1",
        scale: "scale1",
        // Add other fields as required
      });
    }).as("submitDocument");
  });
});
