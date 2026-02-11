#!/bin/bash

echo "🚀 Starting Django Math Stumper - Both Services"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found. Please run this script from the project root directory."
    exit 1
fi

# Activate virtual environment and start Django in background
echo "📦 Starting Django backend on port 8000..."
source venv/bin/activate
python manage.py runserver 8000 &
DJANGO_PID=$!

# Wait a moment for Django to start
sleep 3

# Start React frontend
echo "⚛️  Starting React frontend on port 3000..."
cd frontend
npm start

# Cleanup function to kill Django when script exits
cleanup() {
    echo "🛑 Stopping Django backend..."
    kill $DJANGO_PID 2>/dev/null
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Wait for React to finish (it will run indefinitely)
wait