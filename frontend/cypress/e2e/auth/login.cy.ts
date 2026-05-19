describe("Login", () => {
  it("redirects to sessions after successful login", () => {
    cy.visit("/login");
    cy.get("#email").type(Cypress.env("USER_EMAIL"));
    cy.get("#password").type(Cypress.env("USER_PASSWORD"));
    cy.get("[data-cy=submit-button]").click();
    cy.url().should("include", "/sessions");
  });

  it("displays error on wrong password", () => {
    cy.visit("/login");
    cy.get("#email").type(Cypress.env("USER_EMAIL"));
    cy.get("#password").type("wrongpassword");
    cy.get("[data-cy=submit-button]").click();
    cy.get("[data-cy=error-message]").should("be.visible");
  });

  it("displays error on wrong email", () => {
    cy.visit("/login");
    cy.get("#email").type("unknown@test.com");
    cy.get("#password").type(Cypress.env("USER_PASSWORD"));
    cy.get("[data-cy=submit-button]").click();
    cy.get("[data-cy=error-message]").should("be.visible");
  });
});
