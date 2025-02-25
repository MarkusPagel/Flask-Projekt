async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();

    console.log("Daten vom Server:", data);
}

fetchData();

async function loadFilterOptions() {
    const response = await fetch('/api/filter-options');
    const data = await response.json();

    // Orte einfügen
    const standortSelect = document.querySelector('#standort-select');
    data.standorte.forEach(ort => {
        const option = document.createElement('option');
        option.value = ort;
        option.textContent = ort;
        standortSelect.appendChild(option);
    });

    // Datum einfügen
    const datumSelect = document.querySelector('#datum-select');
    data.daten.forEach(datum => {
        const option = document.createElement('option');
        option.value = datum;
        option.textContent = datum;
        datumSelect.appendChild(option);
    });

    // Drinnen/Draußen bleibt unverändert (ist statisch definiert)
}

// Funktion starten
loadFilterOptions();

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

document.getElementById('datum-select').addEventListener('change', () => {
    // Falls die Tabelle gerade nicht sichtbar ist, schalte sie ein
    document.getElementById('graph-container').style.display = 'none';
    document.getElementById('table-container').style.display = 'block';
    
    // Lade die Tabelle direkt mit den gefilterten Daten
    loadTableData();
});

});

// Falls die Tabelle geöffnet wird, soll sie direkt mit dem aktuellen Filter geladen werden
document.getElementById('show-table').addEventListener('click', () => {
    loadTableData();
});


// Diese Funktion wird aufgerufen, wenn der Benutzer auf "Tabelle" klickt
document.getElementById('show-table').addEventListener('click', () => {
    loadTableData();
});





