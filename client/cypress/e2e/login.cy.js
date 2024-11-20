describe('login page tests', () => {

  const mockLoginEndpoint = 'http://localhost:3001/api/sessions'; // Cambia questo con l'endpoint reale
  //http://localhost:3001/api/sessions/current
  const username = 'testuser';
  const password = 'testpassword';

  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
  })
  
  it('renders the login form correctly', () => {
    // Controlla che tutti gli elementi principali siano presenti
    cy.contains('Login').should('exist');
    cy.get('input#user').should('exist'); // Campo username
    cy.get('input#pass').should('exist'); // Campo password
    cy.get('button[type="submit"]').contains('Login').should('exist');
    cy.contains("Don't have an account?").should('exist');
  });

  it('allows typing in username and password fields', () => {
    // Inserisce un username
    cy.get('input#user').type(username).should('have.value', username);

    // Inserisce una password
    cy.get('input#pass').type(password).should('have.value', password);
  });

  it('shows and hides the password when the lock icon is clicked', () => {
    // Password inizialmente nascosta
    cy.get('input#pass').should('have.attr', 'type', 'password');

    // Clicca sull'icona per mostrare la password
    cy.get('.bx-lock-alt.icon').click();
    cy.get('input#pass').should('have.attr', 'type', 'text');

    // Clicca di nuovo per nascondere la password
    cy.get('.bx-lock-open-alt.icon').click();
    cy.get('input#pass').should('have.attr', 'type', 'password');
  });

  it('displays an error message on incorrect credentials', () => {
    // Stub per mockare la risposta del login
    cy.intercept('POST', mockLoginEndpoint, {
      statusCode: 401,
      body: { error: 'Credenziali errate.' },
    });

    // Compila il modulo con credenziali sbagliate
    cy.get('input#user').type('wronguser');
    cy.get('input#pass').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Controlla che l'errore sia visibile
    cy.contains('Credenziali errate.').should('be.visible');

    // L'errore scompare dopo 2 secondi (opzionale, dipende dalla tua logica)
    cy.wait(2000);
    cy.contains('Credenziali errate.').should('not.exist');
  });

  it('redirects or performs an action on successful login', () => {
    // Stub per mockare una risposta di login valida
    cy.intercept('POST', mockLoginEndpoint, {
      statusCode: 200,
      body: { username: 'testuser', token: 'fake-jwt-token' },
    });

    // Compila il modulo con credenziali corrette
    cy.get('input#user').type("user1");
    cy.get('input#pass').type("password1");
    cy.get('button[type="submit"]').click();

    // Aggiungi qui le aspettative per il comportamento successivo al login
    // Esempio: verifica il redirect alla dashboard
    cy.url().should('include', '/homePage');
  });
})