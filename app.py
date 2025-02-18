from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
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

# Datenbankmodell
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

# Route für die Webseite
@app.route('/')
def home():
    return render_template('index.html')

# API gibt entweder Testdaten oder echte Daten zurück
@app.route('/api/data', methods=['GET'])
def get_data():
    # Falls du lokal entwickelst, nutze Testdaten
    if "localhost" in request.host:
        test_daten = [
            {"id": 1, "sensor_id": "A1", "temperatur": 22.5, "datum": "2024-02-13", "uhrzeit": "15:00:00"},
            {"id": 2, "sensor_id": "B2", "temperatur": 19.8, "datum": "2024-02-13", "uhrzeit": "15:05:00"},
            {"id": 3, "sensor_id": "C3", "temperatur": 21.3, "datum": "2024-02-13", "uhrzeit": "15:10:00"}
        ]
        return jsonify(test_daten), 200

    # Falls Flask auf dem Server läuft, nutze echte Daten
    alle_daten = Wetterdaten.query.all()
    result = [
        {
            "id": d.id,
            "sensor_id": d.sensor_id,
            "temperatur": d.temperatur,
            "luftfeuchte": d.luftfeuchte,
            "drinnen": d.drinnen,
            "standort": d.standort,
            "datum": d.datum.strftime('%Y-%m-%d'),
            "uhrzeit": d.uhrzeit.strftime('%H:%M:%S')
        } for d in alle_daten
    ]
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
