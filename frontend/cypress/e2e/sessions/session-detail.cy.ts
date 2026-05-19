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
      cy.get("h1").should("be.visible");
      cy.contains("Teacher").should("be.visible");
      cy.contains("Participants").should("be.visible");
    });

    it("does not see Edit or Delete buttons", () => {
      cy.contains("button", "Edit").should("not.exist");
      cy.contains("button", "Delete").should("not.exist");
    });

    it("can join a session", () => {
      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Leave Session')").length) {
          cy.contains("button", "Leave Session").click();
        }
      });
      cy.contains("button", "Join Session").click();
      cy.contains("button", "Leave Session").should("be.visible");
    });

    it("can leave a session", () => {
      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Join Session')").length) {
          cy.contains("button", "Join Session").click();
        }
      });
      cy.contains("button", "Leave Session").click();
      cy.contains("button", "Join Session").should("be.visible");
    });
  });

  describe("as admin", () => {
    beforeEach(() => {
      cy.login(Cypress.env("ADMIN_EMAIL"), Cypress.env("ADMIN_PASSWORD"));
      cy.visit("/sessions/1");
    });

    it("displays session detail", () => {
      cy.get("h1").should("be.visible");
      cy.contains("Teacher").should("be.visible");
      cy.contains("Participants").should("be.visible");
    });

    it("sees Edit and Delete buttons", () => {
      cy.contains("button", "Edit").should("be.visible");
      cy.contains("button", "Delete").should("be.visible");
    });

    it("does not see Join or Leave buttons", () => {
      cy.contains("button", "Join Session").should("not.exist");
      cy.contains("button", "Leave Session").should("not.exist");
    });
  });
});
