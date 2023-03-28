/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (username: string, password: string) => {
  const log = Cypress.log({
    name: 'loginViaAuth0',
  });
  log.snapshot('before');
  cy.origin(
    'https://dev-3e11guxw7tjwfmjk.us.auth0.com',
    { args: { username, password } },
    ({ username, password }) => {
      cy.contains('h1', 'Welcome');
      cy.get('input[id="username"]').type(username);
      cy.get('input[id="password"]').type(password);
      cy.get('button[name="action"]').click();
    }
  );
  log.snapshot('after');
  log.end();

  cy.url().should('include', 'localhost:3000/homepage');
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// NOTE workaround found in https://github.com/robipop22/dnb-stack/issues/3
// also see https://github.com/remix-run/remix/issues/2947 and https://github.com/facebook/react/issues/24430 for known issues with React and Remix and SSR and hyration
Cypress.on('uncaught:exception', (err, runnable) => {
  if (
    err.message.includes(
      'Hydration failed because the initial UI does not match'
    ) ||
    err.message.includes('There was an error while hydrating')
  ) {
    return false;
  }
});

export {};
