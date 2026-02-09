# Django Math Stumper

A web application for generating and solving challenging ODE (Ordinary Differential Equation) problems with step-by-step solutions.

## Features

- **Random ODE Generation**: Creates challenging ODE systems with random coefficients
- **Step-by-Step Solutions**: Detailed mathematical walkthroughs with LaTeX rendering
- **Answer Verification**: Ensures all problems have definite answers between 0-999
- **Modern Frontend**: React-based interface with responsive design
- **Docker Support**: Complete containerized deployment

## Tech Stack

### Backend
- **Django 6.0**: Web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Database (with SQLite fallback)
- **SciPy**: Numerical computations and ODE solving
- **NumPy**: Mathematical operations
- **SymPy**: Symbolic mathematics and LaTeX generation

### Frontend
- **React 19**: UI framework
- **Material-UI**: Component library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **KaTeX**: LaTeX rendering

### Infrastructure
- **Docker**: Containerization
- **Nginx**: Frontend web server
- **CORS**: Cross-origin resource sharing

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- Docker & Docker Compose

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd django_math_stumper
```

2. Build and run with Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- API: http://localhost:8000/api/

### Manual Installation

#### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## API Endpoints

### GET /api/problems/
Returns a list of all generated problems.

### POST /api/generate/
Generates a new ODE problem and returns it.

### GET /api/problems/{id}/
Returns a specific problem with its solution.

## Problem Generation

The system generates ODE problems of the form:

```
dx/dt = ax + by
dy/dt = cx + dy
```

With initial conditions x(0) = x₀, y(0) = y₀, and asks for the value of x(t₁) + y(t₁) at a specific time t₁.

### Generation Process

1. **Random Coefficient Generation**: Creates random 2x2 matrices with integer coefficients
2. **Eigenvalue Analysis**: Ensures the system has real, distinct eigenvalues for solvability
3. **Solution Computation**: Uses SciPy's ODE solver to compute numerical solutions
4. **Answer Verification**: Validates that the final answer is an integer between 0-999
5. **LaTeX Generation**: Creates step-by-step mathematical solutions

### Mathematical Approach

The system uses eigenvalue decomposition to solve the ODE system analytically:

1. Find eigenvalues λ₁, λ₂ of the coefficient matrix
2. Find corresponding eigenvectors v₁, v₂
3. Express the general solution as: x(t) = c₁e^(λ₁t)v₁ + c₂e^(λ₂t)v₂
4. Apply initial conditions to solve for constants c₁, c₂
5. Compute the final value at the target time

## Frontend Components

### ProblemList
- Displays all generated problems
- Allows generating new problems
- Shows problem details and answers

### Problem Detail
- Displays the complete problem statement
- Shows step-by-step solution with LaTeX rendering
- Provides raw LaTeX source for copying

## Configuration

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string (optional, defaults to SQLite)

#### Frontend
- `REACT_APP_API_URL`: API base URL (defaults to http://localhost:8000)

### Django Settings

Key settings in `django_math_stumper/settings.py`:
- `ODE_SOLVER_SETTINGS`: Numerical solver tolerances
- `CORS_ALLOW_ALL_ORIGINS`: CORS configuration for frontend-backend communication

## Development

### Backend Development
```bash
# Run tests
python manage.py test

# Run with PostgreSQL (requires docker-compose up db)
export DATABASE_URL=postgresql://math_user:math_password@localhost:5432/math_stumper
python manage.py runserver
```

### Frontend Development
```bash
# Install additional dependencies
npm install @craco/craco

# Start with proxy configuration
npm start
```

### Adding New Features

1. **New API Endpoints**: Add to `ode_solver/urls.py` and create corresponding views
2. **New Models**: Create Django models in `ode_solver/models.py`
3. **Frontend Components**: Add React components in `frontend/src/components/`
4. **Styling**: Use Material-UI components or custom CSS-in-JS

## Deployment

### Production with Docker
```bash
# Build production images
docker-compose -f docker-compose.yml build

# Run in production mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Considerations

1. **Environment Variables**: Set proper secrets and configuration
2. **Database**: Use production PostgreSQL instance
3. **Static Files**: Configure proper static file serving
4. **SSL/TLS**: Add HTTPS configuration
5. **Monitoring**: Add health checks and monitoring

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 8000, 3000, and 5432 are available
2. **Dependencies**: Install all required Python and Node.js packages
3. **Database**: Run migrations after database setup
4. **CORS**: Ensure frontend can communicate with backend

### Debug Mode

Enable debug mode in Django settings for development:
```python
DEBUG = True
```

### Logging

Check application logs:
```bash
# Django logs
docker-compose logs django

# Frontend logs
docker-compose logs frontend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the issues section
- Review the documentation
- Contact the maintainers