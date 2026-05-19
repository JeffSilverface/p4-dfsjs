describe("Register", () => {
  it("redirects to sessions after successful register", () => {
    cy.visit("/register");
    cy.get("#firstName").type("Test");
    cy.get("#lastName").type("User");
    cy.get("#email").type(`test_${Date.now()}@test.com`);
    cy.get("#password").type("test!1234");
    cy.get("button[type=submit]").click();
    cy.url().should("include", "/sessions");
  });

  it("displays error on existing email", () => {
    cy.visit("/register");
    cy.get("#firstName").type("Test");
    cy.get("#lastName").type("User");
    cy.get("#email").type(Cypress.env("USER_EMAIL"));
    cy.get("#password").type(Cypress.env("USER_PASSWORD"));
    cy.get("button[type=submit]").click();
    cy.contains("Registration failed").should("be.visible");
  });
});
