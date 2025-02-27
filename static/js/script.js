document.addEventListener('DOMContentLoaded', () => {
    console.log("Script.js wurde geladen!");

    const graphContainer = document.getElementById('graph-container');
    const tableContainer = document.getElementById('table-container');
    const tableButton = document.getElementById('show-table');
    const chartButton = document.getElementById('show-graph');
    const modeSelect = document.getElementById('mode-select');
    const standortSelect = document.getElementById('standort-select');
    const datumSelect = document.getElementById('datum-select');

    // 🟢 Fehler vermeiden: Prüfen, ob alle Buttons existieren
    if (tableButton) {
        tableButton.addEventListener('click', () => {
            graphContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            updateData();
        });
    } else {
        console.warn("Tabelle-Button nicht gefunden!");
    }

    if (chartButton) {
        chartButton.addEventListener('click', () => {
            console.log("Diagramm-Button wurde geklickt!");

            // 🟢 Sicherstellen, dass das Diagramm sichtbar wird
            graphContainer.style.display = 'grid';
            tableContainer.style.display = 'none';

            updateData(); // API-Daten für Diagramm & Tabelle laden
        });
    } else {
        console.warn("Diagramm-Button nicht gefunden!");
    }

    // 🟢 Event-Listener für Dropdowns setzen
    if (modeSelect && standortSelect && datumSelect) {
        modeSelect.addEventListener('change', updateDateFilter);
        standortSelect.addEventListener('change', updateDateFilter);
        datumSelect.addEventListener('change', updateData);
    } else {
        console.warn("Dropdowns nicht gefunden!");
    }

    // 🟢 Beim Laden alle Orte abrufen
    loadAllOrte();
});

// 🟢 Alle Orte von Anfang an abrufen
async function loadAllOrte() {
    console.log("Lade alle Orte...");

    const standortSelect = document.getElementById('standort-select');
    const response = await fetch('/api/filter-options');
    const data = await response.json();

    console.log("Antwort von /api/filter-options:", data);

    standortSelect.innerHTML = '';
    data.orte.forEach(ort => {
        const option = document.createElement('option');
        option.value = ort;
        option.textContent = ort;
        standortSelect.appendChild(option);
    });

    // Nach dem Laden der Orte: Filter für das Datum aktualisieren
    updateDateFilter();
}

// 🟢 Datum basierend auf Drinnen/Draußen & Ort filtern → Danach automatisch das neue Datum setzen!
async function updateDateFilter() {
    console.log("Filter aktualisieren...");

    const drinnen = document.getElementById('mode-select').value;
    const standort = document.getElementById('standort-select').value;
    const datumSelect = document.getElementById('datum-select');

    let url = `/api/filter-options`;
    if (drinnen || standort) {
        url += `?drinnen=${drinnen}&standort=${standort}`;
    }

    console.log("Gesendete URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log("Gefilterte Daten:", data);

    // 🟢 Datum-Dropdown vorher komplett leeren
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

        // Falls nur ein Datum existiert → Automatisch setzen & Daten neu laden
        datumSelect.value = data.daten[0];
        updateData(); // Direkt neue Daten laden (Tabelle + Diagramm)
    }
}

// 🟢 API-Daten abrufen & in Tabelle/Diagramm einfügen
async function updateData() {
    console.log("Lade Daten für Tabelle & Diagramm...");

    const datumFilter = document.getElementById('datum-select').value;
    let url = '/api/data';

    if (datumFilter) {
        url += `?datum=${datumFilter}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    console.log("API-Daten:", data);

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

    // 🟢 Chart.js Diagramme aktualisieren
    updateCharts(data);
}

// 🟢 Chart.js Diagramme aktualisieren
function updateCharts(data) {
    const ctx1 = document.getElementById('myChart1').getContext('2d');
    const ctx2 = document.getElementById('myChart2').getContext('2d');
    const ctx3 = document.getElementById('myChart3').getContext('2d');
    const ctx4 = document.getElementById('myChart4').getContext('2d');

    // Beispiel-Daten für die Diagramme
    const labels = data.map(entry => entry.uhrzeit);
    const temperatures = data.map(entry => entry.temperatur);
    const humidities = data.map(entry => entry.luftfeuchte);
    const pressures = data.map(entry => entry.pressure);
    const gasLevels = data.map(entry => entry.gas);

    // Diagramm 1: Temperatur
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperatur (°C)',
                data: temperatures,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
                pointRadius: 3
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: Math.min(...temperatures) - 5,
                    suggestedMax: Math.max(...temperatures) + 5
                }
            }
        }
    });

    // Diagramm 2: Luftfeuchte
    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Luftfeuchte (%)',
                data: humidities,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
                pointRadius: 3
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: Math.min(...humidities) - 5,
                    suggestedMax: Math.max(...humidities) + 5
                }
            }
        }
    });

    // Diagramm 3: Luftdruck
    new Chart(ctx3, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Luftdruck (hPa)',
                data: pressures,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: Math.min(...pressures) - 5,
                    suggestedMax: Math.max(...pressures) + 5
                }
            }
        }
    });

    // Diagramm 4: Luftqualität
    new Chart(ctx4, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Luftqualität (ppm)',
                data: gasLevels,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: Math.min(...gasLevels) - 5,
                    suggestedMax: Math.max(...gasLevels) + 5
                }
            }
        }
    });
}
