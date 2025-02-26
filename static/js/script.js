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
    if (tableButton && chartButton) {
        tableButton.addEventListener('click', () => {
            graphContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            loadTableData();
        });

        chartButton.addEventListener('click', () => {
            graphContainer.style.display = 'grid';
            tableContainer.style.display = 'none';
        });
    } else {
        console.warn("Tabelle- oder Diagramm-Button nicht gefunden!");
    }

    // 🟢 Event-Listener für Dropdowns setzen
    if (modeSelect && standortSelect && datumSelect) {
        modeSelect.addEventListener('change', updateDateFilter);
        standortSelect.addEventListener('change', updateDateFilter);
        datumSelect.addEventListener('change', loadTableData);
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

    console.log("Gesendete URL:", url);  // 🟢 Debugging, um die URL zu sehen

    const response = await fetch(url);
    const data = await response.json();

    console.log("Gefilterte Daten:", data);

    // 🟢 Datum-Dropdown vorher komplett leeren
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

let tempChart;  // Variable für das Diagramm

async function loadGraphData() {
    console.log("Lade Graph-Daten...");

    const datumFilter = document.getElementById('datum-select').value;
    let url = '/api/data';

    if (datumFilter) {
        url += `?datum=${datumFilter}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    console.log("Graph-Daten:", data);

    // Labels = Uhrzeiten, Werte = Temperaturen
    const labels = data.map(entry => entry.uhrzeit);
    const temperatures = data.map(entry => entry.temperatur);

    // Falls der Graph bereits existiert, vorher löschen
    if (tempChart) {
        tempChart.destroy();
    }

    // Neuen Graphen erstellen
    const ctx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperaturverlauf',
                data: temperatures,
                borderColor: 'red',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
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
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const graphButton = document.getElementById('show-graph');

    if (graphButton) {
        graphButton.addEventListener('click', () => {
            loadGraphData();
        });
    } else {
        console.warn("Button 'show-graph' nicht gefunden!");
    }
});



