import React, { useState, useEffect } from 'react';

// API base URL - Using relative path for Nginx production proxy
const API_BASE = '/api';


const spinnerStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .math-spinner-small {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #60a5fa;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
  }
`;

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

  // New Management State
  const [targetAnswer, setTargetAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableCoefficients, setEditableCoefficients] = useState(null);


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
          // Automatically go to a new task if none is active
          if (!currentTask) {
            generateNewTask();
          }
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
          generateNewTask();
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
  setMessage('Generating problem...');
  
  try {
    const response = await fetch(`${API_BASE}/generate/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      setCurrentTask(data); // INSTANT REVEAL: Show the problem now!
      setLoading(false);      // Stop the main "Calculating" spinner
      setMessage('');
      
      // Load AI analysis in the background
      getAIExplanation(data.task_id).then(res => {
        if (res.explanation) setAIExplanation(res.explanation);
      });
      
      getStumperAnalysis(data.task_id).then(res => {
        if (res.analysis) setAIStumper(res.analysis);
      });
      
    } else {
      const errorData = await response.json();
      setMessage('Failed to generate task: ' + (errorData.error || 'Unknown error'));
      setLoading(false);
    }
  } catch (error) {
    setMessage('Error: ' + error.message);
    setLoading(false);
  }
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
        const [explRes, stumpRes] = await Promise.all([
          getAIExplanation(data.task_id),
          getStumperAnalysis(data.task_id)
        ]);
        if (explRes.explanation) setAIExplanation(explRes.explanation);
        if (stumpRes.analysis) setAIStumper(stumpRes.analysis);
      }
    } catch (error) {
      console.error('Failed to load problem:', error);
    }
    setLoading(false);
  };


  const deleteProblem = async (e, taskId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;
    try {
      const response = await fetch(`${API_BASE}/task/${taskId}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        if (currentTask && currentTask.task_id === taskId) {
          setCurrentTask(null);
          setAIExplanation(null);
          setAIStumper(null);
        }
        loadProblems();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleGenerateByTarget = async () => {
    if (!targetAnswer || isNaN(targetAnswer)) {
      setMessage('Please enter a valid target answer (0-999)');
      return;
    }
    setLoading(true);
    setVerificationResult(null);
    setUserSolution('');
    setAIExplanation(null);
    setAIStumper(null);
    setMessage(`Searching for an equation that equals ${targetAnswer}...`);
    try {
      const response = await fetch(`${API_BASE}/generate_by_answer/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target: parseInt(targetAnswer) })
      });
      if (response.ok) {
        const data = await response.json();
        const taskResponse = await fetch(`${API_BASE}/task/${data.task_id}/`, {
          credentials: 'include'
        });
        const taskData = await taskResponse.json();
        setCurrentTask(taskData);
        loadProblems();
        setLoading(false);
        setMessage('');

        // Background AI load
        getAIExplanation(taskData.task_id).then(res => {
          if (res.explanation) setAIExplanation(res.explanation);
        });
        getStumperAnalysis(taskData.task_id).then(res => {
          if (res.analysis) setAIStumper(res.analysis);
        });
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to find matching system');
        setLoading(false);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (!isEditing && currentTask) {
      setEditableCoefficients(JSON.parse(JSON.stringify(currentTask.coefficients)));
    }
    setIsEditing(!isEditing);
  };

  const handleCoefficientChange = (rowIdx, colIdx, value) => {
    const newData = { ...editableCoefficients };
    newData.linear[rowIdx][colIdx] = parseFloat(value) || 0;
    setEditableCoefficients(newData);
  };

  const handleRecalculate = async () => {
    if (!currentTask) return;
    setLoading(true);
    setMessage('Recalculating system solutions...');
    try {
      const response = await fetch(`${API_BASE}/task/${currentTask.task_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ coefficients: editableCoefficients })
      });
      if (response.ok) {
        const data = await response.json();
        const taskResponse = await fetch(`${API_BASE}/task/${data.task_id}/`, {
          credentials: 'include'
        });
        const taskData = await taskResponse.json();
        setCurrentTask(taskData);
        setIsEditing(false);
        setLoading(false);
        setMessage('System updated successfully');

        // Background AI load
        getAIExplanation(taskData.task_id).then(res => {
          if (res.explanation) setAIExplanation(res.explanation);
        });
        getStumperAnalysis(taskData.task_id).then(res => {
          if (res.analysis) setAIStumper(res.analysis);
        });
      } else {
        setLoading(false);
      }
    } catch (error) {
      setMessage('Update failed: ' + error.message);
      setLoading(false);
    }
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
              padding: '64px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px'
            }}>
              <style>{spinnerStyles}</style>
              <div className="math-spinner-small" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: 'white' }}>
                🚀 Preparing Mathematical Challenge...
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                Initializing system state and calculating solutions
              </p>
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Target Ans (0-999)"
                    value={targetAnswer}
                    onChange={(e) => setTargetAnswer(e.target.value)}
                    style={{
                      width: '120px',
                      padding: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    onClick={handleGenerateByTarget}
                    disabled={loading || !targetAnswer}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Generate by Target
                  </button>
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
                    Random Challenge
                  </button>
                </div>
              </div>

              {/* Coefficient Matrix Display */}
              {currentTask.coefficients && currentTask.coefficients.linear && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                      System: dU/dt = A · U, where U = [x, y, z, w]ᵀ
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={toggleEdit}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: isEditing ? '#ef4444' : 'transparent',
                          color: isEditing ? 'white' : '#60a5fa',
                          border: `1px solid ${isEditing ? '#ef4444' : '#60a5fa'}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {isEditing ? 'Cancel Edit' : 'Enable Manual Edit'}
                      </button>
                      {isEditing && (
                        <button
                          onClick={handleRecalculate}
                          style={{
                            padding: '4px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Recalculate Solution
                        </button>
                      )}
                    </div>
                  </div>
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
                      border: isEditing ? '3px dashed #ef4444' : '3px solid #4f46e5',
                      borderRadius: '8px',
                      padding: '8px',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)'
                    }}>
                      {(isEditing ? editableCoefficients : currentTask.coefficients).linear.map((row, i) =>
                        row.map((val, j) => (
                          <div key={`${i}-${j}`} style={{
                            padding: '4px',
                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                            borderRadius: '4px',
                            color: isEditing ? '#fbbf24' : '#e2e8f0',
                            minWidth: '80px'
                          }}>
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={val}
                                onChange={(e) => handleCoefficientChange(i, j, e.target.value)}
                                style={{
                                  width: '100%',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: 'inherit',
                                  textAlign: 'center',
                                  fontSize: '16px',
                                  outline: 'none'
                                }}
                              />
                            ) : (
                              parseFloat(val).toFixed(4)
                            )}
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
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minHeight: '100px'
              }}>
                <h4 style={{ color: '#60a5fa', fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid rgba(96, 165, 250, 0.2)', paddingBottom: '8px' }}>
                  Mathematical Explanation
                </h4>
                {aiExplanation ? (
                   <div style={{ whiteSpace: 'pre-wrap' }}>{aiExplanation}</div>
                ) : (
                   <div style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                     <div className="math-spinner-small"></div>
                     Calculating exhaustive PhD-level derivation...
                   </div>
                )}
              </div>

              {/* AI Stumper Result */}
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
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minHeight: '100px'
              }}>
                <h4 style={{ color: '#fbbf24', fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0', borderBottom: '1px solid rgba(251, 191, 36, 0.2)', paddingBottom: '8px' }}>
                  Technical Stability Analysis
                </h4>
                {aiStumper ? (
                   <div style={{ whiteSpace: 'pre-wrap' }}>{aiStumper}</div>
                ) : (
                   <div style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                     <div className="math-spinner-small" style={{ borderTopColor: '#fbbf24' }}></div>
                     Performing rigorous stability and stiffness verification...
                   </div>
                )}
              </div>

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
                  <div
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
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseOver={(e) => {
                      if (e.currentTarget === e.target || e.currentTarget.contains(e.target)) {
                        e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
                        e.currentTarget.style.borderColor = '#4f46e5';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (e.currentTarget === e.target || e.currentTarget.contains(e.target)) {
                        e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                        e.currentTarget.style.borderColor = '#334155';
                      }
                    }}
                  >
                    <div>
                      <div style={{ color: '#60a5fa', fontWeight: '600', marginBottom: '24x' }}>
                        Problem #{problem.task_id}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>
                        t_f = {problem.target_time?.toFixed(3)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteProblem(e, problem.task_id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                      onMouseOver={(e) => e.target.style.color = '#ef4444'}
                      onMouseOut={(e) => e.target.style.color = '#64748b'}
                    >
                      🗑️
                    </button>
                  </div>
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