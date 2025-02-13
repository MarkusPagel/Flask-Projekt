from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from dotenv import load_dotenv
import os

# .env-Datei laden
load_dotenv()

# Umgebungsvariablen aus der .env-Datei abrufen
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'Wetterdaten')

app = Flask(__name__)

# SQLAlchemy-Datenbankkonfiguration mit Umgebungsvariablen
app.config['SQLALCHEMY_DATABASE_URI'] = f'mariadb+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:3306/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Datenbankmodell anpassen
class Wetterdaten(db.Model):
    __tablename__ = 'wetterdaten'
    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.String(50), nullable=False)
    temperatur = db.Column(db.Float, nullable=False)
    luftfeuchte = db.Column(db.Float, nullable=False)
    drinnen = db.Column(db.Boolean, nullable=False)
    standort = db.Column(db.String(100), nullable=False)
    datum = db.Column(db.Date, nullable=False)
    uhrzeit = db.Column(db.Time, nullable=False)

# Route: Daten empfangen und speichern
@app.route('/api/data', methods=['POST'])
@app.route('/api/data', methods=['POST'])
def receive_data():
    raw_data = request.get_data().decode("utf-8")  # Rohe Anfrage ausgeben
    print(f"📩 Empfangene rohe Daten: {raw_data}")  # Debug-Log

    try:
        json_data = request.get_json()
        print(f"📜 Geparstes JSON: {json_data}")  # Debug-Log für das JSON
    except Exception as e:
        print(f"⚠️ JSON-Parsing-Fehler: {str(e)}")
        return jsonify({"error": "Ungültiges JSON-Format"}), 400

    if not json_data:
        return jsonify({"error": "Keine Daten empfangen"}), 400

    return jsonify({"message": "Daten erfolgreich erhalten"}), 201


    # Daten in der Datenbank speichern
    neuer_eintrag = Wetterdaten(
        sensor_id=sensor_id,
        temperatur=temperatur,
        luftfeuchte=luftfeuchte,
        drinnen=drinnen,
        standort=standort,
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
        "standort": d.standort,
        "datum": d.datum if isinstance(d.datum, str) else d.datum.strftime('%Y-%m-%d'),
        "uhrzeit": d.uhrzeit if isinstance(d.uhrzeit, str) else d.uhrzeit.strftime('%H:%M:%S')
    } for d in alle_daten
]

    return jsonify(result), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
