FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY ingester/requirements.txt /app/ingester/requirements.txt
RUN pip install --no-cache-dir -r /app/ingester/requirements.txt

COPY backend /app/backend
COPY ingester /app/ingester
COPY .env.example /app/.env

WORKDIR /app/ingester
CMD ["python", "ingester.py"]
