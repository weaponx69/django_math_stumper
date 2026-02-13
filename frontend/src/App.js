import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
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
      <Button color="inherit" onClick={handleLogout}>
        Logout
      </Button>
    );
  }

  return (
    <Button color="inherit" onClick={() => window.location.href = 'http://localhost:8000/accounts/login/'}>
      Login
    </Button>
  );
}

function App() {
  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Math Stumper
          </Typography>
          <LoginButton />
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Routes>
            <Route path="/" element={<ChallengeInterface />} />
            <Route path="/custom" element={<CustomTaskForm />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;
