from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz
from dotenv import load_dotenv
import os

# .env-Datei laden
load_dotenv()

# Umgebungsvariablen abrufen
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'Wetterdaten')

app = Flask(__name__)

# SQLAlchemy-Datenbankkonfiguration
app.config['SQLALCHEMY_DATABASE_URI'] = f'mariadb+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:3306/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Sensoren(db.Model):
    __tablename__ = 'sensoren'
    id = db.Column(db.Integer, primary_key=True)
    sensor_code = db.Column(db.String(50), unique=True, nullable=False)  # Z. B. "A1"
    standort = db.Column(db.String(100), nullable=False)
    aktiv = db.Column(db.Boolean, default=True)  # Standard: Sensor ist aktiv

# Datenbankmodell mit neuen Spalten für pressure & gas
class Wetterdaten(db.Model):
    __tablename__ = 'wetterdaten'
    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensoren.id'), nullable=True)  # Foreign Key zu sensoren
    temperatur = db.Column(db.Float, nullable=False)
    luftfeuchte = db.Column(db.Float, nullable=False)
    pressure = db.Column(db.Float, nullable=True)  # Darf NULL sein
    gas = db.Column(db.Float, nullable=True)  # Darf NULL sein
    drinnen = db.Column(db.Boolean, nullable=False)  # tinyint(1) → Boolean
    standort = db.Column(db.String(100), nullable=False)
    datum = db.Column(db.Date, nullable=False)
    uhrzeit = db.Column(db.Time, nullable=False)

    # Beziehung zur Sensortabelle
    sensor = db.relationship('Sensoren', backref=db.backref('messungen', lazy=True))

# Route für die Webseite
@app.route('/')
def home():
    return render_template('index.html')

# API: Alle gespeicherten Daten abrufen
@app.route('/api/data', methods=['GET'])
def get_data():
    alle_daten = Wetterdaten.query.all()
    result = [
        {
            "id": d.id,
            "sensor_id": d.sensor_id,
            "temperatur": d.temperatur,
            "luftfeuchte": d.luftfeuchte,
            "pressure": d.pressure,
            "gas": d.gas,
            "drinnen": d.drinnen,
            "standort": d.standort,
            "datum": d.datum.strftime('%Y-%m-%d'),
            "uhrzeit": d.uhrzeit.strftime('%H:%M:%S')
        } for d in alle_daten
    ]
    return jsonify(result), 200

# API: Wetterdaten empfangen und speichern
@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Keine Daten empfangen"}), 400

    sensor_code = data.get('sensor')  # Der Code, z. B. "A1"
    temperatur = data.get('temp')
    luftfeuchte = data.get('humid')
    pressure = data.get('pressure')
    gas = data.get('gas')
    drinnen = 1 if data.get('mode') == "Inside" else 0

    # Sensor in der Datenbank suchen
    sensor = Sensoren.query.filter_by(sensor_code=sensor_code).first()
    if not sensor:
        return jsonify({"error": f"Sensor {sensor_code} nicht gefunden"}), 400

    # Standort aus der Sensortabelle holen
    standort = sensor.standort  # Speichert den Standort zum Zeitpunkt der Messung

    # Aktuelles Server-Datum & Uhrzeit mit korrekter Zeitzone
    berlin_tz = pytz.timezone('Europe/Berlin')
    now = datetime.now(berlin_tz)
    datum = now.date()
    uhrzeit = now.time()

    # Daten in die Datenbank speichern
    neuer_eintrag = Wetterdaten(
        sensor_id=sensor.id,
        temperatur=temperatur,
        luftfeuchte=luftfeuchte,
        pressure=pressure,
        gas=gas,
        drinnen=drinnen,
        standort=standort,  # Hier wird der Standort gespeichert
        datum=datum,
        uhrzeit=uhrzeit
    )
    db.session.add(neuer_eintrag)
    db.session.commit()

    return jsonify({"message": "Daten erfolgreich gespeichert"}), 201

@app.route('/api/data/all')
def get_all_data():
    cursor.execute("SELECT * FROM messwerte ORDER BY timestamp DESC LIMIT 100")
    data = cursor.fetchall()
    return jsonify(data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
