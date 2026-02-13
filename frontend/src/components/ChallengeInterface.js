import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Button, Typography, CircularProgress, Alert, Paper, TextField, Divider, Grid } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Simple MathJax wrapper with retry logic for loading stability
const MathEquation = ({ latex }) => {
    const node = useRef(null);
    const [retries, setRetries] = useState(0);

    useEffect(() => {
        if (window.MathJax && node.current && latex) {
            try {
                window.MathJax.typesetClear([node.current]);
                node.current.innerHTML = latex;
                window.MathJax.typesetPromise([node.current]).catch((err) => console.log('MathJax error', err));
            } catch (e) {
                console.error("MathJax operation failed", e);
            }
        } else if (!window.MathJax && retries < 10) {
            const timer = setTimeout(() => {
                setRetries(prev => prev + 1);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [latex, retries]);

    return (
        <div 
            ref={node} 
            className="math-container"
            style={{ 
                overflowX: 'auto', 
                overflowY: 'hidden',
                maxWidth: '100%', 
                display: 'block',
                margin: '0 auto'
            }} 
        />
    );
};

const ChallengeInterface = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [solutionInput, setSolutionInput] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    const [solutionData, setSolutionData] = useState(null);
    const [showRawLatex, setShowRawLatex] = useState(false);
    const [showLatexSteps, setShowLatexSteps] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const generateNewTask = async () => {
        setLoading(true);
        setError(null);
        setVerificationResult(null);
        setShowSolution(false);
        setSolutionData(null);
        setShowLatexSteps(false);
        setSolutionInput('');
        
        try {
            const response = await axios.get('/api/generate/');
            setTask(response.data);
        } catch (err) {
            setError('Failed to generate task: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state && location.state.task) {
            setTask(location.state.task);
            // Clear the state so it doesn't persist on refresh/re-nav
            window.history.replaceState({}, document.title);
        } else {
            generateNewTask();
        }
    }, [location.state]);

    const submitSolution = async () => {
        if (!task || !solutionInput) return;
        
        try {
            const response = await axios.post('/api/verify/', {
                task_id: task.task_id,
                solution: parseInt(solutionInput)
            });
            setVerificationResult(response.data);
        } catch (err) {
            setError('Verification failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const fetchSolution = async () => {
        if (!task) return;
        
        if (showSolution) {
            setShowSolution(false);
            return;
        }

        try {
            const response = await axios.get(`/api/task/${task.task_id}/solution/`);
            setSolutionData(response.data);
            setShowSolution(true);
        } catch (err) {
            setError('Failed to fetch solution: ' + (err.response?.data?.error || err.message));
        }
    };

    const toggleLatexSteps = async () => {
        if (!task) return;

        if (showLatexSteps) {
            setShowLatexSteps(false);
            return;
        }

        if (!solutionData) {
            try {
                const response = await axios.get(`/api/task/${task.task_id}/solution/`);
                setSolutionData(response.data);
                setShowLatexSteps(true);
            } catch (err) {
                setError('Failed to fetch solution for steps: ' + (err.response?.data?.error || err.message));
                return;
            }
        } else {
            setShowLatexSteps(true);
        }
    };

    const generateFullLatex = (task) => {
        if (!task) return '';
        
        // If we have the protocol derivation, show the whole thing
        if (solutionData && solutionData.latex_solution) {
            return Array.isArray(solutionData.latex_solution) 
                ? solutionData.latex_solution.join('\n\n') 
                : solutionData.latex_solution;
        }

        // Use the raw_latex already provided by the backend preview (optimized skeleton)
        return task.equation_preview.raw_latex;
    };

    const handleCopyLatex = (task, type = 'full') => {
        let text = '';
        if (type === 'problem') {
            text = task.equation_preview.raw_latex;
        } else {
            text = generateFullLatex(task);
        }

        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(type === 'problem' ? '✅ Problem LaTeX Copied!' : '✅ Full Protocol Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
        });
    };

    if (loading && !task) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Paper-style container */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">System Solver</h2>
                        <p className="text-sm text-slate-500 mt-1">Protocol v2 • Optimal Control Theory</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={generateNewTask} 
                            disabled={loading}
                            className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Generating...' : '🔄 Generate New'}
                        </button>
                        <button 
                            onClick={() => navigate('/custom')}
                            className="px-4 py-2 border-2 border-green-600 text-green-700 rounded-md hover:bg-green-50 transition-colors"
                        >
                            ⚙️ Custom Task
                        </button>
                    </div>
                </div>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {task && (
                    <Box>
                        {/* 1. Dynamics & Objective Paper */}
                        <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', borderLeft: '4px solid #3498db' }}>
                            <Typography variant="h6" gutterBottom>System Dynamics & Objective:</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Calculate the exact integer scalar sum <MathEquation latex="\( \mathcal{S} = \sum u_i(t_f) \)" /> for the system below:
                            </Typography>
                            
                            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, mb: 2, width: '100%' }}>
                                <MathEquation latex={`\\[ \\begin{aligned} & \\frac{dx}{dt} = ${task.equation_preview.dx_dt} \\\\ & \\frac{dy}{dt} = ${task.equation_preview.dy_dt} \\\\ & \\frac{dz}{dt} = ${task.equation_preview.dz_dt} \\\\ & \\frac{dw}{dt} = ${task.equation_preview.dw_dt} \\end{aligned} \\]`} />
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2">Initial State: <MathEquation latex={`\\\( [${task.initial_conditions.x0.toFixed(4)}, ${task.initial_conditions.y0.toFixed(4)}, ${task.initial_conditions.z0.toFixed(4)}, ${task.initial_conditions.w0.toFixed(4)}]^T \\\)`} /></Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2">Terminal Time: <MathEquation latex={`\\\( t_f = ${task.target_time.toFixed(6)} \\\)`} /></Typography>
                                </Grid>
                            </Grid>
                            
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    color="secondary"
                                    onClick={() => setShowRawLatex(!showRawLatex)}
                                >
                                    {showRawLatex ? 'Hide Raw Segments' : '📋 SHOW RAW LATEX PROTOCOL'}
                                </Button>
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary"
                                    onClick={() => handleCopyLatex(task, 'problem')}
                                >
                                    📋 Copy Problem LaTeX
                                </Button>
                                {copySuccess && (
                                    <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', ml: 1, fontWeight: 'bold' }}>
                                        {copySuccess}
                                    </Typography>
                                )}
                            </Box>
                            
                            {showRawLatex && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>Section 1: Full Problem Definition (LaTeX Source)</Typography>
                                    {!solutionData ? (
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#272822', color: '#f8f8f2', fontFamily: 'monospace', mb: 2, fontSize: '0.8rem' }}>
                                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{generateFullLatex(task)}</pre>
                                        </Paper>
                                    ) : (
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#272822', color: '#f8f8f2', fontFamily: 'monospace', mb: 2, fontSize: '0.8rem', position: 'relative' }}>
                                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{generateFullLatex(task).split('\n\n')[0]}</pre>
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="secondary"
                                                sx={{ position: 'absolute', top: 5, right: 5, minWidth: '40px', py: 0, fontSize: '0.65rem' }}
                                                onClick={() => {
                                                    const text = generateFullLatex(task).split('\n\n')[0];
                                                    navigator.clipboard.writeText(text).then(() => {
                                                        setCopySuccess('✅ Problem Source Copied!');
                                                        setTimeout(() => setCopySuccess(''), 2000);
                                                    });
                                                }}
                                            >
                                                Copy
                                            </Button>
                                        </Paper>
                                    )}

                                    <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>Section 1: Problem Definition (Decoupled Math & Text)</Typography>
                                    {!solutionData ? (
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                                            <Typography variant="body2" color="textSecondary">Solve the problem to see the decoupled problem definition.</Typography>
                                        </Paper>
                                    ) : (
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white', mb: 2, overflowX: 'auto' }}>
                                            <MathEquation latex={generateFullLatex(task).split('\n\n')[0]} />
                                        </Paper>
                                    )}

                                    <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>Section 2: Full Analytical Protocol (Step-by-Step)</Typography>
                                    {!solutionData ? (
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#272822', color: '#f8f8f2', fontFamily: 'monospace', mb: 2, fontSize: '0.8rem' }}>
                                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>% Solve the problem to generate the full protocol LaTeX source here.</pre>
                                        </Paper>
                                    ) : (
                                        Array.isArray(solutionData.latex_solution) ? (
                                            solutionData.latex_solution.slice(1).map((step, index) => (
                                                <Box key={index} sx={{ mb: 2 }}>
                                                    <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mb: 0.5 }}>
                                                        Step {index + 1}:
                                                    </Typography>
                                                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#272822', color: '#f8f8f2', fontFamily: 'monospace', fontSize: '0.75rem', overflowX: 'auto', position: 'relative' }}>
                                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{step}</pre>
                                                        <Button 
                                                            size="small" 
                                                            variant="contained" 
                                                            color="secondary"
                                                            sx={{ position: 'absolute', top: 5, right: 5, minWidth: '40px', py: 0, fontSize: '0.65rem' }}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(step).then(() => {
                                                                    setCopySuccess(`✅ Step ${index + 1} Copied!`);
                                                                    setTimeout(() => setCopySuccess(''), 2000);
                                                                });
                                                            }}
                                                        >
                                                            Copy
                                                        </Button>
                                                    </Paper>
                                                </Box>
                                            ))
                                        ) : (
                                            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#272822', color: '#f8f8f2', fontFamily: 'monospace', mb: 1, fontSize: '0.8rem' }}>
                                                {solutionData.latex_solution}
                                            </Paper>
                                        )
                                    )}
                                    <Divider sx={{ my: 2, borderColor: '#484848' }} />
                                    
                                    <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>Section 3: Complete Protocol Source (Unified)</Typography>
                                    {!solutionData ? (
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#272822', color: '#f5f5f5', fontFamily: 'monospace', mb: 1, fontSize: '0.8rem' }}>
                                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{generateFullLatex(task)}</pre>
                                        </Paper>
                                    ) : (
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#272822', color: '#f5f5f5', fontFamily: 'monospace', mb: 1, fontSize: '0.8rem', position: 'relative' }}>
                                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>{generateFullLatex(task)}</pre>
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="secondary"
                                                sx={{ position: 'absolute', top: 5, right: 5, fontSize: '0.65rem' }}
                                                onClick={() => handleCopyLatex(task)}
                                            >
                                                Copy All
                                            </Button>
                                        </Paper>
                                    )}

                                </Box>
                            )}
                        </Paper>

                        {/* 2. Action Buttons */}
                        <Box display="flex" gap={2} mb={4} flexWrap="wrap">
                            <Button 
                                variant="contained" 
                                onClick={generateNewTask} 
                                disabled={loading}
                                sx={{ minWidth: '160px' }}
                            >
                                {loading ? 'Generating...' : '🔄 Generate New'}
                            </Button>
                            <Button 
                                variant="contained" 
                                color="warning" 
                                onClick={fetchSolution}
                            >
                                {showSolution ? 'Hide Solution' : '🔍 Show Solution'}
                            </Button>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={toggleLatexSteps}
                            >
                                {showLatexSteps ? 'Hide Steps' : '📝 LaTeX Steps'}
                            </Button>
                        </Box>

                        <Box display="flex" alignItems="center" gap={2} mb={4}>
                            <TextField 
                                label="Enter your solution (integer)" 
                                type="number" 
                                value={solutionInput}
                                onChange={(e) => setSolutionInput(e.target.value)}
                                sx={{ width: 300 }}
                            />
                            <Button variant="contained" color="primary" onClick={submitSolution} size="large">
                                ✅ Submit
                            </Button>
                        </Box>

                        {verificationResult && (
                            <Alert severity={verificationResult.is_correct ? "success" : "error"} sx={{ mb: 3 }}>
                                {verificationResult.is_correct 
                                    ? `Correct! The solution is ${verificationResult.ground_truth}` 
                                    : `Incorrect. Your answer: ${verificationResult.submitted_solution}, Correct answer: ${verificationResult.ground_truth}`
                                }
                            </Alert>
                        )}

                        {(showSolution || showLatexSteps) && solutionData && (
                            <Paper sx={{ p: 3, mb: 3, bgcolor: '#fdfcfe', borderLeft: '4px solid #673ab7', boxShadow: 3 }}>
                                <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Full Analytical Solution
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>Numerical Results</Typography>
                                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                            <Typography variant="subtitle2" gutterBottom>Final Evaluation State:</Typography>
                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                <li>u₁ (x) = {solutionData.final_values[0].toFixed(8)}</li>
                                                <li>u₂ (y) = {solutionData.final_values[1].toFixed(8)}</li>
                                                <li>u₃ (z) = {solutionData.final_values[2].toFixed(8)}</li>
                                                <li>u₄ (w) = {solutionData.final_values[3].toFixed(8)}</li>
                                            </ul>
                                            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1, border: '1px solid #c8e6c9' }}>
                                                <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                                                    Scalar Sum (Σ uᵢ): {solutionData.recalculated_metrics.final_solution}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom>System Analysis Protocol</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white', overflowX: 'auto' }}>
                                            {solutionData.latex_solution ? (
                                                Array.isArray(solutionData.latex_solution) ? (
                                                    solutionData.latex_solution.map((step, idx) => (
                                                        <Box key={idx} sx={{ mb: 2 }}>
                                                            <MathEquation latex={step} />
                                                            {idx < solutionData.latex_solution.length - 1 && <Divider sx={{ my: 2, borderStyle: 'dashed' }} />}
                                                        </Box>
                                                    ))
                                                ) : (
                                                    <MathEquation latex={solutionData.latex_solution} />
                                                )
                                            ) : (
                                                <Typography color="textSecondary">LaTeX Protocol derivation pending or unavailable.</Typography>
                                            )}
                                        </Paper>
                                        
                                        <Box mt={2}>
                                            <Button 
                                                size="small" 
                                                variant="text" 
                                                startIcon={<span>📋</span>}
                                                onClick={() => {
                                                    const fullText = Array.isArray(solutionData.latex_solution) 
                                                        ? solutionData.latex_solution.join('\n\n') 
                                                        : solutionData.latex_solution;
                                                    navigator.clipboard.writeText(fullText).then(() => {
                                                        setCopySuccess('✅ Protocol Copied!');
                                                        setTimeout(() => setCopySuccess(''), 2000);
                                                    });
                                                }}
                                            >
                                                {copySuccess === '✅ Protocol Copied!' ? 'Copied!' : 'Copy Full Protocol LaTeX'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}

                    </Box>
                )}
            </div>
        </div>
    );
};

export default ChallengeInterface;
