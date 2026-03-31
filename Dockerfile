FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    Django \
    djangorestframework \
    django-cors-headers \
    psycopg2-binary \
    numpy \
    scipy

# Copy project files
COPY . /app/

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"]