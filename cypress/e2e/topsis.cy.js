describe('Perhitungan Page', () => {
    beforeEach(() => {
      cy.visit('templates/perhitungan.html'); // Mengunjungi halaman perhitungan.html sebelum setiap test
    });
  
    it('should display input form and calculate button', () => {
      cy.get('form#topsisForm').should('exist'); // Memastikan form input tersedia
      cy.get('button#calculateBtn').should('exist').and('contain.text', 'Hitung Pemilihan Tempat Wisata'); // Memastikan tombol Hitung ada dan teksnya benar
    });
  
    it('should add new tourist destinations to the list', () => {
      const nama = 'Pantai Delegan';
      const jumlahPengunjung = '307389';
      const rating = '4.5';
      const jarak = '42';
  
      // Mengisi form
      cy.get('input#nama').type(nama);
      cy.get('input#jumlahPengunjung').type(jumlahPengunjung);
      cy.get('input#rating').type(rating);
      cy.get('input#jarak').type(jarak);
  
      // Mengklik tombol Tambah Wisata
      cy.get('form#topsisForm').submit();
  
      // Memastikan data ditambahkan ke dalam tabel
      cy.get('#wisataTableBody').find('tr').should('have.length', 1);
      cy.get('#wisataTableBody').find('tr').eq(0).should('contain.text', nama);
      cy.get('#wisataTableBody').find('tr').eq(0).should('contain.text', jumlahPengunjung);
      cy.get('#wisataTableBody').find('tr').eq(0).should('contain.text', rating);
      cy.get('#wisataTableBody').find('tr').eq(0).should('contain.text', jarak);
    });
  
    it('should calculate TOPSIS results correctly', () => {
      // Menambahkan beberapa tempat wisata untuk perhitungan
      cy.get('input#nama').type('Pantai Delegan');
      cy.get('input#jumlahPengunjung').type('307389');
      cy.get('input#rating').type('4.5');
      cy.get('input#jarak').type('42');
      cy.get('form#topsisForm').submit();
  
      cy.get('input#nama').type('Makam Sunan Giri');
      cy.get('input#jumlahPengunjung').type('1550101');
      cy.get('input#rating').type('4.6');
      cy.get('input#jarak').type('4');
      cy.get('form#topsisForm').submit();

      cy.get('input#nama').type('Air Panas Kepuh');
      cy.get('input#jumlahPengunjung').type('5900');
      cy.get('input#rating').type('4.3');
      cy.get('input#jarak').type('171');
      cy.get('form#topsisForm').submit();
  
      // Mengklik tombol Hitung Pemilihan Tempat Wisata
      cy.get('button#calculateBtn').click();
  
      // Memastikan hasil perhitungan ditampilkan dengan benar
      cy.get('#topsisResultsBody').find('tr').should('have.length', 3); // Memastikan ada dua hasil perhitungan (dua tempat wisata)
      cy.get('#topsisResultsBody').find('tr').eq(0).should('contain.text', 'Makam Sunan Giri'); // Memastikan tempat wisata dengan skor tertinggi ditampilkan terlebih dahulu
      cy.get('#topsisResultsBody').find('tr').eq(1).should('contain.text', 'Pantai Delegan'); // Memastikan tempat wisata dengan skor menengah
      cy.get('#topsisResultsBody').find('tr').eq(2).should('contain.text', 'Air Panas Kepuh'); // Memastikan tempat wisata dengan skor terendah ditampilkan terakhir
    });
  
    it('should handle form validation correctly', () => {
      // Mengklik tombol Tambah Wisata tanpa mengisi form
      cy.get('form#topsisForm').submit();
  
      // Memastikan pesan kesalahan muncul
      cy.get('form#topsisForm').find('.invalid-feedback').should('have.length', 4); // Memastikan ada empat pesan kesalahan untuk setiap input yang harus diisi
    });
  });
  