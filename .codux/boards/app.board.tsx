import React from 'react';
import { createBoard } from '@wixc3/react-board';

const AppBoard = () => {
    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#020617', 
            color: '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <header style={{ 
                position: 'relative', 
                zIndex: 10, 
                borderBottom: '1px solid #1e293b', 
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(12px)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            background: 'linear-gradient(to bottom right, #6366f1, #2563eb)', 
                            borderRadius: '12px',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <span style={{ fontSize: '24px', fontFamily: 'serif', fontWeight: 'bold', color: 'white' }}>∫</span>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'white', letterSpacing: '-0.025em' }}>
                                Math<span style={{ color: '#60a5fa' }}>Stumper</span>
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: 'full', backgroundColor: '#10b981' }}></span>
                                <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.1em' }}>AI PROCESSING ACTIVE</p>
                            </div>
                        </div>
                    </div>
                    <nav>
                        <button style={{ 
                            padding: '8px 20px', 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#fda4af', 
                            backgroundColor: 'rgba(244, 63, 94, 0.1)', 
                            border: '1px solid rgba(244, 63, 94, 0.2)', 
                            borderRadius: '9999px',
                            cursor: 'pointer'
                        }}>
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ position: 'relative', zIndex: 10, maxWidth: '1024px', margin: '0 auto', width: '100%', padding: '48px 16px', flex: 1 }}>
                <div style={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
                    border: '1px solid #1e293b', 
                    borderRadius: '24px', 
                    padding: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            margin: '0 auto 24px', 
                            backgroundColor: 'rgba(79, 70, 229, 0.2)', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <svg style={{ width: '40px', height: '40px', color: '#818cf8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Challenge Interface</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Use the Challenge board to edit the ODE solver interface</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                            <button style={{ 
                                padding: '10px 20px', 
                                backgroundColor: 'white', 
                                border: '1px solid #e2e8f0', 
                                color: '#475569', 
                                borderRadius: '8px', 
                                fontSize: '14px', 
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}>
                                Randomize
                            </button>
                            <button style={{ 
                                padding: '10px 20px', 
                                backgroundColor: '#4f46e5', 
                                color: 'white', 
                                borderRadius: '8px', 
                                fontSize: '14px', 
                                fontWeight: '500',
                                border: 'none',
                                cursor: 'pointer'
                            }}>
                                Run Simulation
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ position: 'relative', zIndex: 10, padding: '32px 0', borderTop: '1px solid #0f172a', backgroundColor: '#020617' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '32px', color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>
                        <span>nabla x E = -dB/dt</span>
                        <span>e + 1 = 0</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>System Solver Protocol • 2026</p>
                        <p style={{ color: '#475569', fontSize: '10px', marginTop: '4px' }}>Computational Engine: DRF</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default createBoard({
    name: 'App - Main Layout',
    Board: () => <AppBoard />,
});
