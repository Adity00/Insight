FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project
COPY . .

# Expose port (optional for documentation, Railway uses $PORT)
EXPOSE 8000

# Run with shell form to ensure $PORT expansion
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
