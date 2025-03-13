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

async function loadAllOrte() {
    const standortSelect = document.getElementById('standort-select');
    const response = await fetch('/api/filter-options');
    const data = await response.json();

    standortSelect.innerHTML = data.orte.map(ort => `<option value="${ort}">${ort}</option>`).join('');
    updateDateFilter();
}

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

async function updateData() {
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

let charts = {};
function updateCharts(data) {
    const chartConfigs = [
        { id: 'chart-temperatur', label: 'Temperatur (°C)', data: data.map(e => e.temperatur), type: 'line', color: 'rgba(255, 99, 132, 1)' },
        { id: 'chart-luftfeuchte', label: 'Luftfeuchtigkeit (%)', data: data.map(e => e.luftfeuchte), type: 'bar', color: 'rgba(54, 162, 235, 1)' },
        { id: 'chart-luftdruck', label: 'Luftdruck (hPa)', data: data.map(e => e.pressure), type: 'line', color: 'rgba(255, 206, 86, 1)' },
        { id: 'chart-luftqualitaet', label: 'Luftqualität (ppm)', data: data.map(e => e.gas), type: 'bar', color: 'rgba(75, 192, 192, 1)' }
    ];

    chartConfigs.forEach(({ id, label, data, type, color }) => {
        if (!charts[id]) {
            charts[id] = new Chart(document.getElementById(id).getContext('2d'), {
                type: type,
                data: {
                    labels: data.map((_, i) => i + 1),
                    datasets: [{ label, data, backgroundColor: color, borderColor: color, borderWidth: 2 }]
                }
            });
        } else {
            charts[id].data.labels = data.map((_, i) => i + 1);
            charts[id].data.datasets[0].data = data;
            charts[id].update();
        }
    });
}
