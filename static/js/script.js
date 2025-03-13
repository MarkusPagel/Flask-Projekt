document.addEventListener('DOMContentLoaded', () => {
    console.log("Script.js wurde geladen!");

    const graphContainer = document.getElementById('graph-container');
    const tableContainer = document.getElementById('table-container');
    const tableButton = document.getElementById('show-table');
    const chartButton = document.getElementById('show-graph');
    const modeSelect = document.getElementById('mode-select');
    const standortSelect = document.getElementById('standort-select');
    const datumSelect = document.getElementById('datum-select');

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
            graphContainer.style.display = 'grid';
            tableContainer.style.display = 'none';
            updateData();
        });
    } else {
        console.warn("Diagramm-Button nicht gefunden!");
    }

    if (modeSelect && standortSelect && datumSelect) {
        modeSelect.addEventListener('change', updateDateFilter);
        standortSelect.addEventListener('change', updateDateFilter);
        datumSelect.addEventListener('change', updateData);
    } else {
        console.warn("Dropdowns nicht gefunden!");
    }

    loadAllOrte();
});

async function loadAllOrte() {
    console.log("Lade alle Orte...");
    const standortSelect = document.getElementById('standort-select');
    
    const response = await fetch('/api/filter-options', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
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

    updateDateFilter();
}

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
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    console.log("Gefilterte Daten:", data);
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
        datumSelect.value = data.daten[0];
        updateData();
    }
}

async function updateData() {
    console.log("Lade Daten für Tabelle & Diagramm...");
    const datumFilter = document.getElementById('datum-select').value;
    let url = '/api/data';
    if (datumFilter) {
        url += `?datum=${datumFilter}`;
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    console.log("API-Daten:", data);
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
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
    updateCharts(data);
}

function updateCharts(data) {
    const labels = data.map(entry => entry.uhrzeit);
    const temperatures = data.map(entry => entry.temperatur);
    const humidities = data.map(entry => entry.luftfeuchte);
    const pressures = data.map(entry => entry.pressure);
    const gasLevels = data.map(entry => entry.gas);

    updateChart('Temperaturverlauf (°C)', 'chart-temperatur', 'line', labels, temperatures, 'rgba(255, 99, 132, 1)');
    updateChart('Luftfeuchtigkeit (%)', 'chart-luftfeuchte', 'bar', labels, humidities, 'rgba(54, 162, 235, 1)');
    updateChart('Luftdruck (hPa)', 'chart-luftdruck', 'line', labels, pressures, 'rgba(255, 206, 86, 1)');
    updateChart('Luftqualität (ppm)', 'chart-luftqualitaet', 'bar', labels, gasLevels, 'rgba(75, 192, 192, 1)');
}
