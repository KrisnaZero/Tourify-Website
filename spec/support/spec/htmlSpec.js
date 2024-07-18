describe("Tourify HTML Page", function() {
  
    beforeEach(function(done) {
      // Load the HTML file
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "src\templates\index.html", true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          document.documentElement.innerHTML = xhr.responseText;
          done();
        }
      };
      xhr.send();
    });
  
    it("should have a title containing 'Metode Topsis'", function() {
      var title = document.querySelector("h1.title");
      expect(title).not.toBeNull();
      expect(title.textContent).toContain("Metode Topsis");
    });
  
    it("should have a logo link with text 'Tourify'", function() {
      var logoLink = document.querySelector(".logo a");
      expect(logoLink).not.toBeNull();
      expect(logoLink.textContent).toBe("Tourify");
    });
  
    it("should have a navigation menu with three links", function() {
      var navLinks = document.querySelectorAll("nav ul li a");
      expect(navLinks.length).toBe(3);
      expect(navLinks[0].getAttribute("href")).toBe("./index.html");
      expect(navLinks[1].getAttribute("href")).toBe("./metode.html");
      expect(navLinks[2].getAttribute("href")).toBe("./perhitungan.html");
    });
  
    it("should have a subtitle 'APA ITU METODE TOPSIS ?'", function() {
      var subtitle = document.querySelector("p.subtitle");
      expect(subtitle).not.toBeNull();
      expect(subtitle.textContent).toBe("APA ITU METODE TOPSIS ?");
    });
  
    it("should have a section with id 'Metode'", function() {
      var sectionMetode = document.getElementById("Metode");
      expect(sectionMetode).not.toBeNull();
    });
  
    it("should have a footer section", function() {
      var footer = document.getElementById("footer");
      expect(footer).not.toBeNull();
    });
  });
  