document.addEventListener('DOMContentLoaded', async () => {
    console.log("Script.js wurde geladen!");

    const graphContainer = document.getElementById('graph-container');
    const tableContainer = document.getElementById('table-container');
    const tableButton = document.getElementById('show-table');
    const chartButton = document.getElementById('show-graph');
    const modeSelect = document.getElementById('mode-select');
    const standortSelect = document.getElementById('standort-select');
    const datumSelect = document.getElementById('datum-select');

    let sensorChart; // Variable für Chart.js

    if (tableButton && chartButton) {
        tableButton.addEventListener('click', () => {
            graphContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            loadTableData();
        });

        chartButton.addEventListener('click', () => {
            graphContainer.style.display = 'grid';
            tableContainer.style.display = 'none';
            loadChartData(); // Diagramm neu laden
        });
    } else {
        console.warn("Tabelle- oder Diagramm-Button nicht gefunden!");
    }

    if (modeSelect && standortSelect && datumSelect) {
        modeSelect.addEventListener('change', updateDateFilter);
        standortSelect.addEventListener('change', updateDateFilter);
        datumSelect.addEventListener('change', loadTableData);
    } else {
        console.warn("Dropdowns nicht gefunden!");
    }

    await loadAllOrte();

    // 🟢 Funktion: Holt die Messwerte & erstellt das Diagramm
    async function loadChartData() {
        console.log("Lade Chart-Daten...");
        const datumFilter = datumSelect.value;
        let url = '/api/data';

        if (datumFilter) {
            url += `?datum=${datumFilter}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        console.log("Daten für Chart.js:", data);

        const labels = data.map(entry => entry.uhrzeit); // X-Achse: Uhrzeiten
        const temperatures = data.map(entry => entry.temperatur); // Y-Achse: Temperaturen

        const ctx = document.getElementById('sensor-chart').getContext('2d');

        if (sensorChart) {
            sensorChart.destroy(); // Vorhandenes Diagramm löschen
        }

        sensorChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperatur (°C)',
                    data: temperatures,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    }
});
