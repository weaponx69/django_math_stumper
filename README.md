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

## 🚀 Quick Start (Local Run)

You can launch the entire stack—database, backend, and frontend—with a single command using Docker.

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.
- A **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/)).

### 2. Configure Environment
Create a `.env` file in the root directory (or rename `.env.example` if it exists):
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-flash-latest
```

### 3. Launch App
Run this command in the project root:
```bash
docker compose up --build
```

### 4. Access the Platform
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Django API:** [http://localhost:8001/api/](http://localhost:8001/api/)
- **Django Admin:** [http://localhost:8001/admin/](http://localhost:8001/admin/)

---

## 🛠️ Tech Stack

- **Frontend:** React, MathJax 3, Vanilla CSS (Premium Aesthetics).
- **Backend:** Django, Django REST Framework.
- **Database:** PostgreSQL 15.
- **AI Engine:** Google Gemini (Generative AI SDK).
- **Containerization:** Docker Compose.

---

## 🤝 Troubleshooting

> [!IMPORTANT]
> **Port Conflicts:** Ensure ports `3000` (Frontend) and `8001` (Backend API) are available on your machine.
> 
> **API Key:** If you see "API Key not configured" in the dashboard, double-check your `.env` file and ensure there are no leading/trailing spaces in the key.

---

## 📝 Configuration File (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Google AI Studio Key | (Required) |
| `GEMINI_MODEL` | The AI model to use | `gemini-flash-latest` |
| `POSTGRES_DB` | Database Name | `math_stumper` |
| `POSTGRES_USER` | Database User | `math_user` |
| `POSTGRES_PASSWORD`| Database Password | `math_password_123` |

---

Developed with ❤️ by the Math Stumper Team.
