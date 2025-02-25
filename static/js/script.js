async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();

    console.log("Daten vom Server:", data);
}

fetchData();

async function updateDateFilter() {
    const drinnen = document.getElementById('mode-select').value;
    const standort = document.getElementById('standort-select').value;

    let url = `/api/filter-options`;
    if (drinnen || standort) {
        url += `?drinnen=${drinnen}&standort=${standort}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    // Datum-Dropdown aktualisieren
    const datumSelect = document.getElementById('datum-select');
    datumSelect.innerHTML = '<option value="">Datum wählen</option>';
    data.daten.forEach(datum => {
        const option = document.createElement('option');
        option.value = datum;
        option.textContent = datum;
        datumSelect.appendChild(option);
    });
}

// Events setzen: Wenn Drinnen/Draußen oder der Ort geändert wird, aktualisiere die Datumsauswahl
document.getElementById('mode-select').addEventListener('change', updateDateFilter);
document.getElementById('standort-select').addEventListener('change', updateDateFilter);


document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graph-container');
    const tableContainer = document.getElementById('table-container');
    const tableButton = document.getElementById('show-table');  // Hier direkt das Element holen
    const chartButton = document.getElementById('show-graph');

    if (tableButton && chartButton) {  // Sicherstellen, dass die Buttons existieren
        tableButton.addEventListener('click', () => {
            graphContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            loadTableData();  // Jetzt die Tabelle mit Daten füllen!
        });

        chartButton.addEventListener('click', () => {
            graphContainer.style.display = 'grid';
            tableContainer.style.display = 'none';
        });
    }
});



async function loadTableData() {
    const datumFilter = document.getElementById('datum-select').value;  // Gewähltes Datum abrufen
    let url = '/api/data';
    
    if (datumFilter) {
        url += `?datum=${datumFilter}`;  // Filter an API-URL anhängen
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

// Wenn das Datum geändert wird, wird die Tabelle neu geladen
document.getElementById('datum-select').addEventListener('change', () => {
    loadTableData();
});

// Falls die Tabelle geöffnet wird, soll sie direkt mit dem aktuellen Filter geladen werden
document.getElementById('show-table').addEventListener('click', () => {
    loadTableData();
});


// Diese Funktion wird aufgerufen, wenn der Benutzer auf "Tabelle" klickt
document.getElementById('show-table').addEventListener('click', () => {
    loadTableData();
});
