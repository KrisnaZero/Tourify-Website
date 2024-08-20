document.addEventListener("DOMContentLoaded", function() {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRrQXKj6eQPKL80MyNiZ6320a3tyB55a-KSaTkkXQ-0NAhsa6PmcRYJfyqAAnMaZOtamD1Vq-pN_-gZ/pub?output=csv';

    const criteria = [
        { kode: 'C1', nama: 'Jumlah Pengunjung', bobot: 5 },
        { kode: 'C2', nama: 'Rating', bobot: 4 },
        { kode: 'C3', nama: 'Jarak', bobot: 3 }
    ];

    const preferenceWeights = [
        { weight: 5, description: 'SANGAT TINGGI', jumlahPengunjung: { min: 500000}, rating: { min: 4.5}, jarak: {min: 0, max: 30 }  },
        { weight: 4, description: 'TINGGI', jumlahPengunjung: { min: 300000, max: 500000 }, rating: { min: 4.2, max: 4.5 }, jarak: { min: 30, max: 50 } },
        { weight: 3, description: 'CUKUP', jumlahPengunjung: { min: 200000, max: 299999 }, rating: { min: 3.8, max: 4.1 }, jarak: { min: 51, max: 70 } },
        { weight: 2, description: 'KURANG', jumlahPengunjung: { min: 100000, max: 199999 }, rating: { min: 3.5, max: 3.7 }, jarak: { min: 71, max: 100 } },
        { weight: 1, description: 'RENDAH', jumlahPengunjung: { max: 99999 }, rating: { max: 3.5 }, jarak: { min: 100 } }
    ];

    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSV(csvText);
            populateDropdown(data);
        })
        .catch(error => console.error('Error fetching the Google Sheet:', error));

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

    function parseCSV(csvText) {
        const rows = csvText.trim().split('\n');
        return rows.slice(1).map(row => row.split(',').map(cell => cell.trim()));
    }

    function populateDropdown(data) {
        const dropdown = document.getElementById('wisataDropdown');
        dropdown.innerHTML = '<option value="">Pilih Wisata</option>';

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

    document.getElementById('topsisForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const nama = document.getElementById('nama').value;
        const jumlahPengunjung = parseInt(document.getElementById('jumlahPengunjung').value);
        const rating = parseFloat(document.getElementById('rating').value);
        const jarak = parseFloat(document.getElementById('jarak').value);

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

    function formatScore(score) {
        return score.toFixed(4);
    }

function calculateTOPSIS(data, criteria, preferenceWeights) {
    // Step 1: Normalize the decision matrix
    const sumSquares = data.reduce((sum, row) => {
        return row.slice(1).map((value, i) => sum[i] + Math.pow(value, 2));
    }, Array(criteria.length).fill(0));

    const normalized = data.map(row => {
        return row.slice(1).map((value, i) => value / Math.sqrt(sumSquares[i]));
    });

    // Step 2: Calculate the weighted normalized decision matrix
    const weightedNormalized = normalized.map(row => {
        return row.map((value, i) => value * criteria[i].bobot);
    });

    // Step 3: Determine the ideal and anti-ideal solutions
    const idealBest = weightedNormalized[0].map((_, i) => {
        return criteria[i].nama === 'Jarak' 
            ? Math.min(...weightedNormalized.map(row => row[i]))  // Cost criterion (Jarak)
            : Math.max(...weightedNormalized.map(row => row[i])); // Benefit criteria
    });
    const idealWorst = weightedNormalized[0].map((_, i) => {
        return criteria[i].nama === 'Jarak' 
            ? Math.max(...weightedNormalized.map(row => row[i]))  // Cost criterion (Jarak)
            : Math.min(...weightedNormalized.map(row => row[i])); // Benefit criteria
    });

    // Step 4: Calculate the distances to the ideal and anti-ideal solutions
    const distancesBest = weightedNormalized.map(row => {
        return Math.sqrt(row.reduce((sum, val, i) => sum + Math.pow(val - idealBest[i], 2), 0));
    });
    const distancesWorst = weightedNormalized.map(row => {
        return Math.sqrt(row.reduce((sum, val, i) => sum + Math.pow(val - idealWorst[i], 2), 0));
    });

    // Step 5: Calculate the TOPSIS scores
    const scores = distancesWorst.map((distWorst, i) => distWorst / (distWorst + distancesBest[i]));

    return data.map((item, index) => ({
        nama: item[0],
        score: scores[index]
    }));
}


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

        const topsisResults = calculateTOPSIS(data, criteria, preferenceWeights);
        displayTOPSISResults(topsisResults);
    });
});
