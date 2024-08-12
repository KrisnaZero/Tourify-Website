document.addEventListener("DOMContentLoaded", function() {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRrQXKj6eQPKL80MyNiZ6320a3tyB55a-KSaTkkXQ-0NAhsa6PmcRYJfyqAAnMaZOtamD1Vq-pN_-gZ/pub?output=csv';

    // Criteria definitions
    const criteria = [
        { kode: 'C1', nama: 'Jumlah Pengunjung', bobot: 5 },
        { kode: 'C2', nama: 'Rating', bobot: 4 },
        { kode: 'C3', nama: 'Jarak', bobot: 3 }
    ];

    // Preference weights definitions
    const preferenceWeights = [
        { weight: 5, description: 'SANGAT TINGGI', jumlahPengunjung: { min: 500000}, rating: { min: 4.5}, jarak: { max: 30 }  },
        { weight: 4, description: 'TINGGI', jumlahPengunjung: { min: 300000, max: 500000 }, rating: { min: 4.2, max: 4.5 }, jarak: { min: 30, max: 50 } },
        { weight: 3, description: 'CUKUP', jumlahPengunjung: { min: 200000, max: 299999 }, rating: { min: 3.8, max: 4.1 }, jarak: { min: 51, max: 70 } },
        { weight: 2, description: 'KURANG', jumlahPengunjung: { min: 100000, max: 199999 }, rating: { min: 3.5, max: 3.7 }, jarak: { min: 71, max: 100 } },
        { weight: 1, description: 'RENDAH', jumlahPengunjung: { max: 99999 }, rating: { max: 3.5 }, jarak: { min: 100 } }
    ];

    // Fetch data from Google Sheets
    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSV(csvText);
            populateDropdown(data);
        })
        .catch(error => console.error('Error fetching the Google Sheet:', error));

    // Event listener for data selection
    document.getElementById('dataSelection').addEventListener('change', function() {
        const selectedValue = this.value;
        if (selectedValue === 'manual') {
            document.getElementById('manualSection').classList.remove('d-none');
            document.getElementById('dropdownSection').classList.add('d-none');
        } else if (selectedValue === 'dropdown') {
            document.getElementById('manualSection').classList.add('d-none');
            document.getElementById('dropdownSection').classList.remove('d-none');
        }
    });

    // Event listener for dropdown selection
    document.getElementById('wisataDropdown').addEventListener('change', function() {
        const selectedOption = this.value.split(',');
        if (selectedOption.length === 4) {
            const [nama, jumlahPengunjung, rating, jarak] = selectedOption;
            document.getElementById('nama').value = nama;
            document.getElementById('jumlahPengunjung').value = jumlahPengunjung;
            document.getElementById('rating').value = rating;
            document.getElementById('jarak').value = jarak;
        }
    });

    // Parse CSV function
    function parseCSV(csvText) {
        const rows = csvText.trim().split('\n');
        return rows.slice(1).map(row => row.split(',').map(cell => cell.trim()));
    }

    // Populate dropdown
    function populateDropdown(data) {
        const dropdown = document.getElementById('wisataDropdown');
        dropdown.innerHTML = '<option value="">Pilih Wisata</option>'; // Default option

        data.forEach(row => {
            const [nama, jumlahPengunjung, rating, jarak] = row;
            if (nama && jumlahPengunjung && rating && jarak) {
                const option = document.createElement('option');
                option.value = [nama, jumlahPengunjung, rating, jarak].join(',');
                option.textContent = nama;
                dropdown.appendChild(option);
            }
        });
    }

    // Event listener for form submission
    document.getElementById('topsisForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const nama = document.getElementById('nama').value;
        const jumlahPengunjung = parseInt(document.getElementById('jumlahPengunjung').value);
        const rating = parseFloat(document.getElementById('rating').value);
        const jarak = parseFloat(document.getElementById('jarak').value);

        // Debugging logs
        console.log('Form Data:', { nama, jumlahPengunjung, rating, jarak });

        if (!nama || isNaN(jumlahPengunjung) || isNaN(rating) || isNaN(jarak)) {
            alert('Harap lengkapi semua kolom.');
            return;
        }

        const tableBody = document.getElementById('wisataTableBody');
        const rowCount = tableBody.rows.length;
        const newRow = tableBody.insertRow(rowCount);
        newRow.innerHTML = `
            <td>${rowCount + 1}</td>
            <td>${nama}</td>
            <td>${jumlahPengunjung}</td>
            <td>${rating}</td>
            <td>${jarak}</td>
        `;
        document.getElementById('topsisForm').reset();
    });

    // Function to format scores
    function formatScore(score) {
        return score.toFixed(5); // Format score to 2 decimal places
    }

    function calculateTOPSIS(data, criteria, preferenceWeights) {
        // Function to find the appropriate weight based on value ranges
        function findPreferenceWeight(jumlahPengunjung, rating, jarak) {
            for (let weightObj of preferenceWeights) {
                // Debugging logs to understand the ranges being checked
                console.log('Checking weightObj:', weightObj);
                console.log('Value:', { jumlahPengunjung, rating, jarak });
        
                if (
                    (jumlahPengunjung >= (weightObj.jumlahPengunjung.min || 0)) &&
                    (jumlahPengunjung <= (weightObj.jumlahPengunjung.max || Number.MAX_VALUE)) &&
                    (rating >= (weightObj.rating.min || 0)) &&
                    (rating <= (weightObj.rating.max || 5)) &&
                    (jarak >= (weightObj.jarak.min || 0)) &&
                    (jarak <= (weightObj.jarak.max || Number.MAX_VALUE))
                ) {
                    console.log('Weight found:', weightObj.weight);
                    return weightObj.weight;
                }
            }
            console.warn('No matching weight found, returning default.');
            return 1; // Default weight if no range matches
        }
        // Apply preference weights to the data
        const weightedData = data.map(row => {
            const [jumlahPengunjung, rating, jarak] = row.slice(1);
            const weight = findPreferenceWeight(jumlahPengunjung, rating, jarak);
            return [
                jumlahPengunjung * weight,
                rating * weight,
                jarak * weight
            ];
        });
    
        // Normalize weighted data
        const normalized = weightedData.map(row => {
            const [jumlahPengunjung, rating, jarak] = row;
            return [
                jumlahPengunjung / Math.sqrt(weightedData.reduce((sum, row) => sum + Math.pow(row[0], 2), 0)),
                rating / Math.sqrt(weightedData.reduce((sum, row) => sum + Math.pow(row[1], 2), 0)),
                jarak / Math.sqrt(weightedData.reduce((sum, row) => sum + Math.pow(row[2], 2), 0))
            ];
        });
    
        // Weighted normalized matrix using criteria weights
        const weightedNormalized = normalized.map(row => [
            row[0] * criteria.find(c => c.nama === 'Jumlah Pengunjung').bobot,
            row[1] * criteria.find(c => c.nama === 'Rating').bobot,
            row[2] * criteria.find(c => c.nama === 'Jarak').bobot
        ]);
    
        // Determine ideal solutions
        const idealBest = weightedNormalized[0].map((_, i) => Math.max(...weightedNormalized.map(row => row[i])));
        const idealWorst = weightedNormalized[0].map((_, i) => Math.min(...weightedNormalized.map(row => row[i])));
    
        // Calculate distances
        const distancesBest = weightedNormalized.map(row => Math.sqrt(row.reduce((sum, val, i) => sum + Math.pow(val - idealBest[i], 2), 0)));
        const distancesWorst = weightedNormalized.map(row => Math.sqrt(row.reduce((sum, val, i) => sum + Math.pow(val - idealWorst[i], 2), 0)));
    
        // Calculate scores
        const scores = distancesWorst.map((distWorst, i) => distWorst / (distWorst + distancesBest[i]));
    
        // Return results with proper 'nama' reference
        return data.map((item, index) => ({
            nama: item[0],
            score: scores[index]
        }));
    }
    
    // Display TOPSIS results
    function displayTOPSISResults(results) {
        const tbody = document.getElementById('topsisResultsBody');
        tbody.innerHTML = '';
        results.sort((a, b) => b.score - a.score).forEach((result, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${result.nama}</td>
                <td>${formatScore(result.score)}</td>
            `;
        });
    }
    
    // Usage in your event listener
    document.getElementById('calculateBtn').addEventListener('click', function() {
        const tableBody = document.getElementById('wisataTableBody');
        const rows = tableBody.rows;
        const data = [];
    
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const nama = row.cells[1].textContent;
            const jumlahPengunjung = parseInt(row.cells[2].textContent);
            const rating = parseFloat(row.cells[3].textContent);
            const jarak = parseInt(row.cells[4].textContent);
    
            data.push([nama, jumlahPengunjung, rating, jarak]);
        }
    
        if (data.length < 2) {
            alert('Harap tambahkan setidaknya dua tempat wisata untuk melakukan perhitungan TOPSIS.');
            return;
        }
    
        // Implement TOPSIS calculation
        const topsisResults = calculateTOPSIS(data, criteria, preferenceWeights);
    
        // Display results
        displayTOPSISResults(topsisResults);
    });
});
