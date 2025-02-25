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
    standortSelect.innerHTML = '<option value="">Ort wählen</option>';
    data.standorte.forEach(ort => {
        const option = document.createElement('option');
        option.value = ort;
        option.textContent = ort;
        standortSelect.appendChild(option);
    });

    // Datum einfügen
    const datumSelect = document.querySelector('#datum-select');
    datumSelect.innerHTML = '<option value="">Datum wählen</option>';
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

async function loadTableData() {
    const response = await fetch('/api/data');
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

// Diese Funktion wird aufgerufen, wenn der Benutzer auf "Tabelle" klickt
document.getElementById('show-table').addEventListener('click', () => {
    loadTableData();
});


document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graph-container');
    const tableContainer = document.getElementById('table-container');
    const tableButton = document.querySelector('.btn:nth-child(1)'); // Erster Button = "Tabelle"
    const chartButton = document.querySelector('.btn:nth-child(2)'); // Zweiter Button = "Diagramm"

    tableButton.addEventListener('click', () => {
        graphContainer.style.display = 'none';
        tableContainer.style.display = 'block';
    });

    chartButton.addEventListener('click', () => {
        graphContainer.style.display = 'grid';
        tableContainer.style.display = 'none';
    });
});



