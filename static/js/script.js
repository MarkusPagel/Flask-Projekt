async function fetchData() {
    let data;

    if (window.location.hostname === "localhost") {
        // Lokale Testdaten
        data = [
            { sensor_id: "A1", temperatur: 22.5, datum: "2024-02-13", uhrzeit: "15:00:00" },
            { sensor_id: "B2", temperatur: 19.8, datum: "2024-02-13", uhrzeit: "15:05:00" },
            { sensor_id: "C3", temperatur: 21.3, datum: "2024-02-13", uhrzeit: "15:10:00" }
        ];
    } else {
        // Echte Daten vom Server abrufen
        const response = await fetch('/api/data');
        data = await response.json();
    }

    const labels = data.map(d => `${d.datum} ${d.uhrzeit}`);
    const values = data.map(d => d.temperatur);

    const ctx = document.getElementById('tempChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperaturverlauf',
                data: values,
                borderColor: 'red',
                borderWidth: 2,
                fill: false
            }]
        }
    });
}

fetchData();
