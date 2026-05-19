describe("Sessions", () => {
  it("redirects to login when not authenticated", () => {
    cy.visit("/sessions");
    cy.url().should("include", "/login");
  });

  it("displays sessions list when authenticated", () => {
    cy.login(Cypress.env("USER_EMAIL"), Cypress.env("USER_PASSWORD"));
    cy.visit("/sessions");
    cy.get("[data-cy=sessions-title]").should("contain", "Yoga Sessions");
  });

  it("displays delete button when authenticated as admin", () => {
    cy.login(Cypress.env("ADMIN_EMAIL"), Cypress.env("ADMIN_PASSWORD"));
    cy.visit("/sessions");
    cy.get("[data-cy=delete-session-button]").first().should("be.visible");
  });
});
