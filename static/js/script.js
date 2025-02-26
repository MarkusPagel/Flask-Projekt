document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graph-container');
    const tableContainer = document.getElementById('table-container');
    const tableButton = document.getElementById('show-table');
    const chartButton = document.getElementById('show-graph');
    const modeSelect = document.getElementById('mode-select');
    const standortSelect = document.getElementById('standort-select');
    const datumSelect = document.getElementById('datum-select');

    // 🟢 Sicherstellen, dass alle Dropdowns existieren
    if (modeSelect && standortSelect && datumSelect) {
        modeSelect.addEventListener('change', updateDateFilter);
        standortSelect.addEventListener('change', updateDateFilter);
        datumSelect.addEventListener('change', loadTableData);
    }

    // 🟢 Sicherstellen, dass die Buttons existieren
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
    }

    // 🟢 Lade alle Orte direkt beim Start
    loadAllOrte();
});

// 🟢 Alle Orte abrufen & Dropdown füllen (unabhängig von Drinnen/Draußen)
async function loadAllOrte() {
    const standortSelect = document.getElementById('standort-select');
    const response = await fetch('/api/orte');
    const data = await response.json();

    standortSelect.innerHTML = '<option value="">Ort wählen</option>';
    data.orte.forEach(ort => {
        const option = document.createElement('option');
        option.value = ort;
        option.textContent = ort;
        standortSelect.appendChild(option);
    });
}

// 🟢 Datumsauswahl basierend auf Drinnen/Draußen & Ort einschränken
async function updateDateFilter() {
    const drinnen = document.getElementById('mode-select').value;
    const standortSelect = document.getElementById('standort-select');

    let url = `/api/filter-options`;
    if (drinnen) {
        url += `?drinnen=${drinnen}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    // 🟢 1. Orte IMMER aktualisieren (egal, ob Drinnen/Draußen gewählt wurde)
    standortSelect.innerHTML = '<option value="">Ort wählen</option>';
    data.orte.forEach(ort => {
        const option = document.createElement('option');
        option.value = ort;
        option.textContent = ort;
        standortSelect.appendChild(option);
    });

    // 🟢 2. Datum-Dropdown basierend auf Drinnen/Draußen + Ort aktualisieren
    const datumSelect = document.getElementById('datum-select');
    datumSelect.innerHTML = '<option value="">Datum wählen</option>';
    data.daten.forEach(datum => {
        const option = document.createElement('option');
        option.value = datum;
        option.textContent = datum;
        datumSelect.appendChild(option);
    });
}

// Wenn Drinnen/Draußen geändert wird → Aktualisiere die Optionen
document.getElementById('mode-select').addEventListener('change', updateDateFilter);


// 🟢 Tabelle mit Daten füllen
async function loadTableData() {
    const datumFilter = document.getElementById('datum-select').value;  
    let url = '/api/data';

    if (datumFilter) {
        url += `?datum=${datumFilter}`;
    }

    const response = await fetch(url);
    const data = await response.json();

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
        `;
        tableBody.appendChild(row);
    });
}
