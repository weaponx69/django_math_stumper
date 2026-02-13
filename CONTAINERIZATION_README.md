# Django Math Stumper - Containerization Guide

This guide provides complete instructions for containerizing your Django Math Stumper application with PostgreSQL and migrating your existing database.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Django API    │    │   PostgreSQL    │
│   (Port 3000)   │◄──►│   (Port 8000)   │◄──►│   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Port 6379)   │
                    └─────────────────┘
```

## 📦 What's Included

### Docker Services
- **PostgreSQL 15**: Primary database with persistent storage
- **Redis 7**: Caching and session storage (optional)
- **Django Backend**: Production-ready with Gunicorn
- **React Frontend**: Built and served via Nginx
- **Nginx**: Reverse proxy for production (optional)

### Migration Tools
- **Database Migration Script**: Move from SQLite to PostgreSQL
- **Setup Script**: Automated container setup
- **Environment Configuration**: Secure environment variables

## 🚀 Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- Your existing Django project

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

### 3. Run Setup Script
```bash
# Make script executable
chmod +x setup_containers.sh

# Run setup
./setup_containers.sh
```

### 4. Access Your Application
- **React Frontend**: http://localhost:3000
- **Django Admin**: http://localhost:8000/admin
- **API Endpoint**: http://localhost:8000/api/generate/

## 🔄 Database Migration

### Migrate Existing Data

1. **Stop current Django server** (if running)
2. **Backup current data**:
   ```bash
   python migrate_db.py
   ```
3. **Start containers**:
   ```bash
   docker-compose up -d
   ```
4. **Verify migration**:
   ```bash
   docker-compose exec django python manage.py shell
   >>> from ode_solver.models import ODETask
   >>> print(f"Tasks: {ODETask.objects.count()}")
   ```

### Manual Migration Steps

If you prefer manual migration:

1. **Export SQLite data**:
   ```bash
   python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission > datadump.json
   ```

2. **Start PostgreSQL container**:
   ```bash
   docker-compose up -d db
   ```

3. **Apply migrations**:
   ```bash
   docker-compose exec django python manage.py migrate
   ```

4. **Load data**:
   ```bash
   docker-compose exec django python manage.py loaddata datadump.json
   ```

## 📁 File Structure

```
django_math_stumper/
├── Dockerfile                    # Django backend container
├── docker-compose.yml           # Multi-service orchestration
├── .env.example                 # Environment variables template
├── .env                        # Your environment configuration
├── migrate_db.py               # Database migration script
├── setup_containers.sh         # Automated setup script
├── requirements.txt            # Python dependencies
├── frontend/                   # React application
│   ├── Dockerfile             # React container
│   └── nginx.conf            # Nginx configuration
├── init-db/                  # PostgreSQL initialization
├── staticfiles/              # Collected static files
├── media/                    # Media files
└── ssl/                      # SSL certificates (for HTTPS)
```

## ⚙️ Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
POSTGRES_DB=math_stumper
POSTGRES_USER=math_user
POSTGRES_PASSWORD=your-secure-password
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Ports
DJANGO_PORT=8000
REACT_PORT=3000
```

### Production Configuration

For production deployment:

1. **Set DEBUG=False**
2. **Use secure SECRET_KEY**
3. **Configure ALLOWED_HOSTS**
4. **Set up SSL certificates**
5. **Enable Nginx profile**:
   ```bash
   docker-compose --profile production up -d
   ```

## 🛠️ Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# View running containers
docker ps
```

### Service-Specific Commands
```bash
# Django shell
docker-compose exec django python manage.py shell

# Django migrations
docker-compose exec django python manage.py migrate

# Django collectstatic
docker-compose exec django python manage.py collectstatic --noinput

# PostgreSQL shell
docker-compose exec db psql -U math_user -d math_stumper

# React development (if needed)
docker-compose exec frontend npm run dev
```

### Database Operations
```bash
# Backup database
docker-compose exec db pg_dump -U math_user math_stumper > backup.sql

# Restore database
docker-compose exec -T db psql -U math_user -d math_stumper < backup.sql

# Database shell
docker-compose exec db psql -U math_user -d math_stumper
```

## 🔍 Monitoring & Debugging

### Health Checks
Each service includes health checks:
- **PostgreSQL**: `pg_isready` command
- **Django**: HTTP request to `/api/generate/`
- **React**: HTTP request to root path

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs django
docker-compose logs db
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f django
```

### Service Status
```bash
# Check container status
docker-compose ps

# Check resource usage
docker stats

# Check service health
docker-compose exec django curl http://localhost:8000/api/generate/
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   lsof -i :8000
   lsof -i :3000
   lsof -i :5432
   
   # Kill conflicting processes
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose exec db pg_isready -U math_user
   
   # Check Django database connection
   docker-compose exec django python manage.py dbshell
   ```

3. **Migration Issues**
   ```bash
   # Reset migrations (development only)
   docker-compose exec django python manage.py migrate --fake
   
   # Clear migration history
   docker-compose exec django python manage.py migrate --fake-initial
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   docker-compose down
   docker-compose up -d
   ```

### Debug Mode

For development with debugging:

```bash
# Set DEBUG=True in .env
DEBUG=True

# Start with volume mounts for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 🚀 Production Deployment

### Production Checklist

1. **Security**
   - [ ] Set `DEBUG=False`
   - [ ] Use strong `SECRET_KEY`
   - [ ] Configure `ALLOWED_HOSTS`
   - [ ] Set up SSL/TLS certificates
   - [ ] Use strong database passwords

2. **Performance**
   - [ ] Configure Redis caching
   - [ ] Set up Nginx reverse proxy
   - [ ] Configure static file serving
   - [ ] Optimize database connections

3. **Monitoring**
   - [ ] Set up log aggregation
   - [ ] Configure health checks
   - [ ] Monitor resource usage
   - [ ] Set up alerts

4. **Backup**
   - [ ] Configure automated backups
   - [ ] Test backup restoration
   - [ ] Set up off-site backup storage

### Production Commands

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start with production profile
docker-compose --profile production up -d

# Monitor production
docker-compose logs -f --tail=100

# Scale services
docker-compose up -d --scale django=3
```

## 📊 Performance Optimization

### Database Optimization
- Use connection pooling
- Configure appropriate memory settings
- Enable query logging for slow queries
- Use database indexes appropriately

### Application Optimization
- Enable Django caching with Redis
- Configure static file serving
- Use Gunicorn with appropriate worker count
- Enable compression

### Container Optimization
- Use multi-stage builds
- Minimize image size
- Use appropriate resource limits
- Enable health checks

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique passwords
   - Rotate secrets regularly

2. **Network Security**
   - Use internal networks
   - Limit exposed ports
   - Use HTTPS in production

3. **Application Security**
   - Keep dependencies updated
   - Use security middleware
   - Validate all inputs

4. **Database Security**
   - Use strong passwords
   - Limit database access
   - Enable SSL connections

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Docker and Django documentation
3. Check container logs for error details
4. Verify environment configuration

## 🤝 Contributing

When contributing to this containerization setup:
1. Test changes in isolated environment
2. Update documentation for new features
3. Follow Docker best practices
4. Ensure backward compatibility

---

**Note**: This containerization setup provides a production-ready environment while maintaining development flexibility. Always test thoroughly before deploying to production.