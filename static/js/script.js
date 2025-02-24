async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();

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
