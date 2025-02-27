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
    const response = await fetch('/api/filter-options',
                                 headers:{
                                     'X-Api-KEY': '65860e3778ed02b85468a74365a6cbe810302485066159f636fe5a165cd2c053';
                                 });
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

    const response = await fetch(url,
                                 headers:{
                                     'X-Api-KEY': '65860e3778ed02b85468a74365a6cbe810302485066159f636fe5a165cd2c053';
                                 });
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

    const response = await fetch(url,
                                 headers:{
                                     'X-Api-KEY': '65860e3778ed02b85468a74365a6cbe810302485066159f636fe5a165cd2c053';
                                 });
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

// Globale Variablen für die Charts
let chart1, chart2, chart3, chart4;

function updateCharts(data) {
    const labels = data.map(entry => entry.uhrzeit);
    const temperatures = data.map(entry => entry.temperatur);
    const humidities = data.map(entry => entry.luftfeuchte);
    const pressures = data.map(entry => entry.pressure);
    const gasLevels = data.map(entry => entry.gas);

    // Falls Diagramme noch nicht existieren, erstelle sie
    if (!chart1) {
        const ctx1 = document.getElementById('myChart1').getContext('2d');
        chart1 = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperatur (°C)',
                    data: temperatures,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)'
                }]
            }
        });
    } else {
        // Falls das Diagramm schon existiert, nur die Daten aktualisieren
        chart1.data.labels = labels;
        chart1.data.datasets[0].data = temperatures;
        chart1.update();
    }

    if (!chart2) {
        const ctx2 = document.getElementById('myChart2').getContext('2d');
        chart2 = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Luftfeuchte (%)',
                    data: humidities,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }]
            }
        });
    } else {
        chart2.data.labels = labels;
        chart2.data.datasets[0].data = humidities;
        chart2.update();
    }

    if (!chart3) {
        const ctx3 = document.getElementById('myChart3').getContext('2d');
        chart3 = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Luftdruck (hPa)',
                    data: pressures,
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(255, 206, 86, 1)'
                }]
            }
        });
    } else {
        chart3.data.labels = labels;
        chart3.data.datasets[0].data = pressures;
        chart3.update();
    }

    if (!chart4) {
        const ctx4 = document.getElementById('myChart4').getContext('2d');
        chart4 = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Luftqualität (ppm)',
                    data: gasLevels,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2
                }]
            }
        });
    } else {
        chart4.data.labels = labels;
        chart4.data.datasets[0].data = gasLevels;
        chart4.update();
    }
}

