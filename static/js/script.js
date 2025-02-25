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


