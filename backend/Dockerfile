FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install pg_isready (part of postgresql-client)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY . .

COPY wait-for-db.sh .
RUN chmod +x wait-for-db.sh

# Use the wait script as the entrypoint
ENTRYPOINT ["./wait-for-db.sh"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]