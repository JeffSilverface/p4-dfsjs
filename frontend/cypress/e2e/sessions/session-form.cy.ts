describe("Session Form", () => {
  it("redirects non-admin to sessions list", () => {
    cy.login(Cypress.env("USER_EMAIL"), Cypress.env("USER_PASSWORD"));
    cy.visit("/sessions/create");
    cy.url().should("eq", Cypress.config("baseUrl") + "/sessions");
  });

  describe("as admin", () => {
    beforeEach(() => {
      cy.login(Cypress.env("ADMIN_EMAIL"), Cypress.env("ADMIN_PASSWORD"));
    });

    it("can create a session", () => {
      cy.visit("/sessions/create");
      cy.get("[data-cy=form-title]").should("contain", "Create New Session");
      cy.get("input[name=name]").type("Test Cypress Session");
      cy.get("input[name=date]").type("2027-01-15");
      cy.get("select[name=teacherId]").select(1);
      cy.get("textarea[name=description]").type("Session created by Cypress test");
      cy.get("[data-cy=submit-button]").click();
      cy.url().should("eq", Cypress.config("baseUrl") + "/sessions");
    });

    it("can edit a session", () => {
      cy.visit("/sessions/edit/2");
      cy.get("[data-cy=form-title]").should("contain", "Edit Session");
      cy.get("input[name=name]").clear().type("Yoga Hatha Updated");
      cy.get("[data-cy=submit-button]").click();
      cy.url().should("eq", Cypress.config("baseUrl") + "/sessions");
    });

    it("can delete a session from detail page", () => {
      cy.visit("/sessions/create");
      cy.get("input[name=name]").type("Session To Delete");
      cy.get("input[name=date]").type("2027-02-01");
      cy.get("select[name=teacherId]").select(1);
      cy.get("textarea[name=description]").type("This session will be deleted");
      cy.get("[data-cy=submit-button]").click();
      cy.url().should("eq", Cypress.config("baseUrl") + "/sessions");

      cy.contains("Session To Delete")
        .closest(".bg-white")
        .contains("a", "View Details")
        .click();
      cy.url().should("match", /\/sessions\/\d+$/);

      cy.on("window:confirm", () => true);
      cy.get("[data-cy=delete-button]").click();
      cy.url().should("eq", Cypress.config("baseUrl") + "/sessions");
    });
  });
});
