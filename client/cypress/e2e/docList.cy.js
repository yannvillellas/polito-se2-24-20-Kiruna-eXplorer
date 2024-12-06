describe('HomePage Component Tests', () => {
    const apiBaseURL = 'http://localhost:3001/api'; // Aggiorna con il tuo endpoint di base



    beforeEach(() => {
        //mock login
        cy.request('POST', 'http://localhost:3001/api/sessions', {
            username: 'user1',
            password: 'password1',
        }).then((response) => {
            expect(response.status).to.eq(201);
            // Salva il token nel localStorage o cookie
            window.localStorage.setItem('authToken', response.body.token);
        });


        cy.intercept('GET', `${apiBaseURL}/documents`, {
            statusCode: 200,
            body: [
                { docId: 1, title: 'Document 1', description: "descrizione molto molto molto molto molto ma molto ma molto ma molto lunga",stakeholders:"stake1", scale: "prova", issuanceDate: "prova", type: "prova", connections: 0, languages: "prova", pages: 10 },
                { docId: 2, title: 'Document 2', description: "prova",stakeholders:"stake2", scale: "prova", issuanceDate: "prova", type: "prova", connections: 0, languages: "prova", pages: 10 },
            ],
        }).as('getDocuments');;

        cy.intercept('GET', `${apiBaseURL}/positions`, {
            statusCode: 200,
            body: [
                { docId: 1, latitude: 67.855193, longitude: 20.236950 },
                { docId: 2, latitude: 67.855863, longitude: 20.236410 },
            ],
        }).as('getPositions');;

        cy.intercept('GET', `${apiBaseURL}/documents/stakeholders`, {
            statusCode: 200,
            body: [
                { shId: 1, name:"stake1" },
                { shId: 2, name:"stake2" },
            ],
        }).as('getStakeholders');

        cy.intercept('GET', `${apiBaseURL}/documents/scales`, {
            statusCode: 200,
            body: [
                { scaleId: 1, name:"scale1" },
                { scaleId: 2, name:"scale2" },
            ],
        }).as('getScales');

        cy.intercept('GET', `${apiBaseURL}/documents/type`, {
            statusCode: 200,
            body: [
                { scaleId: 1, type:"type1" },
                { scaleId: 2, type:"type2" },
            ],
        }).as('getDocumentTypes');

        cy.visit('http://localhost:5173/documentPage');
    });

    it('should display the document list on load', () => {
        cy.wait('@getDocuments');
        cy.get('table').should('be.visible');
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should filter documents by title', () => {
        const searchTitle = 'Document 1';
        cy.get('.border-dark')
            .type(searchTitle)
            .should('have.value', searchTitle);

        cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).contains(searchTitle, { matchCase: false });
        });
    });

    it('should filter documents by stakeholder', () => {
        cy.wait('@getStakeholders');
        cy.get(':nth-child(2) > :nth-child(1) > .css-b62m3t-container').click();
        //cy.get('#react-select-3-listbox').first().click();
        cy.get('#react-select-3-option-0').click()

        cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).contains("stake1");
        });
    });

    /*it('should download a file when download button is clicked', () => {
        cy.intercept('GET', `${apiUrl}/files/*`, { fixture: 'example.pdf' }).as('getFile');
        cy.get('table tbody tr').first().find('button').contains('Download').click();
        cy.wait('@getFile');
    });*/

    it('should toggle description when clicked', () => {
        cy.get('table tbody tr').first().find('td:nth-child(2)').click();
        cy.get('table tbody tr').first().find('td:nth-child(2)').should('contain.text', 'Reduce');
    });

    it('should display "No files available" if no files are present', () => {
        cy.get('table tbody tr').last().find('td').contains('No files available');
    });

});