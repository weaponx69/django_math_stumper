# React Frontend Setup Guide

## Overview

Your Django Math Stumper application now uses React as the primary frontend interface. Django serves as the backend API, while React provides the user interface.

## Architecture

- **Django (Port 8000)**: Backend API server with database and ODE solving logic
- **React (Port 3000)**: Frontend interface with MathJax integration
- **Proxy**: React development server proxies API requests to Django

## Quick Start

### Method 1: Using the Startup Script (Recommended)

```bash
./start_dev.sh
```

This script will:
1. Start Django backend on port 8000
2. Start React frontend on port 3000
3. Automatically proxy API requests from React to Django

### Method 2: Manual Setup

1. **Start Django Backend:**
   ```bash
   python manage.py runserver 8000
   ```

2. **Start React Frontend:**
   ```bash
   cd frontend
   npm start
   ```

## Accessing the Application

- **React Frontend**: http://localhost:3000
- **Django Admin**: http://localhost:8000/admin
- **API Endpoints**: http://localhost:8000/api/

## File Structure

```
django_math_stumper/
├── frontend/                    # React application
│   ├── public/index.html       # React entry point
│   ├── src/
│   │   ├── App.js              # Main React app
│   │   ├── components/
│   │   │   ├── ChallengeInterface.js  # Main challenge interface
│   │   │   └── CustomTaskForm.js      # Custom task creation
│   │   └── index.js
│   └── package.json
├── ode_solver/                 # Django backend
│   ├── views.py               # API endpoints
│   ├── models.py              # Database models
│   ├── services.py            # ODE solving logic
│   └── templates/ode_solver/index.html  # Fallback redirect page
└── manage.py                  # Django management
```

## Key Features

### React Components

1. **ChallengeInterface.js**: Main interface for solving ODE challenges
   - Displays system equations with MathJax rendering
   - Shows initial conditions and target time
   - Provides solution input and verification
   - Shows step-by-step solutions with LaTeX

2. **CustomTaskForm.js**: Interface for creating custom ODE tasks
   - Input form for linear coefficients
   - Initial conditions setup
   - Target time configuration

### API Endpoints

- `GET /api/generate/` - Generate new random ODE task
- `POST /api/create_custom/` - Create custom ODE task
- `POST /api/verify/` - Verify solution
- `GET /api/task/{id}/` - Get task details
- `GET /api/task/{id}/solution/` - Get detailed solution

## Development Notes

### MathJax Integration

React components use MathJax for rendering LaTeX equations. The `MathEquation` component handles:
- Dynamic LaTeX rendering
- Error handling for MathJax loading
- Responsive equation display

### State Management

The React app uses local state for:
- Current task data
- Solution input
- Verification results
- Solution display toggles

### Styling

- Uses Material-UI (MUI) for consistent styling
- Responsive design for mobile and desktop
- Custom styling for mathematical content

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8000  # or :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **CORS Errors**
   - Django settings already configured for CORS
   - React proxy configured in `package.json`

3. **MathJax Not Loading**
   - Check browser console for errors
   - Verify MathJax script is loading from CDN

### Dependencies

Ensure you have:
- Node.js and npm installed
- Python and Django installed
- All required Python packages from `requirements.txt`

## Production Deployment

For production, you'll want to:
1. Build React for production: `npm run build`
2. Serve React build files through Django or a CDN
3. Configure proper CORS settings
4. Set up proper database (PostgreSQL recommended)

## Next Steps

1. Test the application by running `./start_dev.sh`
2. Visit http://localhost:3000 to see the React interface
3. Generate a challenge and test the solution verification
4. Create a custom task to test the form functionality