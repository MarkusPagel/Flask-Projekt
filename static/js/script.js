document.addEventListener('DOMContentLoaded', async () => {
    console.log("Script.js wurde geladen!");

    const graphContainer = document.getElementById('graph-container');
    const tableContainer = document.getElementById('table-container');
    const tableButton = document.getElementById('show-table');
    const chartButton = document.getElementById('show-graph');
    const modeSelect = document.getElementById('mode-select');
    const standortSelect = document.getElementById('standort-select');
    const datumSelect = document.getElementById('datum-select');

    let sensorChart; // Variable für Chart.js

    if (tableButton && chartButton) {
        tableButton.addEventListener('click', () => {
            graphContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            loadTableData();
        });

        chartButton.addEventListener('click', () => {
            graphContainer.style.display = 'grid';
            tableContainer.style.display = 'none';
            loadChartData(); // Diagramm neu laden
        });
    } else {
        console.warn("Tabelle- oder Diagramm-Button nicht gefunden!");
    }

    if (modeSelect && standortSelect && datumSelect) {
        modeSelect.addEventListener('change', updateDateFilter);
        standortSelect.addEventListener('change', updateDateFilter);
        datumSelect.addEventListener('change', loadTableData);
    } else {
        console.warn("Dropdowns nicht gefunden!");
    }

    await loadAllOrte();

});

// 🟢 Alle Orte von Anfang an abrufen
async function loadAllOrte() {
    console.log("Lade alle Orte...");

    const standortSelect = document.getElementById('standort-select');
    const response = await fetch('/api/filter-options');
    const data = await response.json();

    console.log("Antwort von /api/filter-options:", data);

    data.orte.forEach(ort => {
        const option = document.createElement('option');
        option.value = ort;
        option.textContent = ort;
        standortSelect.appendChild(option);
    });

    // Nach dem Laden der Orte: Filter für das Datum aktualisieren
    updateDateFilter();
}

// 🟢 Datum basierend auf Drinnen/Draußen & Ort filtern
async function updateDateFilter() {
    console.log("Filter aktualisieren...");

    const drinnen = document.getElementById('mode-select').value;
    const standort = document.getElementById('standort-select').value;

    let url = `/api/filter-options`;
    if (drinnen || standort) {
        url += `?drinnen=${drinnen}&standort=${standort}`;
    }

    console.log("Gesendete URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log("Gefilterte Daten:", data);

    const datumSelect = document.getElementById('datum-select');
    datumSelect.innerHTML = '';  

    if (data.daten.length === 0) {
        console.warn("Kein verfügbares Datum gefunden!");
    } else {
        data.daten.forEach(datum => {
            const option = document.createElement('option');
            option.value = datum;
            option.textContent = datum;
            datumSelect.appendChild(option);
        });
    }
}

// 🟢 Tabelle mit Daten füllen
async function loadTableData() {
    console.log("Lade Tabellendaten...");

    const datumFilter = document.getElementById('datum-select').value;  
    let url = '/api/data';

    if (datumFilter) {
        url += `?datum=${datumFilter}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    console.log("Tabellen-Daten:", data);

    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Vorherige Einträge löschen

    data.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.datum}</td>
            <td>${entry.uhrzeit}</td>
            <td>${entry.standort}</td>
            <td>${entry.temperatur} °C</td>
            <td>${entry.luftfeuchte} %</td>
            <td>${entry.pressure ? entry.pressure + " hPa" : "N/A"}</td>
            <td>${entry.gas ? entry.gas + " ppm" : "N/A"}</td>
        `;
        tableBody.appendChild(row);
    });
}

// 🟢 Funktion: Holt die Messwerte & erstellt das Diagramm
async function loadChartData() {
    console.log("Lade Chart-Daten...");
    const datumFilter = document.getElementById('datum-select').value;
    let url = '/api/data';

    if (datumFilter) {
        url += `?datum=${datumFilter}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    console.log("Daten für Chart.js:", data);

    const labels = data.map(entry => entry.uhrzeit); // X-Achse: Uhrzeiten
    const temperatures = data.map(entry => entry.temperatur); // Y-Achse: Temperaturen

    const ctx = document.getElementById('sensor-chart').getContext('2d');

    if (sensorChart) {
        sensorChart.destroy(); // Vorheriges Diagramm löschen
    }

    sensorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperatur (°C)',
                data: temperatures,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Uhrzeit'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperatur (°C)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}
