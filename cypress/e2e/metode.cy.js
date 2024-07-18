describe('Metode Topsis Page', () => {
    beforeEach(() => {
      cy.visit('templates/metode.html'); // Mengunjungi halaman metode.html sebelum setiap test
    });
  
    it('should display correct title and subtitle', () => {
      cy.get('.title').should('contain.text', 'Metode Topsis');
      cy.get('.subtitle').should('contain.text', 'APA ITU METODE TOPSIS ?');
    });
  
    it('should have a navigation menu with correct links', () => {
      cy.get('nav ul li').should('have.length', 3); // Memastikan ada tiga item di dalam menu navigasi
      cy.get('nav ul li').eq(0).should('contain.text', 'Home');
      cy.get('nav ul li').eq(1).should('contain.text', 'Metode Topsis');
      cy.get('nav ul li').eq(2).should('contain.text', 'Perhitungan');
    });
  
    it('should have an aside section loaded', () => {
      cy.get('#aside').should('exist'); // Memastikan elemen aside telah dimuat
    });
  
    it('should have a footer section', () => {
      cy.get('#footer').should('exist'); // Memastikan elemen footer ada di halaman
    });
  });
  