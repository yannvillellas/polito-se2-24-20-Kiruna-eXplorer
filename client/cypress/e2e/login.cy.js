describe('login page tests', () => {

  const mockLoginEndpoint = 'http://localhost:5173/api/login'; // Cambia questo con l'endpoint reale
  const username = 'testuser';
  const password = 'testpassword';

  beforeEach(()=>{
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
})