#!/bin/bash

echo "🚀 Starte Auto-Deployment..."

# Ins Projektverzeichnis wechseln
cd /home/markus/flask-projekt || { echo "❌ Projektverzeichnis nicht gefunden!"; exit 1; }

# Sicherstellen, dass das Netzwerk existiert
if ! docker network ls | grep -q "flask-network"; then
  echo "🌐 Erstelle Docker-Netzwerk 'flask-network'..."
  docker network create flask-network
else
  echo "🌐 Docker-Netzwerk 'flask-network' existiert bereits."
fi

# Neuesten Code von GitHub holen
echo "🔄 Hole neuesten Code von GitHub..."
git pull origin main || { echo "❌ Fehler beim Git Pull!"; exit 1; }

# Docker-Image neu bauen
echo "🐳 Baue Docker-Image neu..."
docker build -t flask-app . || { echo "❌ Fehler beim Bauen des Docker-Images!"; exit 1; }

# Alten Container stoppen und löschen
echo "🛑 Stoppe alten Container..."
docker stop flask-app || echo "ℹ️ Kein laufender Container gefunden."
docker rm flask-app || echo "ℹ️ Kein alter Container zum Löschen gefunden."

# Neuen Container starten mit Netzwerk und Umgebungsvariablen
echo "🚀 Starte neuen Container mit Netzwerk und .env-Datei..."
docker run --env-file .env --network flask-network -d --name flask-app -p 80:80 flask-app || { echo "❌ Fehler beim Starten des Containers!"; exit 1; }

echo "✅ Auto-Deployment abgeschlossen!"

