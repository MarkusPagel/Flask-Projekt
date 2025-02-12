#!/bin/bash

echo "🚀 Starte Auto-Deployment..."

# Gehe ins Projektverzeichnis
cd /home/markus/flask-projekt || { echo "❌ Projektverzeichnis nicht gefunden!"; exit 1; }

# Neuesten Code von GitHub ziehen
echo "🔄 Hole neuesten Code von GitHub..."
git pull origin main || { echo "❌ Fehler beim Git Pull!"; exit 1; }

# Docker-Container neu bauen
echo "🐳 Baue Docker-Image neu..."
docker build -t flask-app . || { echo "❌ Fehler beim Bauen des Docker-Images!"; exit 1; }

# Alten Container stoppen und löschen
echo "🛑 Stoppe alten Container..."
docker stop flask-app || echo "ℹ️ Kein laufender Container gefunden."
docker rm flask-app || echo "ℹ️ Kein alter Container zum Löschen gefunden."

# Neuen Container starten
echo "🚀 Starte neuen Container..."
docker run -d --name flask-app -p 5000:5000 flask-app || { echo "❌ Fehler beim Starten des Containers!"; exit 1; }

echo "✅ Auto-Deployment abgeschlossen!"
