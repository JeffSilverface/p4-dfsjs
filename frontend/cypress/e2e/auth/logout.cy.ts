describe("Log out test", () => {
  it("Logs out the user", () => {
    cy.login("user@test.com", "test!1234");
    cy.visit("/sessions");

    cy.get("#logout").click();
    cy.url().should("include", "/login");
  });
});
