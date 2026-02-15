import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ChallengeInterface from './components/ChallengeInterface';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Professional Header */}
        <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl">
          <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                <span className="text-2xl font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>∫</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Math Stumper
                </h1>
                <p className="text-xs text-blue-300 font-medium">AI-Powered Problem Generator</p>
              </div>
            </div>
            <nav className="flex items-center gap-3">
              <LoginButton />
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-10">
          <Routes>
            <Route path="/" element={<ChallengeInterface />} />
          </Routes>
        </main>

        {/* Academic Footer */}
        <footer className="border-t border-blue-200/50 bg-white/50 backdrop-blur-sm mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center">
            <p className="text-slate-500 text-sm font-medium">System Solver Protocol v2 • Optimal Control Theory</p>
            <p className="text-slate-400 text-xs mt-1">Powered by SymPy & Django REST Framework</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
