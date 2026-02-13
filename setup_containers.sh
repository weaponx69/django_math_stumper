#!/bin/bash

# Django Math Stumper Container Setup Script
# This script sets up the complete containerized environment

set -e

echo "🚀 Django Math Stumper Container Setup"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_warning ".env file not found, creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_status "Created .env from template"
        print_warning "Please edit .env file with your specific configuration"
    else
        print_error ".env.example file not found"
        exit 1
    fi
else
    print_status ".env file already exists"
fi

# Generate a secure secret key if not set
if ! grep -q "SECRET_KEY=" .env || grep -q "your-secret-key-here" .env; then
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
    sed -i "s|SECRET_KEY=.*|SECRET_KEY=${SECRET_KEY}|" .env
    print_status "Generated secure SECRET_KEY"
fi

# Create necessary directories
mkdir -p init-db staticfiles media ssl

# Create a simple initialization script for PostgreSQL
cat > init-db/01-init.sql << 'EOF'
-- PostgreSQL initialization script
-- This will run when the database container starts for the first time

-- Create database if it doesn't exist (handled by environment variables)
-- Create any additional database objects here if needed

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB:-math_stumper} TO ${POSTGRES_USER:-math_user};
EOF

print_status "Created database initialization script"

# Build and start services
echo ""
echo "🏗️  Building and starting services..."

# Build images
docker-compose build

# Start services in detached mode
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "🏥 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T db pg_isready -U ${POSTGRES_USER:-math_user} -d ${POSTGRES_DB:-math_stumper} &> /dev/null; then
    print_status "PostgreSQL is ready"
else
    print_error "PostgreSQL is not ready"
fi

# Check Django
if curl -f http://localhost:8000/api/generate/ &> /dev/null; then
    print_status "Django backend is ready"
else
    print_warning "Django backend may still be starting (check logs with: docker-compose logs django)"
fi

# Check React frontend
if curl -f http://localhost:3000 &> /dev/null; then
    print_status "React frontend is ready"
else
    print_warning "React frontend may still be starting (check logs with: docker-compose logs frontend)"
fi

# Run database migrations
echo ""
echo "🔧 Running database migrations..."
docker-compose exec django python manage.py migrate

# Collect static files
echo ""
echo "📦 Collecting static files..."
docker-compose exec django python manage.py collectstatic --noinput

# Create superuser (optional)
echo ""
echo "👤 Creating Django superuser..."
echo "You will be prompted to create a superuser for the Django admin interface."
docker-compose exec django python manage.py createsuperuser

# Display success message
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Access Information:"
echo "  - Django Admin: http://localhost:8000/admin"
echo "  - React Frontend: http://localhost:3000"
echo "  - API Endpoint: http://localhost:8000/api/generate/"
echo ""
echo "🛠️  Useful Commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Shell into Django: docker-compose exec django bash"
echo "  - Shell into PostgreSQL: docker-compose exec db psql -U math_user -d math_stumper"
echo ""
echo "📁 Important Files:"
echo "  - Environment: .env (edit for your configuration)"
echo "  - Database backups: backup_tasks.json, backup_solutions.json"
echo "  - SSL certificates: ssl/ (for HTTPS)"
echo ""
echo "🔗 Next Steps:"
echo "  1. Edit .env file with your specific configuration"
echo "  2. Run 'docker-compose up -d' to start services"
echo "  3. Access the application at http://localhost:3000"
echo "  4. Use Django admin at http://localhost:8000/admin"