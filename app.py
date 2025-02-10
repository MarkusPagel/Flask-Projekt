from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)  # Flask-App erstellen

# SQLite-Datenbank konfigurieren
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'  # Lokale Datenbank "data.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)  # SQLAlchemy initialisieren

# Datenbankmodell erstellen
class SensorData(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Automatische ID
    sensor = db.Column(db.String(2), nullable=False)  # Sensorname
    temp = db.Column(db.Float, nullable=False)
    humid = db.Column(db.Float, nullable=False)
    mode = db.Column(db.String(50), nullable=False) 

# Datenbank erstellen (falls noch nicht vorhanden)
with app.app_context():
    db.create_all()

# Route: Daten empfangen und speichern
@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.get_json()  # JSON-Daten abrufen
    if not data:
        return jsonify({"error": "Keine Daten empfangen"}), 400

    # Daten aus JSON extrahieren
    sensor = data.get('sensor')
    temp = data.get('temp')
    humid = data.get('humid')
    mode = data.get('mode')

    # Daten in der Datenbank speichern
    new_entry = SensorData(sensor=sensor, temp=temp, humid=humid, mode=mode )
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({"message": "Daten erfolgreich gespeichert"}), 201

# Route: Alle gespeicherten Daten abrufen
@app.route('/api/data', methods=['GET'])
def get_data():
    # Alle Daten aus der Datenbank abrufen
    all_data = SensorData.query.all()
    result = [{"id": d.id, "sensor": d.sensor, "value": d.value} for d in all_data]
    return jsonify(result), 200

if __name__ == '__main__':
    # Flask-Server starten
    app.run(host='0.0.0.0', port=5000, debug=True)
