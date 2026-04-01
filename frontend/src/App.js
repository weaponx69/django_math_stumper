import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('Loading...');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch data from Django backend
    fetch('http://localhost:8000/api/generate/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to fetch from backend');
      })
      .then(data => {
        setMessage('Connected to Django backend!');
        console.log('Backend response:', data);
      })
      .catch(error => {
        setMessage('Backend connection status: ' + error.message);
        console.error('Error:', error);
      });
  }, []);

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
        maxWidth: '600px',
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
        
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>
          Math<span style={{ color: '#60a5fa' }}>Stumper</span>
        </h1>
        
        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '16px' }}>
          AI-Powered ODE Solver Challenge
        </p>

        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          border: '1px solid rgba(79, 70, 229, 0.3)',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <p style={{ color: '#818cf8', fontSize: '14px', margin: 0 }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            style={{
              padding: '12px 24px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
          >
            New Challenge
          </button>
          
          <button 
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#60a5fa',
              border: '1px solid #60a5fa',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(96, 165, 250, 0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            View History
          </button>
        </div>

        <footer style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #1e293b'
        }}>
          <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
            System Solver Protocol • 2026
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;