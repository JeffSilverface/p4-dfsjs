describe("Log out test", () => {
  it("Logs out the user", () => {
    cy.login(Cypress.env("USER_EMAIL"), Cypress.env("USER_PASSWORD"));
    cy.visit("/sessions");

    cy.get("[data-cy=logout-button]").click();
    cy.url().should("include", "/login");
  });
});
