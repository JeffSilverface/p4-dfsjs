describe("Profile", () => {
  it("redirects to login when not authenticated", () => {
    cy.visit("/profile");
    cy.url().should("include", "/login");
  });

  describe("as regular user", () => {
    beforeEach(() => {
      cy.login(Cypress.env("USER_EMAIL"), Cypress.env("USER_PASSWORD"));
      cy.visit("/profile");
    });

    it("displays user information", () => {
      cy.get("[data-cy=profile-title]").should("contain", "My Profile");
      cy.contains("First Name").should("be.visible");
      cy.contains("Last Name").should("be.visible");
      cy.contains("Email").should("be.visible");
      cy.contains(Cypress.env("USER_EMAIL")).should("be.visible");
    });

    it("displays User account type", () => {
      cy.get("[data-cy=account-type]").should("contain", "User");
    });
  });

  describe("as admin", () => {
    beforeEach(() => {
      cy.login(Cypress.env("ADMIN_EMAIL"), Cypress.env("ADMIN_PASSWORD"));
      cy.visit("/profile");
    });

    it("displays Administrator account type", () => {
      cy.get("[data-cy=account-type]").should("contain", "Administrator");
    });

    it("does not show Promote to Admin button", () => {
      cy.get("[data-cy=promote-button]").should("not.exist");
    });
  });

  it("deletes account and redirects to login", () => {
    const email = `delete_${Date.now()}@test.com`;

    cy.visit("/register");
    cy.get("#firstName").type("Delete");
    cy.get("#lastName").type("Me");
    cy.get("#email").type(email);
    cy.get("#password").type("test!1234");
    cy.get("[data-cy=submit-button]").click();
    cy.url().should("include", "/sessions");

    cy.visit("/profile");
    cy.on("window:confirm", () => true);
    cy.get("[data-cy=delete-account-button]").click();
    cy.url().should("include", "/login");
  });
});
