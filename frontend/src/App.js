import React, { useState, useEffect } from 'react';

// API base URL - direct connection to Django backend
const API_BASE = 'http://localhost:8001/api';

function App() 
{
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  // Form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', password2: '' });
  const [authError, setAuthError] = useState('');

  // AI Assistance state
  const [aiExplanation, setAIExplanation] = useState(null);
  const [aiStumper, setAIStumper] = useState(null);

  // Matrix/Task state
  const [currentTask, setCurrentTask] = useState(null);
  const [problems, setProblems] = useState([]);
  const [userSolution, setUserSolution] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');

  // AI Assistance handlers
  const handleGetAIExplanation = async (taskId) => {
    setLoading(true);
    setAIExplanation(null);
    try {
      const result = await getAIExplanation(taskId);
      if (result.error) {
        setMessage(result.error);
      } else {
        setAIExplanation(result.explanation);
      }
    } catch (error) {
      setMessage('Error getting AI explanation: ' + error.message);
    }
    setLoading(false);
  };

  const handleGetStumperExplanation = async (taskId) => {
    setLoading(true);
    setAIStumper(null);
    try {
      const result = await getStumperAnalysis(taskId);
      if (result.error) {
        setMessage(result.error);
      } else {
        setAIStumper(result.analysis);
      }
    } catch (error) {
      setMessage('Error getting stumper analysis: ' + error.message);
    }
    setLoading(false);
  };
  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Trigger MathJax typesetting whenever math content changes
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
  }, [aiExplanation, aiStumper, currentTask, verificationResult]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.is_authenticated);
        setUsername(data.username);
        if (data.is_authenticated) {
          setShowMatrix(true);
          setShowLogin(false);
          setShowRegister(false);
          loadProblems();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
    setMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setUsername(data.username);
          setShowLogin(false);
          setShowRegister(false);
          setShowMatrix(true);
          loadProblems();
          return;
        }
      }
      const errorData = await response.json();
      setAuthError(errorData.error || 'Invalid username or password');
    } catch (error) {
      setAuthError('Login failed: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (registerForm.password !== registerForm.password2) {
      setAuthError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: registerForm.username,
          password1: registerForm.password,
          password2: registerForm.password2,
        }),
      });

      if (response.ok) {
        // Registration successful, check auth
        const authResponse = await fetch(`${API_BASE}/user/`, {
          credentials: 'include',
        });
        if (authResponse.ok) {
          const authData = await authResponse.json();
          if (authData.is_authenticated) {
            setIsAuthenticated(true);
            setUsername(authData.username);
            setShowLogin(false);
            setShowRegister(false);
            setShowMatrix(true);
            loadProblems();
            return;
          }
        }
      } else {
        const errorData = await response.json();
        setAuthError(errorData.error || 'Registration failed');
      }
    } catch (error) {
      setAuthError('Registration failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/accounts/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
    setUsername(null);
    setShowMatrix(false);
    setCurrentTask(null);
    setProblems([]);
    setShowLogin(true);
  };

  const loadProblems = async () => {
    try {
      const response = await fetch(`${API_BASE}/problems/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems || []);
      }
    } catch (error) {
      console.error('Failed to load problems:', error);
    }
  };

const getAIExplanation = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE}/task/${taskId}/explain/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to get AI explanation' };
    }
  } catch (error) {
    return { error: 'Error: ' + error.message };
  }
};

const getStumperAnalysis = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE}/stumper/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ task_id: taskId })
    });
    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to get stumper analysis' };
    }
  } catch (error) {
    return { error: 'Error: ' + error.message };
  }
};

const generateNewTask = async () => {
  setLoading(true);
  setVerificationResult(null);
  setUserSolution('');
  setAIExplanation(null);
  setAIStumper(null);
  setMessage('Generating problem and analyzing with AI...');
  
  try {
    const response = await fetch(`${API_BASE}/generate/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      setCurrentTask(data);
      
      // Automatically fetch AI content in parallel
      const [explRes, stumpRes] = await Promise.all([
        getAIExplanation(data.task_id),
        getStumperAnalysis(data.task_id)
      ]);
      
      if (explRes.explanation) setAIExplanation(explRes.explanation);
      if (explRes.error) setMessage(explRes.error);
      
      if (stumpRes.analysis) setAIStumper(stumpRes.analysis);
      if (stumpRes.error) setMessage(stumpRes.error);
      
      if (!explRes.error && !stumpRes.error) {
        setMessage('');
      }
    } else {
      const errorData = await response.json();
      setMessage('Failed to generate task: ' + (errorData.error || 'Unknown error'));
    }
  } catch (error) {
    setMessage('Error: ' + error.message);
  }
  setLoading(false);
};
  const verifySolution = async () => {
    if (!currentTask || !userSolution) return;
    try {
      const response = await fetch(`${API_BASE}/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          task_id: currentTask.task_id,
          solution: parseFloat(userSolution),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setVerificationResult(data);
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const selectProblem = async (problem) => {
    setLoading(true);
    setVerificationResult(null);
    setUserSolution('');
    try {
      const response = await fetch(`${API_BASE}/task/${problem.task_id}/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentTask(data);
      }
    } catch (error) {
      console.error('Failed to load problem:', error);
    }
    setLoading(false);
  };

  // Render login form
  if (showLogin) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid #1e293b',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            background: 'linear-gradient(to bottom right, #6366f1, #2563eb)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '40px', color: 'white', fontFamily: 'serif' }}>∫</span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>
            Math<span style={{ color: '#60a5fa' }}>Stumper</span>
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
            AI-Powered ODE Solver Challenge
          </p>

          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#e2e8f0' }}>Login</h2>

          {authError && (
            <div style={{
              padding: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#f87171',
              fontSize: '14px'
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              style={{
                padding: '12px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              style={{
                padding: '12px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          </form>

          <p style={{ marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
            Don't have an account?{' '}
            <span
              onClick={() => { setShowLogin(false); setShowRegister(true); setAuthError(''); }}
              style={{ color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Render register form
  if (showRegister) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid #1e293b',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            background: 'linear-gradient(to bottom right, #6366f1, #2563eb)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '40px', color: 'white', fontFamily: 'serif' }}>∫</span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>
            Math<span style={{ color: '#60a5fa' }}>Stumper</span>
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
            Create your account
          </p>

          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#e2e8f0' }}>Register</h2>

          {authError && (
            <div style={{
              padding: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#f87171',
              fontSize: '14px'
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Username"
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              style={{
                padding: '12px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              style={{
                padding: '12px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={registerForm.password2}
              onChange={(e) => setRegisterForm({ ...registerForm, password2: e.target.value })}
              style={{
                padding: '12px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Register
            </button>
          </form>

          <p style={{ marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
            Already have an account?{' '}
            <span
              onClick={() => { setShowRegister(false); setShowLogin(true); setAuthError(''); }}
              style={{ color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Render main matrix/solver interface
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: '#e2e8f0',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid #1e293b',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(to bottom right, #6366f1, #2563eb)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '24px', color: 'white', fontFamily: 'serif' }}>∫</span>
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>
              Math<span style={{ color: '#60a5fa' }}>Stumper</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Welcome, {username}!
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#60a5fa',
            border: '1px solid #60a5fa',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Main content - Matrix display */}
        <div style={{ flex: '2', minWidth: '400px' }}>
          {!currentTask ? (
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #1e293b',
              borderRadius: '24px',
              padding: '60px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 24px',
                background: 'linear-gradient(to bottom right, #6366f1, #2563eb)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '50px', color: 'white', fontFamily: 'serif' }}>∫</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: 'white' }}>
                ODE System Solver
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '16px' }}>
                Solve systems of linear differential equations and verify your solutions
              </p>
              <button
                onClick={generateNewTask}
                disabled={loading}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Generating...' : 'Generate New Challenge'}
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #1e293b',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                  ODE System Matrix
                </h2>
                <button
                  onClick={generateNewTask}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#60a5fa',
                    border: '1px solid #60a5fa',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  New Challenge
                </button>
              </div>

              {/* Coefficient Matrix Display */}
              {currentTask.coefficients && currentTask.coefficients.linear && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
                    System: dU/dt = A · U, where U = [x, y, z, w]ᵀ
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '24px',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '18px'
                  }}>
                    <span style={{ color: '#60a5fa', fontSize: '32px' }}>A = </span>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '4px',
                      border: '3px solid #4f46e5',
                      borderRadius: '8px',
                      padding: '8px',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)'
                    }}>
                      {currentTask.coefficients.linear.map((row, i) =>
                        row.map((val, j) => (
                          <div key={`${i}-${j}`} style={{
                            padding: '8px 16px',
                            textAlign: 'center',
                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                            borderRadius: '4px',
                            color: '#e2e8f0',
                            minWidth: '80px'
                          }}>
                            {parseFloat(val).toFixed(4)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Initial Conditions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>x(0)</p>
                  <p style={{ color: '#60a5fa', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                    {currentTask.initial_conditions?.x0?.toFixed(4) || '—'}
                  </p>
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>y(0)</p>
                  <p style={{ color: '#60a5fa', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                    {currentTask.initial_conditions?.y0?.toFixed(4) || '—'}
                  </p>
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>z(0)</p>
                  <p style={{ color: '#60a5fa', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                    {currentTask.initial_conditions?.z0?.toFixed(4) || '—'}
                  </p>
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>w(0)</p>
                  <p style={{ color: '#60a5fa', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                    {currentTask.initial_conditions?.w0?.toFixed(4) || '—'}
                  </p>
                </div>
              </div>

              {/* Target Time */}
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#818cf8', fontSize: '14px', margin: '0' }}>
                  Target Time: <span style={{ fontSize: '24px', fontWeight: '700', color: '#a5b4fc' }}>
                    t_f = {currentTask.target_time?.toFixed(4) || '—'}
                  </span>
                </p>
              </div>

              {/* Message Display */}
              {message && !message.includes('Loading') && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: message.toLowerCase().includes('error') || message.toLowerCase().includes('failed') || message.toLowerCase().includes('not configured') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  border: `1px solid ${message.toLowerCase().includes('error') || message.toLowerCase().includes('failed') || message.toLowerCase().includes('not configured') ? '#ef4444' : '#3b82f6'}`,
                  borderRadius: '8px',
                  color: message.toLowerCase().includes('error') || message.toLowerCase().includes('failed') || message.toLowerCase().includes('not configured') ? '#f87171' : '#60a5fa',
                  fontSize: '14px'
                }}>
                  {message}
                </div>
              )}

              {/* AI Explanation Result */}
              {aiExplanation && (
                <div style={{
                  marginTop: '20px',
                  padding: '24px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  color: '#e2e8f0',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  textAlign: 'left',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <h4 style={{ color: '#60a5fa', fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid rgba(96, 165, 250, 0.2)', paddingBottom: '8px' }}>
                    Mathematical Explanation
                  </h4>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{aiExplanation}</div>
                </div>
              )}

              {/* AI Stumper Result */}
              {aiStumper && (
                <div style={{
                  marginTop: '20px',
                  padding: '24px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  color: '#e2e8f0',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  textAlign: 'left',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <h4 style={{ color: '#fbbf24', fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid rgba(251, 191, 36, 0.2)', paddingBottom: '8px' }}>
                    Stumper Analysis
                  </h4>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{aiStumper}</div>
                </div>
              )}

              {/* LaTeX Preview */}
              {currentTask.equation_preview && currentTask.equation_preview.raw_latex && (
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#94a3b8',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center'
                }}>
                  {currentTask.equation_preview.raw_latex}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Problem History */}
        <div style={{ flex: '1', minWidth: '280px' }}>
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
              Problem History
            </h3>
            {problems.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>No problems yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {problems.slice(0, 10).map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => selectProblem(problem)}
                    style={{
                      padding: '12px',
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
                      e.target.style.borderColor = '#4f46e5';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                      e.target.style.borderColor = '#334155';
                    }}
                  >
                    <div style={{ color: '#60a5fa', fontWeight: '600', marginBottom: '4px' }}>
                      Problem #{problem.task_id}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>
                      t_f = {problem.target_time?.toFixed(3)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;