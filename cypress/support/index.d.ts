declare namespace Cypress {
  interface Chainable {
    login(
      username: string,
      password: string
    ): Cypress.Chainable<Cypress.Response<any>>;
  }
}
