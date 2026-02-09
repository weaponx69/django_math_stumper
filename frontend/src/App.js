import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import ChallengeInterface from './components/ChallengeInterface';
import CustomTaskForm from './components/CustomTaskForm';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="md">
        <Routes>
          <Route path="/" element={<ChallengeInterface />} />
          <Route path="/custom" element={<CustomTaskForm />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;