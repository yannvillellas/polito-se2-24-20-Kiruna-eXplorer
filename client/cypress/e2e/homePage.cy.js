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


        // Mocka il caricamento iniziale
        cy.intercept('GET', `${apiBaseURL}/documents`, {
            statusCode: 200,
            body: [
                { docId: 1, title: 'Document 1', description: "prova", stackeholders: "prova", scale: "prova", issuanceDate: "prova", type: "prova", connections: 0, languages: "prova", pages: 10 },
                { docId: 2, title: 'Document 2', description: "prova", stackeholders: "prova", scale: "prova", issuanceDate: "prova", type: "prova", connections: 0, languages: "prova", pages: 10 },
            ],
        });

        cy.intercept('GET', `${apiBaseURL}/positions`, {
            statusCode: 200,
            body: [
                { docId: 1, latitude: 67.855193, longitude: 20.236950 },
                { docId: 2, latitude: 67.855863, longitude: 20.236410 },
            ],
        });

        cy.visit('http://localhost:5173/homePage'); // Aggiorna con l'URL corretto
    });

    it('renders the map and documents correctly', () => {
        // Verifica che la mappa sia renderizzata
        cy.get('.leaflet-container').should('exist');

        // Verifica che i marker siano renderizzati
        cy.get('.leaflet-marker-icon').should('have.length', 2);
    });

    it('handles adding a new document without links', () => {
        /*cy.get('button').contains('Login').click()
        cy.get('input#user').type("user1");
        cy.get('input#pass').type("password1");
        cy.get('button[type="submit"]').click();*/

        // Mocka l'aggiunta di un documento
        cy.intercept('POST', `${apiBaseURL}/documents`, {
            statusCode: 201,
            body: { docId: 3 },
        });

        cy.intercept('POST', `${apiBaseURL}/positions`, {
            statusCode: 201,
        });
        cy.get('.add-document-container > :nth-child(1)').click()
        cy.get('input[placeholder="Enter document name"]').type('New Document');
        //select stakeholders
        cy.get('.col-md-5 > :nth-child(2) > .css-b62m3t-container > .css-13cymwt-control').click();
        cy.contains('LKAB').click();
        // scale
        cy.get(':nth-child(3) > .css-b62m3t-container > .css-13cymwt-control').click();
        cy.contains("Blueprints/Effects").click();
        cy.get('input[placeholder="Enter date in yyyy/mm/dd format"]').type('2023/12');
        //type
        cy.get(':nth-child(5) > .css-b62m3t-container > .css-13cymwt-control').click()
        cy.contains('Design document').click();
        //language
        cy.get(':nth-child(6) > .css-b62m3t-container > .css-13cymwt-control').click()
        cy.contains("English").click()
        cy.get('textarea').type('This is a description for the new document.');

        //clicco la mappa
        cy.get('input[type="radio"][value="pointToPoint"]').check();
        cy.get('input[type="radio"][value="pointToPoint"]').should('be.checked');
        cy.get('.col-md-6 > .container-fluid > .leaflet-container').click()
        cy.get('button').contains('Set').click()

        //test upload file
        const fileName = 'example.txt'; // Assicurati che il file si trovi nella cartella "cypress/fixtures"
        cy.fixture(fileName).then((fileContent) => {
            cy.get('input[type="file"]') // Trova il campo input di tipo file
                .attachFile({ fileContent, fileName, encoding: 'utf-8' }); // Carica il file nel campo
        });

        // Verifica che il file sia stato selezionato correttamente
        cy.get('ul').should('contain', 'example.txt') // Verifica che il file sia presente nella lista
        cy.get('button').contains('Save').click()
        cy.get('button').contains('Skip links').click()
        cy.get('button').contains('Yes, close').click()



        // Verifica che il nuovo documento sia stato aggiunto
        cy.get('.leaflet-marker-icon').should('have.length', 3);
    });
    /*
      it('allows modifying a document position', () => {
        // Mocka la modifica della posizione
        cy.intercept('PUT', `${apiBaseURL}/positions/*`, {
          statusCode: 200,
        });
    
        // Simula un drag-and-drop di un marker
        cy.get('.leaflet-marker-icon')
          .first()
          .trigger('mousedown', { which: 1 })
          .trigger('mousemove', { clientX: 100, clientY: 100 })
          .trigger('mouseup');
    
        // Verifica che la modifica sia stata effettuata
        cy.wait('@putPosition').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
        });
      });
    
      it('displays an error message if document loading fails', () => {
        // Mocka un errore nel caricamento dei documenti
        cy.intercept('GET', `${apiBaseURL}/documents`, {
          statusCode: 500,
          body: { error: 'Internal Server Error' },
        });
    
        // Ricarica la pagina
        cy.reload();
    
        // Verifica che un messaggio di errore venga mostrato
        cy.contains('Error fetching documents').should('be.visible');
      });*/
});