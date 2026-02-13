import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ChallengeInterface from './components/ChallengeInterface';
import CustomTaskForm from './components/CustomTaskForm';

function LoginButton() {
  const navigate = useNavigate();
  
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/user/', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.is_authenticated);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/accounts/logout/', {
        method: 'POST',
        credentials: 'include'
      });
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoggedIn) {
    return (
      <button 
        onClick={handleLogout}
        className="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded transition-colors"
      >
        Logout
      </button>
    );
  }

  return (
    <button 
      onClick={() => window.location.href = 'http://localhost:8000/accounts/login/'}
      className="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded transition-colors"
    >
      Login
    </button>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {/* Professional Header */}
        <header className="bg-slate-900 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">∑</span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight">
                Math Stumper
              </h1>
            </div>
            <nav className="flex items-center gap-2">
              <LoginButton />
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ChallengeInterface />} />
            <Route path="/custom" element={<CustomTaskForm />} />
          </Routes>
        </main>

        {/* Academic Footer */}
        <footer className="border-t border-slate-200 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
            <p>System Solver Protocol v2 • Optimal Control Theory</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
