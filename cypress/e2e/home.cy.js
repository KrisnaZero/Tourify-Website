describe('Tourify Homepage', () => {
  beforeEach(() => {
    cy.visit('templates/index.html'); // Ganti dengan path menuju halaman home.html
  });

  it('should display the subtitle "HELLO"', () => {
    cy.get('.subtitle').should('contain', 'HELLO');
  });

  it('should display the title "Selamat Datang di Tourify"', () => {
    cy.get('.title').should('contain', 'Selamat Datang di Tourify');
  });

  it('should have an image with alt attribute "profile"', () => {
    cy.get('.image img').should('have.attr', 'alt', 'profile');
  });

  it('should contain a description about Tourify', () => {
    cy.get('.description').should('contain', 'Tourify membantu Anda menemukan dan memilih destinasi wisata terbaik');
  });

  it('should have a navigation menu with three links', () => {
    cy.get('#navbar ul li').should('have.length', 3);
    cy.get('#navbar ul li:nth-child(1) a').should('have.attr', 'href', './index.html');
    cy.get('#navbar ul li:nth-child(2) a').should('have.attr', 'href', './metode.html');
    cy.get('#navbar ul li:nth-child(3) a').should('have.attr', 'href', './perhitungan.html');
  });

  it('should have a footer section', () => {
    cy.get('#footer').should('exist');
  });
});
