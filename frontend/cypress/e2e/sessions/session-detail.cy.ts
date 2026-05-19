describe("Session Detail", () => {
  it("redirects to login when not authenticated", () => {
    cy.visit("/sessions/1");
    cy.url().should("include", "/login");
  });

  describe("as regular user", () => {
    beforeEach(() => {
      cy.login(Cypress.env("USER_EMAIL"), Cypress.env("USER_PASSWORD"));
      cy.visit("/sessions/1");
    });

    it("displays session detail", () => {
      cy.get("[data-cy=session-name]").should("be.visible");
      cy.contains("Teacher").should("be.visible");
      cy.contains("Participants").should("be.visible");
    });

    it("does not see Edit or Delete buttons", () => {
      cy.get("[data-cy=edit-button]").should("not.exist");
      cy.get("[data-cy=delete-button]").should("not.exist");
    });

    it("can join a session", () => {
      cy.get("body").then(($body) => {
        if ($body.find("[data-cy=leave-button]").length) {
          cy.get("[data-cy=leave-button]").click();
        }
      });
      cy.get("[data-cy=join-button]").click();
      cy.get("[data-cy=leave-button]").should("be.visible");
    });

    it("can leave a session", () => {
      cy.get("body").then(($body) => {
        if ($body.find("[data-cy=join-button]").length) {
          cy.get("[data-cy=join-button]").click();
        }
      });
      cy.get("[data-cy=leave-button]").click();
      cy.get("[data-cy=join-button]").should("be.visible");
    });
  });

  describe("as admin", () => {
    beforeEach(() => {
      cy.login(Cypress.env("ADMIN_EMAIL"), Cypress.env("ADMIN_PASSWORD"));
      cy.visit("/sessions/1");
    });

    it("displays session detail", () => {
      cy.get("[data-cy=session-name]").should("be.visible");
      cy.contains("Teacher").should("be.visible");
      cy.contains("Participants").should("be.visible");
    });

    it("sees Edit and Delete buttons", () => {
      cy.get("[data-cy=edit-button]").should("be.visible");
      cy.get("[data-cy=delete-button]").should("be.visible");
    });

    it("does not see Join or Leave buttons", () => {
      cy.get("[data-cy=join-button]").should("not.exist");
      cy.get("[data-cy=leave-button]").should("not.exist");
    });
  });
});
