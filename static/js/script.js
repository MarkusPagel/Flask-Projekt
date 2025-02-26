document.addEventListener('DOMContentLoaded', () => {
    console.log("Script.js wurde geladen!");
    updateDateFilter();
    const graphButton = document.getElementById('show-graph');
    const datumSelect = document.getElementById('datum-select');
    const tableButton = document.getElementById('show-table');
    const graphContainer = document.getElementById('graph-container');
    const tableContainer = document.getElementById('table-container');
    
    // 🟢 Event-Listener für den "Diagramm"-Button
    if (graphButton) {
        graphButton.addEventListener('click', () => {
            graphContainer.style.display = 'block';
            tableContainer.style.display = 'none';
            loadGraphData();
        });
    } else {
        console.warn("Button 'show-graph' nicht gefunden!");
    }

    // 🟢 Event-Listener für den "Tabelle"-Button
    if (tableButton) {
        tableButton.addEventListener('click', () => {
            graphContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            loadTableData();
        });
    } else {
        console.warn("Button 'show-table' nicht gefunden!");
    }

    // 🟢 Event-Listener für das Datum-Dropdown → Graphen neu laden
    if (datumSelect) {
        datumSelect.addEventListener('change', loadGraphData);
    } else {
        console.warn("Dropdown 'datum-select' nicht gefunden!");
    }

    // 🟢 Graph direkt beim Laden anzeigen
    loadGraphData();
});

// 🟢 Variable für das Diagramm
let tempChart;  

async function updateDateFilter() {
    console.log("Filter aktualisieren...");

    const drinnen = document.getElementById('mode-select').value;
    const standortSelect = document.getElementById('standort-select');
    const datumSelect = document.getElementById('datum-select');

    let url = `/api/filter-options`;
    if (drinnen) {
        url += `?drinnen=${drinnen}`;
    }

    console.log("Gesendete URL:", url);  // 🔍 Prüfen, was gesendet wird

    const response = await fetch(url);
    const data = await response.json();

    console.log("Gefilterte Daten:", data);

    // 🟢 Ort-Dropdown aktualisieren
    standortSelect.innerHTML = '';  
    if (data.orte.length > 0) {
        data.orte.forEach(ort => {
            const option = document.createElement('option');
            option.value = ort;
            option.textContent = ort;
            standortSelect.appendChild(option);
        });

        // Falls nur ein Ort vorhanden ist, wähle ihn automatisch aus
        if (data.orte.length === 1) {
            standortSelect.value = data.orte[0];
        }
    } else {
        console.warn("Keine Orte gefunden!");
    }

    // 🟢 Datum-Dropdown aktualisieren
    datumSelect.innerHTML = '';  
    if (data.daten.length > 0) {
        data.daten.forEach(datum => {
            const option = document.createElement('option');
            option.value = datum;
            option.textContent = datum;
            datumSelect.appendChild(option);
        });

        // Falls nur ein Datum vorhanden ist, wähle es automatisch aus
        if (data.daten.length === 1) {
            datumSelect.value = data.daten[0];
        }
    } else {
        console.warn("Keine verfügbaren Daten gefunden!");
    }
}


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

    // 🟢 Falls der Graph bereits existiert, vorher zerstören!
    if (tempChart) {
        tempChart.destroy();
    }

    // 🟢 Neuen Graphen im Canvas erstellen
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
            maintainAspectRatio: false,  // Verhindert riesige Skalierung
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

    console.log("Graph aktualisiert!");
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
