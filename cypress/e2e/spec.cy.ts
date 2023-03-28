describe('template spec', () => {
  beforeEach(() => {
    cy.visit('localhost:3000/');
  });
  it('can find header on landing page', () => {
    cy.contains('h1', 'Welcome to Remix');
  });
  it('can sign in with test account', () => {
    cy.contains('button', 'Login');
    cy.get('button').click();
    cy.contains('button', 'Login or Sign up');
    cy.get('button').click();
    cy.login(Cypress.env('auth0_username'), Cypress.env('auth0_password'));
  });
});

export {};
