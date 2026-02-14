import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [solutionInput, setSolutionInput] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [solutionData, setSolutionData] = useState(null);
    const [hasCalculated, setHasCalculated] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    // Pre-filled rank-1 coefficient matrix
    const [coefficients, setCoefficients] = useState([
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
    ]);

    // Editable initial conditions
    const [initialConditions, setInitialConditions] = useState({
        x0: 0.5, y0: 0.5, z0: 0.5, w0: 0.5
    });

    // Editable target time
    const [targetTime, setTargetTime] = useState(1.0);

    // Generate random task
    const generateRandom = async () => {
        setLoading(true);
        setError(null);
        setSolutionInput('');
        setVerificationResult(null);
        setSolutionData(null);
        setHasCalculated(false);

        try {
            const response = await axios.get('/api/generate/');
            const taskData = response.data;

            // Populate the editable fields with the generated values
            if (taskData.coefficients && taskData.coefficients.linear) {
                setCoefficients(taskData.coefficients.linear.map(row => [...row]));
            }
            if (taskData.initial_conditions) {
                setInitialConditions({ ...taskData.initial_conditions });
            }
            if (taskData.target_time) {
                setTargetTime(taskData.target_time);
            }
        } catch (err) {
            setError('Failed to generate: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Calculate - generates task AND fetches solution in one step
    const calculate = async () => {
        setLoading(true);
        setError(null);
        setSolutionInput('');
        setVerificationResult(null);

        // Parse coefficients to numbers
        const parsedCoefficients = coefficients.map(row => 
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
                linear: parsedCoefficients
            },
            initial_conditions: parsedInitialConditions,
            target_time: parseFloat(targetTime) || 1.0
        };

        try {
            // Create the task with custom coefficients
            const response = await axios.post('/api/create_custom/', payload);
            const taskData = response.data;

            // Immediately fetch the solution
            const solutionResponse = await axios.get(`/api/task/${taskData.task_id}/solution/`);
            setSolutionData(solutionResponse.data);
            setHasCalculated(true);
        } catch (err) {
            setError('Failed to calculate: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const submitSolution = async () => {
        if (!solutionData || !solutionInput) return;
        
        // Get the task_id from solutionData
        const taskId = solutionData.task_id || 1;
        
        try {
            const response = await axios.post('/api/verify/', {
                task_id: taskId,
                solution: parseInt(solutionInput)
            });
            setVerificationResult(response.data);
        } catch (err) {
            setError('Verification failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleCoefficientChange = (row, col, value) => {
        const newMatrix = [...coefficients.map(row => [...row])];
        newMatrix[row][col] = value;
        setCoefficients(newMatrix);
    };

    const handleInitialConditionChange = (key, value) => {
        setInitialConditions({ ...initialConditions, [key]: value });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Container */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">System Solver</h2>
                        <p className="text-sm text-slate-500 mt-1">Protocol v2 • Optimal Control Theory</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={generateRandom} 
                            disabled={loading}
                            className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Loading...' : '🎲 Random'}
                        </button>
                        <button 
                            onClick={calculate}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Calculating...' : '✓ Calculate'}
                        </button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* SECTION 1: INPUT */}
                <div className="border border-slate-300 rounded-lg p-4 mb-6 bg-slate-50">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Input</h3>
                    
                    {/* Coefficient Matrix */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Coefficient Matrix (4x4)</h4>
                        <div className="space-y-2">
                            {['dx/dt', 'dy/dt', 'dz/dt', 'dw/dt'].map((rowLabel, i) => (
                                <div key={`row-${i}`} className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700 w-12">{rowLabel} =</span>
                                    <div className="grid grid-cols-4 gap-2 flex-1">
                                        {['x', 'y', 'z', 'w'].map((colLabel, j) => (
                                            <input
                                                key={`cell-${i}-${j}`}
                                                type="number"
                                                step="0.1"
                                                value={coefficients[i][j]}
                                                onChange={(e) => handleCoefficientChange(i, j, e.target.value)}
                                                className="px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Initial Conditions */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Initial Conditions (t=0)</h4>
                        <div className="grid grid-cols-4 gap-3">
                            {['x0', 'y0', 'z0', 'w0'].map((key) => (
                                <div key={key}>
                                    <label className="block text-xs text-slate-600 mb-1">{key}</label>
                                    <input 
                                        type="number"
                                        step="0.1"
                                        value={initialConditions[key]}
                                        onChange={(e) => handleInitialConditionChange(key, e.target.value)}
                                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Target Time */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Target Time</h4>
                        <div className="max-w-32">
                            <input 
                                type="number"
                                step="0.1"
                                value={targetTime}
                                onChange={(e) => setTargetTime(e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: SOLUTION */}
                {hasCalculated && solutionData && (
                    <div className="border border-purple-200 rounded-lg p-4 mb-6 bg-purple-50">
                        <h3 className="text-lg font-semibold text-purple-800 mb-4">Solution</h3>
                        
                        {/* Numerical Results */}
                        <div className="bg-slate-100 p-4 rounded-md mb-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">Final Evaluation State:</p>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 mb-3">
                                <li>u₁ (x) = {solutionData.final_values[0].toFixed(8)}</li>
                                <li>u₂ (y) = {solutionData.final_values[1].toFixed(8)}</li>
                                <li>u₃ (z) = {solutionData.final_values[2].toFixed(8)}</li>
                                <li>u₄ (w) = {solutionData.final_values[3].toFixed(8)}</li>
                            </ul>
                            <div className="p-3 bg-green-100 rounded-md border border-green-200">
                                <p className="text-base font-bold text-green-700">
                                    Scalar Sum (Σ uᵢ): {solutionData.recalculated_metrics.final_solution}
                                </p>
                            </div>
                        </div>

                        {/* LaTeX Steps */}
                        <div className="bg-white border rounded p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-semibold text-slate-700">Solution Steps</h4>
                                <button 
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    onClick={() => {
                                        const fullText = Array.isArray(solutionData.latex_solution) 
                                            ? solutionData.latex_solution.join('\n\n') 
                                            : solutionData.latex_solution;
                                        navigator.clipboard.writeText(fullText).then(() => {
                                            setCopySuccess('✅ Copied!');
                                            setTimeout(() => setCopySuccess(''), 2000);
                                        });
                                    }}
                                >
                                    {copySuccess || '📋 Copy'}
                                </button>
                            </div>
                            {solutionData.latex_solution ? (
                                Array.isArray(solutionData.latex_solution) ? (
                                    solutionData.latex_solution.map((step, idx) => (
                                        <div key={idx} className="mb-4">
                                            <MathEquation latex={step} />
                                            {idx < solutionData.latex_solution.length - 1 && <hr className="my-3 border-dashed border-slate-300" />}
                                        </div>
                                    ))
                                ) : (
                                    <MathEquation latex={solutionData.latex_solution} />
                                )
                            ) : (
                                <p className="text-slate-500 text-sm">LaTeX Protocol derivation pending or unavailable.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Answer Submission */}
                {hasCalculated && solutionData && (
                    <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Submit Answer</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <input 
                                type="number"
                                placeholder="Enter your solution (integer)"
                                value={solutionInput}
                                onChange={(e) => setSolutionInput(e.target.value)}
                                className="px-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 w-full sm:w-72"
                            />
                            <button 
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                                onClick={submitSolution}
                            >
                                ✅ Submit
                            </button>
                        </div>

                        {/* Verification Result */}
                        {verificationResult && (
                            <div className={`mt-4 p-4 rounded-md ${verificationResult.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <p className={verificationResult.is_correct ? 'text-green-700' : 'text-red-700'}>
                                    {verificationResult.is_correct 
                                        ? `Correct! The solution is ${verificationResult.ground_truth}` 
                                        : `Incorrect. Your answer: ${verificationResult.submitted_solution}, Correct answer: ${verificationResult.ground_truth}`
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengeInterface;
