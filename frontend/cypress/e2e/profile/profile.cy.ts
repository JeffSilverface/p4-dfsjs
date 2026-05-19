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
      cy.get("h1").should("contain", "My Profile");
      cy.contains("First Name").should("be.visible");
      cy.contains("Last Name").should("be.visible");
      cy.contains("Email").should("be.visible");
      cy.contains(Cypress.env("USER_EMAIL")).should("be.visible");
    });

    it("displays User account type", () => {
      cy.contains("User").should("be.visible");
    });
  });

  describe("as admin", () => {
    beforeEach(() => {
      cy.login(Cypress.env("ADMIN_EMAIL"), Cypress.env("ADMIN_PASSWORD"));
      cy.visit("/profile");
    });

    it("displays Administrator account type", () => {
      cy.contains("Administrator").should("be.visible");
    });

    it("does not show Promote to Admin button", () => {
      cy.contains("Promote to Admin").should("not.exist");
    });
  });

  it("deletes account and redirects to login", () => {
    const email = `delete_${Date.now()}@test.com`;

    cy.visit("/register");
    cy.get("#firstName").type("Delete");
    cy.get("#lastName").type("Me");
    cy.get("#email").type(email);
    cy.get("#password").type("test!1234");
    cy.get("button[type=submit]").click();
    cy.url().should("include", "/sessions");

    cy.visit("/profile");
    cy.on("window:confirm", () => true);
    cy.contains("button", "Delete Account").click();
    cy.url().should("include", "/login");
  });
});
