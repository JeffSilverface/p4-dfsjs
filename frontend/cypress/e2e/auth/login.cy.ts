describe("Login", () => {
  it("redirects to sessions after successful login", () => {
    cy.visit("/login");
    cy.get("#email").type("user@test.com");
    cy.get("#password").type("test!1234");
    cy.get("button[type=submit]").click();
    cy.url().should("include", "/sessions");
  });

  it("displays error on wrong password", () => {
    cy.visit("/login");
    cy.get("#email").type("user@test.com");
    cy.get("#password").type("wrongpassword");
    cy.get("button[type=submit]").click();
    cy.contains("Login failed").should("be.visible");
  });

  it("displays error on wrong email", () => {
    cy.visit("/login");
    cy.get("#email").type("unknown@test.com");
    cy.get("#password").type("test!1234");
    cy.get("button[type=submit]").click();
    cy.contains("Login failed").should("be.visible");
  });
});
