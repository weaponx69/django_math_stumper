import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Grid, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CustomTaskForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [linear, setLinear] = useState([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]);
    
    const [initialConditions, setInitialConditions] = useState({
        x0: 0.5, y0: 0.5, z0: 0.5, w0: 0.5
    });
    
    const [targetTime, setTargetTime] = useState(1.0);

    const handleArrayChange = (setter, array, index, value) => {
        const newArray = [...array];
        newArray[index] = parseFloat(value) || 0;
        setter(newArray);
    };

    const handleObjChange = (setter, obj, key, value) => {
        setter({ ...obj, [key]: value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        
        // Parse inputs to ensure they are numbers
        const parsedLinear = linear.map(row => 
            row.map(val => {
                const num = parseFloat(val);
                return isNaN(num) ? 0 : num;
            })
        );

        const parsedInitialConditions = {};
        Object.keys(initialConditions).forEach(key => {
            const num = parseFloat(initialConditions[key]);
            parsedInitialConditions[key] = isNaN(num) ? 0 : num;
        });

        const payload = {
            coefficients: {
                linear: parsedLinear
            },
            initial_conditions: parsedInitialConditions,
            target_time: parseFloat(targetTime) || 1.0
        };

        try {
            const response = await axios.post('/api/create_custom/', payload);
            // Pass the created task to the home page so it can be displayed immediately
            navigate('/', { state: { task: response.data } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom>Create Custom ODE Task</Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Typography variant="h6" sx={{ mt: 2 }}>Linear System Matrix (4x4)</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Enter the coefficients for each equation. Row 1 corresponds to dx/dt, Row 2 to dy/dt, etc.
            </Typography>
            
            <Grid container spacing={2}>
                {['dx/dt', 'dy/dt', 'dz/dt', 'dw/dt'].map((rowLabel, i) => (
                    <React.Fragment key={`row-${i}`}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {rowLabel} =
                            </Typography>
                        </Grid>
                        {['x', 'y', 'z', 'w'].map((colLabel, j) => (
                            <Grid item xs={3} key={`cell-${i}-${j}`}>
                                <TextField 
                                    label={`Coeff for ${colLabel}`} 
                                    type="number" 
                                    fullWidth 
                                    size="small"
                                    step="0.1"
                                    value={linear[i][j]}
                                    onChange={(e) => {
                                        const newVal = e.target.value;
                                        const newMatrix = [...linear];
                                        newMatrix[i] = [...newMatrix[i]];
                                        newMatrix[i][j] = newVal;
                                        setLinear(newMatrix);
                                    }}
                                />
                            </Grid>
                        ))}
                    </React.Fragment>
                ))}
            </Grid>

            <Typography variant="h6" sx={{ mt: 2 }}>Initial Conditions (t=0)</Typography>
            <Grid container spacing={2}>
                {['x0', 'y0', 'z0', 'w0'].map((key) => (
                    <Grid item xs={3} key={key}>
                        <TextField 
                            label={key} 
                            type="number" 
                            fullWidth 
                            step="0.1"
                            value={initialConditions[key]}
                            onChange={(e) => handleObjChange(setInitialConditions, initialConditions, key, e.target.value)}
                        />
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h6" sx={{ mt: 2 }}>Settings</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField 
                        label="Target Time (t)" 
                        type="number" 
                        fullWidth 
                        step="0.1"
                        value={targetTime}
                        onChange={(e) => setTargetTime(e.target.value)}
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Create Task'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/')}>
                    Back to Dashboard
                </Button>
            </Box>
        </Paper>
    );
};

export default CustomTaskForm;
