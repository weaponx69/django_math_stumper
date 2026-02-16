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
            className="math-container text-lg text-slate-700"
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

    const [coefficients, setCoefficients] = useState([
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
    ]);

    const [initialConditions, setInitialConditions] = useState({
        x0: 0.5, y0: 0.5, z0: 0.5, w0: 0.5
    });

    const [targetTime, setTargetTime] = useState(1.0);

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

    const calculate = async () => {
        setLoading(true);
        setError(null);
        setSolutionInput('');
        setVerificationResult(null);

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
            coefficients: { linear: parsedCoefficients },
            initial_conditions: parsedInitialConditions,
            target_time: parseFloat(targetTime) || 1.0
        };

        try {
            const response = await axios.post('/api/create_custom/', payload);
            const taskData = response.data;
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
            <div className="flex flex-col justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
                <p className="text-slate-500 font-medium animate-pulse">Computing Trajectories...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            {/* Header Section within Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System-Solver</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-wide mt-1">PROTOCOL v2</p>
                </div>
                <div className="flex gap-3">
                        <button 
                        onClick={generateRandom} 
                        disabled={loading}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-all shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Randomize
                    </button>
                    <button 
                        onClick={calculate}
                        disabled={loading}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run Simulation
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm flex items-center gap-3 animate-pulse">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* System Configuration Panel */}
            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Left Column: Coefficient Matrix */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                            Coefficient Matrix (A)
                        </h2>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center items-center">
                        <div className="relative p-6">
                            {/* Matrix Brackets */}
                            <div className="absolute top-0 left-0 w-6 h-full border-l-2 border-t-2 border-b-2 border-slate-300 rounded-l-xl"></div>
                            <div className="absolute top-0 right-0 w-6 h-full border-r-2 border-t-2 border-b-2 border-slate-300 rounded-r-xl"></div>
                            
                            <div className="grid grid-cols-4 gap-4 z-10 relative">
                                {coefficients.map((row, i) => (
                                    row.map((val, j) => (
                                        <input
                                            key={`cell-${i}-${j}`}
                                            type="number"
                                            step="0.1"
                                            value={coefficients[i][j]}
                                            onChange={(e) => handleCoefficientChange(i, j, e.target.value)}
                                            className="w-16 h-12 text-center bg-slate-50/50 border-b-2 border-slate-200 focus:border-indigo-500 outline-none font-mono text-slate-700 text-lg transition-all rounded-t-md hover:bg-slate-100 focus:bg-white"
                                        />
                                    ))
                                ))}
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm mt-6 text-center italic">
                            Define the linear dynamics of the system ẋ = Ax
                        </p>
                    </div>
                </div>

                {/* Right Column: Initial Conditions & Time */}
                <div className="space-y-6">
                    {/* Initial Conditions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                Initial State (t=0)
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                {['x0', 'y0', 'z0', 'w0'].map((key) => (
                                    <div key={key} className="relative group">
                                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-slate-500 group-focus-within:text-emerald-600 transition-colors uppercase z-10">
                                            {key}
                                        </label>
                                        <input 
                                            type="number"
                                            step="0.1"
                                            value={initialConditions[key]}
                                            onChange={(e) => handleInitialConditionChange(key, e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Target Time */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                                Time Horizon
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 group">
                                         <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-slate-500 group-focus-within:text-amber-600 transition-colors uppercase z-10">
                                        Target Time (t<sub className="text-[10px]">f</sub>)
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.1"
                                        value={targetTime}
                                        onChange={(e) => setTargetTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-slate-700 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                    />
                                </div>
                                <div className="text-sm text-slate-500 max-w-[150px] leading-snug">
                                    seconds until integration completes.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {hasCalculated && solutionData && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden mb-8 transform transition-transform duration-500">
                        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                                <p className="text-slate-400 text-sm mt-1">Computed state vector at t = {targetTime}s</p>
                            </div>
                            <div className="bg-indigo-500/20 px-4 py-2 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
                                <span className="text-xs text-indigo-300 uppercase font-bold tracking-wider block mb-1">Scalar Score</span>
                                <span className="text-2xl font-mono font-bold text-white">{solutionData.recalculated_metrics.final_solution}</span>
                            </div>
                        </div>
                        
                        {/* Detailed States */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800">
                            {['x', 'y', 'z', 'w'].map((label, idx) => (
                                <div key={label} className="bg-slate-900 p-6 flex flex-col items-center justify-center hover:bg-slate-800/80 transition-colors group cursor-default">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-white transition-colors">State {label}</span>
                                    <span className={`text-2xl font-mono ${
                                        idx === 0 ? 'text-blue-400' : 
                                        idx === 1 ? 'text-emerald-400' : 
                                        idx === 2 ? 'text-purple-400' : 'text-amber-400'
                                    }`}>
                                        {solutionData.final_values[idx].toFixed(6)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Derivation Steps */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-semibold text-slate-800">Mathematical Derivation</h3>
                                <button 
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                                    onClick={() => {
                                        const fullText = Array.isArray(solutionData.latex_solution) 
                                            ? solutionData.latex_solution.join('\n\n') 
                                            : solutionData.latex_solution;
                                        navigator.clipboard.writeText(fullText).then(() => {
                                            setCopySuccess('Copied!');
                                            setTimeout(() => setCopySuccess(''), 2000);
                                        });
                                    }}
                                >
                                    {copySuccess || 'Copy LaTeX'}
                                </button>
                            </div>
                            <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {solutionData.latex_solution ? (
                                    <div className="space-y-8">
                                        {(Array.isArray(solutionData.latex_solution) ? solutionData.latex_solution : [solutionData.latex_solution]).map((step, idx) => (
                                            <div key={idx} className="relative pl-6 border-l-2 border-indigo-100">
                                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-200"></span>
                                                <MathEquation latex={step} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        No derivation available.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Verification Panel */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 sticky top-24 overflow-hidden transform transition-all hover:-translate-y-1 hover:shadow-xl duration-300">
                                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                                    <h3 className="text-lg font-bold relative z-10">Verification Protocol</h3>
                                    <p className="text-indigo-100 text-sm opacity-90 relative z-10">Confirm system stability.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Enter Integer Solution
                                        </label>
                                        <input 
                                            type="number"
                                            placeholder="0"
                                            value={solutionInput}
                                            onChange={(e) => setSolutionInput(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>
                                    
                                    <button 
                                        className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transform active:scale-[0.98] transition-all shadow-lg shadow-slate-200"
                                        onClick={submitSolution}
                                    >
                                        Verify Results
                                    </button>

                                    {verificationResult && (
                                        <div key={verificationResult.timestamp} className={`mt-4 p-4 rounded-xl text-sm border flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300 ${
                                            verificationResult.is_correct 
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                            : 'bg-red-50 border-red-200 text-red-800'
                                        }`}>
                                            <span className="text-xl">
                                                {verificationResult.is_correct ? '🎉' : '❌'}
                                            </span>
                                            <div>
                                                <p className="font-bold mb-1">
                                                    {verificationResult.is_correct ? 'Authentication Successful' : 'Verification Failed'}
                                                </p>
                                                <p className="text-xs opacity-80">
                                                    {verificationResult.is_correct 
                                                        ? `Sequence matched: ${verificationResult.ground_truth}` 
                                                        : `Expected ${verificationResult.ground_truth}, received ${verificationResult.submitted_solution}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengeInterface;
