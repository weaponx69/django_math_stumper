import React, { useState } from 'react';
import { createBoard } from '@wixc3/react-board';

const ChallengeBoard = () => {
    const [loading, setLoading] = useState(false);
    const [hasCalculated, setHasCalculated] = useState(false);
    
    const [coefficients] = useState([
        [1.00, 2.00, 3.00, 4.00],
        [5.00, 6.00, 7.00, 8.00],
        [9.00, 10.00, 11.00, 12.00],
        [13.00, 14.00, 15.00, 16.00]
    ]);

    const [initialConditions] = useState({
        x0: 0.50, y0: 1.00, z0: 1.50, w0: 2.00
    });

    const [targetTime] = useState(1.50);

    const generateRandom = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
    };

    const calculate = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setHasCalculated(true);
        }, 1000);
    };

    return (
        <div style={{ width: '100%', padding: '32px', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.025em' }}>System-Solver</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', letterSpacing: '0.05em', marginTop: '4px' }}>PROTOCOL v2</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={generateRandom}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <svg style={{ width: '16px', height: '16px', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Randomize
                    </button>
                    <button 
                        onClick={calculate}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                        }}
                    >
                        <svg style={{ width: '16px', height: '16px', color: '#c7d2fe' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run Simulation
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        border: '4px solid #e0e7ff', 
                        borderTopColor: '#4f46e5', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite',
                        marginBottom: '16px'
                    }}></div>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Computing Trajectories...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* Content */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                    {/* Matrix */}
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '8px', height: '24px', backgroundColor: '#4f46e5', borderRadius: '4px' }}></span>
                                Coefficient Matrix (A)
                            </h2>
                        </div>
                        <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', padding: '24px' }}>
                                {/* Matrix brackets */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '24px', height: '100%', borderLeft: '2px solid #94a3b8', borderTop: '2px solid #94a3b8', borderBottom: '2px solid #94a3b8', borderRadius: '8px 0 0 8px' }}></div>
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '24px', height: '100%', borderRight: '2px solid #94a3b8', borderTop: '2px solid #94a3b8', borderBottom: '2px solid #94a3b8', borderRadius: '0 8px 8px 0' }}></div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 64px)', gap: '16px', position: 'relative', zIndex: 1 }}>
                                    {coefficients.map((row, i) =>
                                        row.map((val, j) => (
                                            <input
                                                key={`cell-${i}-${j}`}
                                                type="number"
                                                step="0.1"
                                                defaultValue={val.toFixed(2)}
                                                readOnly
                                                style={{
                                                    width: '64px',
                                                    height: '48px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f8fafc',
                                                    borderBottom: '2px solid #e2e8f0',
                                                    fontFamily: 'monospace',
                                                    fontSize: '18px',
                                                    color: '#475569',
                                                    outline: 'none'
                                                }}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', padding: '0 24px 24px' }}>
                            Define the linear dynamics of the system ẋ = Ax
                        </p>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Initial Conditions */}
                        <div style={{ 
                            backgroundColor: 'white', 
                            borderRadius: '16px', 
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '24px', backgroundColor: '#10b981', borderRadius: '4px' }}></span>
                                    Initial State (t=0)
                                </h2>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    {['x0', 'y0', 'z0', 'w0'].map((key) => (
                                        <div key={key} style={{ position: 'relative' }}>
                                            <label style={{ 
                                                position: 'absolute', 
                                                top: '-10px', 
                                                left: '12px', 
                                                backgroundColor: 'white', 
                                                padding: '0 4px', 
                                                fontSize: '12px', 
                                                fontWeight: '600', 
                                                color: '#64748b',
                                                textTransform: 'uppercase'
                                            }}>
                                                {key}
                                            </label>
                                            <input 
                                                type="number"
                                                step="0.1"
                                                defaultValue={initialConditions[key].toFixed(2)}
                                                readOnly
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    fontFamily: 'monospace',
                                                    fontSize: '16px',
                                                    color: '#475569',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Time */}
                        <div style={{ 
                            backgroundColor: 'white', 
                            borderRadius: '16px', 
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '24px', backgroundColor: '#f59e0b', borderRadius: '4px' }}></span>
                                    Time Horizon
                                </h2>
                            </div>
                            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <label style={{ 
                                        position: 'absolute', 
                                        top: '-10px', 
                                        left: '12px', 
                                        backgroundColor: 'white', 
                                        padding: '0 4px', 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#64748b',
                                        textTransform: 'uppercase'
                                    }}>
                                        Target Time (t<sub style={{ fontSize: '10px' }}>f</sub>)
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.1"
                                        defaultValue={targetTime}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontFamily: 'monospace',
                                            fontSize: '18px',
                                            color: '#475569',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div style={{ fontSize: '14px', color: '#64748b', maxWidth: '150px', lineHeight: '1.4' }}>
                                    seconds until integration completes.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {hasCalculated && !loading && (
                <div style={{ marginTop: '32px', backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a' }}>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>Analysis Results</h2>
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Computed state vector at t = {targetTime}s</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.2)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                            <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Scalar Score</span>
                            <span style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: '700', color: 'white' }}>42</span>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: '#1e293b' }}>
                        {['x', 'y', 'z', 'w'].map((label, idx) => (
                            <div key={label} style={{ backgroundColor: '#0f172a', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>State {label}</span>
                                <span style={{ 
                                    fontSize: '24px', 
                                    fontFamily: 'monospace',
                                    color: idx === 0 ? '#60a5fa' : idx === 1 ? '#34d399' : idx === 2 ? '#a78bfa' : '#fbbf24'
                                }}>
                                    {(Math.random() * 10).toFixed(6)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default createBoard({
    name: 'Challenge Interface',
    Board: () => <ChallengeBoard />,
});
