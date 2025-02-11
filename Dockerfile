# Verwende ein leichtes Python-Image als Basis
FROM python:3.10-slim

# Installiere Systemabhängigkeiten für MariaDB
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    python3-dev \
    && apt-get clean

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere die requirements.txt in den Container
COPY requirements.txt requirements.txt

# Installiere die Abhängigkeiten
RUN pip install --no-cache-dir -r requirements.txt

# Kopiere den restlichen Code in den Container
COPY . .

# Starte die App mit Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
