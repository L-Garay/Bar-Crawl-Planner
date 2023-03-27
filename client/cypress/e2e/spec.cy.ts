describe('template spec', () => {
  beforeEach(() => {
    cy.visit('localhost:3000/');
  });
  it('can find header on landing page', () => {
    cy.contains('h1', 'Welcome to Remix');
  });
  it('can find and click on login button', () => {
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/login');
  });
  it('can find and click on login or sign up button', () => {
    cy.contains('button', 'Login').click();
    cy.contains('button', 'Login or Sign up').click();
    cy.origin('https://dev-3e11guxw7tjwfmjk.us.auth0.com', () => {
      cy.contains('h1', 'Welcome');
      cy.contains('button', 'Continue');
      cy.contains('p', "Don't have an account? Sign up");
    });
  });
  // NOTE that this test fails as it seems that certain data is not getting set properly when returning from Auth0, need to investigate further
  it('can sign in with test account', () => {
    cy.contains('button', 'Login').click();
    cy.contains('button', 'Login or Sign up').click();
    cy.origin('https://dev-3e11guxw7tjwfmjk.us.auth0.com', () => {
      cy.contains('h1', 'Welcome');
      cy.get('input[id="username"]').type('garay.logan+test3@gmail.com');
      cy.get('input[id="password"]').type('Passwordtest3');
      cy.get('button[name="action"]').click();
    });
  });
});

export {};
