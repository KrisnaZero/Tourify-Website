document.addEventListener("DOMContentLoaded", function() {
    includeHTML();

    // Criteria definitions
    const criteria = [
        { kode: 'C1', nama: 'Jumlah Pengunjung', bobot: 5 },
        { kode: 'C2', nama: 'Rating', bobot: 4 },
        { kode: 'C3', nama: 'Jarak', bobot: 3 }
    ];

    // Preference weights definitions
    const preferenceWeights = [
        { weight: 5, description: 'SANGAT TINGGI', jumlahPengunjung: { min: 500000, rating: { min: 4.5, jarak: { max: 30 } } } },
        { weight: 4, description: 'TINGGI', jumlahPengunjung: { min: 300000, max: 500000 }, rating: { min: 4.2, max: 4.5 }, jarak: { min: 30, max: 50 } },
        { weight: 3, description: 'CUKUP', jumlahPengunjung: { min: 200000, max: 299999 }, rating: { min: 3.8, max: 4.1 }, jarak: { min: 51, max: 70 } },
        { weight: 2, description: 'KURANG', jumlahPengunjung: { min: 100000, max: 199999 }, rating: { min: 3.5, max: 3.7 }, jarak: { min: 71, max: 100 } },
        { weight: 1, description: 'RENDAH', jumlahPengunjung: { max: 99999 }, rating: { max: 3.5 }, jarak: { min: 100 } }
    ];

    // Event listener for form submission
    document.getElementById('topsisForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const nama = document.getElementById('nama').value;
        const jumlahPengunjung = parseInt(document.getElementById('jumlahPengunjung').value);
        const rating = parseFloat(document.getElementById('rating').value);
        const jarak = parseInt(document.getElementById('jarak').value);

        if (!nama || isNaN(jumlahPengunjung) || isNaN(rating) || isNaN(jarak)) {
            alert('Semua kolom harus diisi dengan benar!');
            return;
        }

        if (rating < 0 || rating > 5 || jarak < 0 || jarak > 300) {
            alert('Input rating harus antara 0 dan 5, dan jarak harus antara 0 dan 300.');
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

    // Event listener for calculate button
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

            if (rating < 0 || rating > 5 || jarak < 0 || jarak > 300) {
                alert('Input rating harus antara 0 dan 5, dan jarak harus antara 0 dan 300.');
                return;
            }

            data.push([jumlahPengunjung, rating, jarak]); // Push array of values
        }

        if (data.length < 2) {
            alert('Harap tambahkan setidaknya dua tempat wisata untuk melakukan perhitungan TOPSIS.');
            return;
        }

        // Implement TOPSIS calculation
        const topsisResults = calculateTOPSIS(data, criteria, preferenceWeights, rows);

        // Display results
        displayTOPSISResults(topsisResults);
    });

    // Function to calculate TOPSIS
    function calculateTOPSIS(data, criteria, preferenceWeights, rows) {
        // Normalize matrix
        const normalizedMatrix = [];
        const weights = criteria.map(criterion => criterion.bobot);
        const matrixTranspose = transposeMatrix(data);

        for (let i = 0; i < matrixTranspose.length; i++) {
            const column = matrixTranspose[i];
            const max = Math.max(...column);
            const min = Math.min(...column);

            const normalizedColumn = column.map((value, index) => {
                const weight = weights[index];
                return weight * (value - min) / (max - min);
            });

            normalizedMatrix.push(normalizedColumn);
        }

        // Calculate weighted normalized decision matrix
        const weightedMatrix = [];
        for (let i = 0; i < normalizedMatrix.length; i++) {
            const column = normalizedMatrix[i];
            const weight = criteria[i].bobot;

            const weightedColumn = column.map(value => value * weight);
            weightedMatrix.push(weightedColumn);
        }

        // Calculate ideal and anti-ideal solutions
        const idealSolution = [];
        const antiIdealSolution = [];
        for (let i = 0; i < weightedMatrix.length; i++) {
            const column = weightedMatrix[i];

            if (criteria[i].nama === 'Jumlah Pengunjung' || criteria[i].nama === 'Rating') {
                idealSolution.push(Math.max(...column));
                antiIdealSolution.push(Math.min(...column));
            } else if (criteria[i].nama === 'Jarak') {
                idealSolution.push(Math.min(...column));
                antiIdealSolution.push(Math.max(...column));
            }
        }

        // Calculate distances from ideal and anti-ideal solutions
        const distancesIdeal = [];
        const distancesAntiIdeal = [];
        for (let i = 0; i < weightedMatrix[0].length; i++) {
            let sumIdeal = 0;
            let sumAntiIdeal = 0;
            for (let j = 0; j < weightedMatrix.length; j++) {
                sumIdeal += Math.pow(weightedMatrix[j][i] - idealSolution[j], 2);
                sumAntiIdeal += Math.pow(weightedMatrix[j][i] - antiIdealSolution[j], 2);
            }
            distancesIdeal.push(Math.sqrt(sumIdeal));
            distancesAntiIdeal.push(Math.sqrt(sumAntiIdeal));
        }

        // Calculate performance scores
        const performanceScores = distancesAntiIdeal.map((value, index) => {
            return value / (value + distancesIdeal[index]);
        });

        // Prepare results
        const topsisResults = [];
        for (let i = 0; i < data.length; i++) {
            topsisResults.push({
                nama: rows[i].cells[1].textContent,
                score: performanceScores[i]
            });
        }

        // Sort results by score descending
        topsisResults.sort((a, b) => b.score - a.score);

        return topsisResults;
    }

    // Function to transpose matrix
    function transposeMatrix(matrix) {
        return matrix[0].map((col, i) => matrix.map(row => row[i]));
    }

    // Function to display TOPSIS results
    function displayTOPSISResults(results) {
        const tableBody = document.getElementById('topsisResultsBody');
        tableBody.innerHTML = ''; // Clear existing rows

        results.forEach((result, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${result.nama}</td>
                <td>${result.score.toFixed(4)}</td>
            `;
        });
    }
});
