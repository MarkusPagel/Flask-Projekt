// Sicherstellen, dass das Skript erst nach vollständigem Laden des DOMs ausgeführt wird
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
    }

    if (chartButton) {
        chartButton.addEventListener('click', () => {
            graphContainer.style.display = 'grid';
            tableContainer.style.display = 'none';
            updateData();
        });
    }

    if (modeSelect && standortSelect && datumSelect) {
        modeSelect.addEventListener('change', updateDateFilter);
        standortSelect.addEventListener('change', updateDateFilter);
        datumSelect.addEventListener('change', updateData);
    }

    loadAllOrte();
});

// Diese Funktion lädt alle verfügbaren Orte von der API und aktualisiert das Dropdown-Menü
async function loadAllOrte() {
    const standortSelect = document.getElementById('standort-select');
    const response = await fetch('/api/filter-options');
    const data = await response.json();

    standortSelect.innerHTML = data.orte.map(ort => `<option value="${ort}">${ort}</option>`).join('');
    updateDateFilter();
}

// Hier wird das Datum basierend auf den gewählten Filtern aktualisiert und neue Daten geladen
async function updateDateFilter() {
    const drinnen = document.getElementById('mode-select').value;
    const standort = document.getElementById('standort-select').value;
    const datumSelect = document.getElementById('datum-select');
    let url = `/api/filter-options?drinnen=${drinnen}&standort=${standort}`;
    
    const response = await fetch(url);
    const data = await response.json();

    datumSelect.innerHTML = data.daten.length > 0 
        ? data.daten.map(datum => `<option value="${datum}">${datum}</option>`).join('')
        : '<option>Kein Datum verfügbar</option>';

    if (data.daten.length > 0) {
        datumSelect.value = data.daten[0];
        updateData();
    }
}

// Diese Funktion ruft die Messdaten für das gewählte Datum von der API ab und aktualisiert die Tabelle sowie die Diagramme
async function updateData() {
    console.log("Daten geladen");
    const datumFilter = document.getElementById('datum-select').value;
    const response = await fetch(`/api/data?datum=${datumFilter}`);
    const data = await response.json();
    
    document.getElementById('table-body').innerHTML = data.map(entry => `
        <tr>
            <td>${entry.datum}</td>
            <td>${entry.uhrzeit}</td>
            <td>${entry.standort}</td>
            <td>${entry.temperatur} °C</td>
            <td>${entry.luftfeuchte} %</td>
            <td>${entry.pressure ? entry.pressure + " hPa" : "N/A"}</td>
            <td>${entry.gas ? entry.gas + " ppm" : "N/A"}</td>
        </tr>
    `).join('');
    
    updateCharts(data);
}

// Ein Objekt zur Speicherung aller Diagramme, um unnötige Neugenerierung zu vermeiden
let charts = {};

function updateCharts(data) {
    console.log("Empfangene Daten für Diagramme:", data);
    console.log("Labels (Uhrzeiten):", data.map(e => e.uhrzeit));

    const chartConfigs = [
        { id: 'chart-temperatur', label: 'Temperatur (°C)', data: data.map(e => e.temperatur), type: 'line', color: 'rgba(255, 99, 132, 1)' },
        { id: 'chart-luftfeuchte', label: 'Luftfeuchtigkeit (%)', data: data.map(e => e.luftfeuchte), type: 'bar', color: 'rgba(54, 162, 235, 1)' },
        { id: 'chart-luftdruck', label: 'Luftdruck (hPa)', data: data.map(e => e.pressure), type: 'line', color: 'rgba(255, 206, 86, 1)' },
        { id: 'chart-luftqualitaet', label: 'Luftqualität (ppm)', data: data.map(e => e.gas), type: 'bar', color: 'rgba(75, 192, 192, 1)' }
    ];

    chartConfigs.forEach(({ id, label, data, type, color }) => {
        // ❌ Fehler: Uhrzeiten fehlen → Fix: Uhrzeiten als Strings erzwingen
        const labels = data.map(e => String(e.uhrzeit).trim());
        console.log(`Labels für ${id}:`, labels); // Debugging: Zeigt alle Labels in der Konsole an

        if (!charts[id]) {
            charts[id] = new Chart(document.getElementById(id).getContext('2d'), {
                type: type,
                data: {
                    labels: labels, // ✅ Echte Uhrzeiten auf der X-Achse
                    datasets: [{ label, data, backgroundColor: color, borderColor: color, borderWidth: 2 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: {
                                autoSkip: false,  // ❌ Kein Entfernen von Labels!
                                maxRotation: 60,  // 🔄 Labels leicht drehen
                                minRotation: 30,
                                font: { size: 10 }
                            }
                        }
                    }
                }
            });
        } else {
            charts[id].data.labels = labels; // ✅ Update der Labels mit echten Uhrzeiten
            charts[id].data.datasets[0].data = data;
            charts[id].update();
        }
    });
}

