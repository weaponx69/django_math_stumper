import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProblemList = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/problems/');
      setProblems(response.data.problems || []);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const generateNewProblem = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/generate/');
      const taskData = response.data;
      // Transform to match the expected format
      const newProblem = {
        id: taskData.task_id,
        task_id: taskData.task_id,
        question: `Solve the ODE system with target time t_f = ${taskData.target_time}`,
        answer: null, // Will be revealed when solution is available
        created_at: new Date().toISOString(),
        target_time: taskData.target_time,
        initial_conditions: taskData.initial_conditions,
        equation_preview: taskData.equation_preview
      };
      setProblems(prev => [newProblem, ...prev]);
    } catch (err) {
      setError('Failed to generate new problem');
      console.error('Error generating problem:', err);
    } finally {
      setLoading(false);
    }
  };



  if (loading && problems.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">ODE Problems</Typography>
        <Button 
          variant="contained" 
          onClick={generateNewProblem}
          disabled={loading}
        >
          Generate New Problem
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/custom')}
          sx={{ ml: 2 }}
        >
          Custom Task
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {problems.map((problem) => (
        <Box key={problem.id} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Typography variant="h6">Problem #{problem.id}</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Question:</strong> {problem.question}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Answer:</strong> {problem.answer}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Created:</strong> {new Date(problem.created_at).toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ProblemList;