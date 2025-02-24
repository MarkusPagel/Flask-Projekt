async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();

    console.log("Daten vom Server:", data);
}

fetchData();

async function loadStandorte() {
    const response = await fetch('/api/standorte');
    const standorte = await response.json();

    const select = document.querySelector('.input'); // dein Dropdown-Menü auswählen
    select.innerHTML = '';  // vorherige Einträge löschen

    standorte.forEach(ort => {
        const option = document.createElement('option');
        option.value = ort;
        option.textContent = ort;
        select.appendChild(option);
    });
}

loadStandorte();

