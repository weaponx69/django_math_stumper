# 🧠 Math Stumper: AI-Powered ODE Challenge Engine

**Math Stumper** is a sophisticated web application designed to generate, solve, and analyze complex systems of ordinary differential equations (ODEs). It leverages the **Google Gemini Pro** model to provide exhaustive mathematical derivations and technical stability analyses for PhD-level research.

![Aesthetic Dashboard Preview](https://img.shields.io/badge/UI-Modern--Premium-blueviolet)
![Backend](https://img.shields.io/badge/Backend-Django-092E20)
![AI](https://img.shields.io/badge/AI-Gemini--Flash--Latest-4285F4)
![Docker](https://img.shields.io/badge/Deployment-Docker--Compose-2496ED)

---

## ✨ Features

- **Dynamic ODE Generation:** Generates valid, solvable rank-1 systems of linear differential equations.
- **Rigorous Mathematical Derivations:** Exhaustive, step-by-step solutions providing eigenvalue/eigenvector analysis and general solution construction.
- **Technical Stability Reports:** In-depth analysis of numerical stiffness, condition numbers, and error propagation "traps."
- **LaTeX Rendering:** Professional mathematical typography powered by MathJax 3.
- **Modern UI:** Premium, responsive dashboard with a sleek dark-mode aesthetic.

---

## 🛠️ Tech Stack

- **Frontend:** React, MathJax 3, Vanilla CSS.
- **Backend:** Django, Django REST Framework.
- **Database:** PostgreSQL 15.
- **AI Engine:** Google Gemini (Generative AI SDK).

---

## 🚀 Quick Start (Docker)

The fastest way to get started. Docker handles all dependencies and the database setup automatically.

### 1. Configure Environment
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-flash-latest
```

### 2. Launch Stack
```bash
docker compose up --build
```
*Accessible at: [http://localhost:3000](http://localhost:3000)*

---

## ⚙️ Manual Setup (No Docker)

Use this method for local development without containerization.

### Prerequisites
- Python 3.13+
- Node.js 18+
- **PostgreSQL** (Installed locally OR keep only the DB container running: `docker compose up -d db`)

### 1. Backend Setup
```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver 8001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 3. One-Command Dev Mode
If the database is already running, you can use the built-in dev script from the root:
```bash
./start_dev.sh
```

---

## 🤝 Troubleshooting

> [!IMPORTANT]
> **Port Conflicts:** Ensure ports `3000` (Frontend) and `8001` (Backend API) are available.
> 
> **AI Verbosity:** If explanations appear too short, check that `GEMINI_MODEL` is set to `gemini-flash-latest` in your `.env`.

Developed with ❤️ by the Math Stumper Team.
