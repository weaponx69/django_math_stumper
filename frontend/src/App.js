import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ChallengeInterface from './components/ChallengeInterface';

function LoginButton() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    checkAuth();
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/`, {
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

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/accounts/logout/`, {
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
        className="px-5 py-2 text-sm font-semibold text-rose-200 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-full transition-all duration-300"
      >
        Logout
      </button>
    );
  }

  return (
    <button 
      onClick={() => window.location.href = `${API_URL}/accounts/login/`}
      className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
    >
      Sign In
    </button>
  );
}


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.is_authenticated);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Router>
        <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col relative overflow-hidden">
          {/* Ambient Background Glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Header */}
          <header className="relative z-10 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 border border-white/10">
                  <span className="text-2xl font-serif font-bold text-white">$ \int $</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Math<span className="text-blue-400">Stumper</span>
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">AI Processing Active</p>
                  </div>
                </div>
              </div>
              <nav className="flex items-center gap-3">
                <button 
                  onClick={() => window.location.href = `${API_URL}/accounts/register/`}
                  className="px-5 py-2 text-sm font-semibold text-blue-400 border border-blue-400/30 hover:bg-blue-400/10 rounded-full transition-all duration-300"
                >
                  Create Account
                </button>
                <button 
                  onClick={() => window.location.href = `${API_URL}/accounts/login/`}
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Sign In
                </button>
              </nav>
            </div>
          </header>

          {/* Main Content - Login Required Message */}
          <main className="relative z-10 max-w-5xl mx-auto w-full px-4 py-12 flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 backdrop-blur-sm shadow-2xl ring-1 ring-white/5">
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
                <p className="text-slate-400 mb-8">Please sign in to access the Math Stumper challenge system.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => window.location.href = `${API_URL}/accounts/register/`}
                    className="px-6 py-3 text-base font-semibold text-blue-400 border border-blue-400/30 hover:bg-blue-400/10 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Create Account
                  </button>
                  <button 
                    onClick={() => window.location.href = `${API_URL}/accounts/login/`}
                    className="px-8 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-10 py-8 border-t border-slate-900 bg-[#020617]">
            <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-4">
              <div className="flex gap-8 text-slate-500 text-[11px] font-mono">
                <span>nabla x E = -dB/dt</span>
                <span>e + 1 = 0</span>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs font-medium">System Solver Protocol &bull; 2026</p>
                <p className="text-slate-600 text-[10px] mt-1">Computational Engine: DRF</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col relative overflow-hidden">
        
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Mathematical Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)`,
            backgroundSize: '50px 50px' 
          }}
        ></div>

        {/* Header */}
        <header className="relative z-10 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 border border-white/10">
                <span className="text-2xl font-serif font-bold text-white">$ \int $</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Math<span className="text-blue-400">Stumper</span>
                </h1>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">AI Processing Active</p>
                </div>
              </div>
            </div>
            <nav>
              <LoginButton />
            </nav>
          </div>
        </header>

        {/* Main Interface Area */}
        <main className="relative z-10 max-w-5xl mx-auto w-full px-4 py-12 flex-grow">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl ring-1 ring-white/5">
            <Routes>
              <Route path="/" element={<ChallengeInterface />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-8 border-t border-slate-900 bg-[#020617]">
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-4">
            <div className="flex gap-8 text-slate-500 text-[11px] font-mono">
              <span>nabla x E = -dB/dt</span>
              <span>e + 1 = 0</span>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs font-medium">System Solver Protocol &bull; 2026</p>
              <p className="text-slate-600 text-[10px] mt-1">Computational Engine: DRF</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
