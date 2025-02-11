from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# MariaDB-Datenbank konfigurieren (Passe die Zugangsdaten entsprechend an)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mariadb://user:password@db_host:3306/Wetterdaten'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# SQLAlchemy initialisieren
db = SQLAlchemy(app)

# Datenbankmodell anpassen
class Wetterdaten(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Automatische ID
    sensor_id = db.Column(db.String(50), nullable=False)  # Sensor-ID
    temperatur = db.Column(db.Float, nullable=False)  # Temperatur
    luftfeuchte = db.Column(db.Float, nullable=False)  # Luftfeuchte
    drinnen = db.Column(db.Boolean, nullable=False)  # Drinnen (True) oder Draußen (False)
    ort = db.Column(db.String(100), nullable=False)  # Standort, z.B. Emsbüren
    datum = db.Column(db.Date, nullable=False)  # Datum
    uhrzeit = db.Column(db.Time, nullable=False)  # Uhrzeit

# Datenbank erstellen (falls noch nicht vorhanden)
with app.app_context():
    db.create_all()

# Route: Daten empfangen und speichern
@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Keine Daten empfangen"}), 400

    # Daten aus JSON extrahieren
    sensor_id = data.get('sensor_id')
    temperatur = data.get('temperatur')
    luftfeuchte = data.get('luftfeuchte')
    drinnen = data.get('drinnen')
    ort = data.get('ort')
    datum = data.get('datum')  # Format: YYYY-MM-DD
    uhrzeit = data.get('uhrzeit')  # Format: HH:MM:SS

    # Datum und Uhrzeit in DateTime-Objekte umwandeln
    try:
        datum_obj = datetime.strptime(datum, '%Y-%m-%d').date()
        uhrzeit_obj = datetime.strptime(uhrzeit, '%H:%M:%S').time()
    except ValueError:
        return jsonify({"error": "Ungültiges Datum- oder Uhrzeitformat"}), 400

    # Daten in der Datenbank speichern
    neuer_eintrag = Wetterdaten(
        sensor_id=sensor_id,
        temperatur=temperatur,
        luftfeuchte=luftfeuchte,
        drinnen=drinnen,
        ort=ort,
        datum=datum_obj,
        uhrzeit=uhrzeit_obj
    )
    db.session.add(neuer_eintrag)
    db.session.commit()

    return jsonify({"message": "Daten erfolgreich gespeichert"}), 201

# Route: Alle gespeicherten Daten abrufen
@app.route('/api/data', methods=['GET'])
def get_data():
    alle_daten = Wetterdaten.query.all()
    result = [
        {
            "id": d.id,
            "sensor_id": d.sensor_id,
            "temperatur": d.temperatur,
            "luftfeuchte": d.luftfeuchte,
            "drinnen": d.drinnen,
            "ort": d.ort,
            "datum": d.datum.strftime('%Y-%m-%d'),
            "uhrzeit": d.uhrzeit.strftime('%H:%M:%S')
        } for d in alle_daten
    ]
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
