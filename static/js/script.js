async function fetchData() {
    let data;

    if (window.location.hostname === "localhost") {

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
