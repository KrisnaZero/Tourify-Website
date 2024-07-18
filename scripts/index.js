// Define setupEventListeners function
function setupEventListeners() {
    // Add event listeners or setup logic here
}

document.addEventListener("DOMContentLoaded", function() {
    includeHTML(function() {
        // All HTML content is included and DOM is ready
        setupEventListeners(); // Call setupEventListeners here
    });
});

// IncludeHTML function definition
function includeHTML(callback) {
    var elements = document.querySelectorAll('[w3-include-html]');
    elements.forEach(function(element) {
        var file = element.getAttribute('w3-include-html');
        if (file) {
            fetch(file)
                .then(response => response.text())
                .then(html => {
                    element.innerHTML = html;
                    element.removeAttribute('w3-include-html');
                })
                .catch(error => {
                    console.error('Error fetching included HTML:', error);
                    element.innerHTML = 'Failed to load content.';
                });
        }
    });
    setTimeout(callback, 10); // Adjust timeout as needed
}
