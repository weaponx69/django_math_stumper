import React, { useState, useEffect } from 'react';
import { createBoard } from '@wixc3/react-board';
import axios from 'axios';

// Create a wrapper component that provides mock data
const ChallengeInterfaceWithMock = () => {
    const [loading, setLoading] = useState(false);
    const [solutionData, setSolutionData] = useState(null);
    const [hasCalculated, setHasCalculated] = useState(false);
    
    const [coefficients, setCoefficients] = useState([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
    ]);

    const [initialConditions, setInitialConditions] = useState({
        x0: 0.5, y0: 1.0, z0: 1.5, w0: 2.0
    });

    const [targetTime, setTargetTime] = useState(1.5);

    // Simulate clicking "Randomize" on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setCoefficients([
                [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2],
                [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2],
                [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2],
                [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2]
            ]);
            setInitialConditions({
                x0: Math.random() * 2,
                y0: Math.random() * 2,
                z0: Math.random() * 2,
                w0: Math.random() * 2
            });
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const generateRandom = async () => {
        setLoading(true);
        // Simulate API delay
        await new Promise(r => setTimeout(r, 800));
        setCoefficients([
            [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2],
            [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2],
            [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2],
            [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2]
        ]);
        setInitialConditions({
            x0: Math.random() * 2,
            y0: Math.random() * 2,
            z0: Math.random() * 2,
            w0: Math.random() * 2
        });
        setLoading(false);
    };

    const calculate = async () => {
        setLoading(true);
        // Simulate API delay
        await new Promise(r => setTimeout(r, 1000));
        
        // Generate mock solution data
        setSolutionData({
            task_id: 1,
            final_values: [
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10,
                Math.random() * 10
            ],
            recalculated_metrics: { final_solution: Math.floor(Math.random() * 100) },
            latex_solution: [
                '\\frac{dx}{dt} = Ax',
                'x(t) = e^{At}x_0',
                '\\lambda = 1, 2, 3, 4'
            ]
        });
        setHasCalculated(true);
        setLoading(false);
    };

    const handleCoefficientChange = (row, col, value) => {
        const newMatrix = [...coefficients.map(row => [...row])];
        newMatrix[row][col] = parseFloat(value) || 0;
        setCoefficients(newMatrix);
    };

    const handleInitialConditionChange = (key, value) => {
        setInitialConditions({ ...initialConditions, [key]: parseFloat(value) || 0 });
    };

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

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col justify-center items-center min-h-[40vh]">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Computing Trajectories...</p>
                </div>
            )}

            {/* System Configuration Panel */}
            {!loading && (
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
                                                value={coefficients[i][j].toFixed(2)}
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
                                                value={initialConditions[key].toFixed(2)}
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
                                            onChange={(e) => setTargetTime(parseFloat(e.target.value) || 1)}
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
            )}

            {/* Results Section - Show when calculated */}
            {hasCalculated && solutionData && !loading && (
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
                </div>
            )}
        </div>
    );
};

export default createBoard({
    name: 'Challenge Interface',
    Board: () => <ChallengeInterfaceWithMock />,
});
