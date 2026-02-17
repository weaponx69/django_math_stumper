import React, { useEffect, useRef } from 'react';

// Desmos Graph Component - Shows interactive ODE solution visualization
const DesmosGraph = ({ coefficients, initialConditions, targetTime, solutionData, show = true }) => {
    const containerRef = useRef(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (!show || !solutionData || !containerRef.current) return;

        // Create the Desmos embed URL with the solution equations
        const finalValues = solutionData.final_values || [];
        const xFinal = finalValues[0] || 0;
        const yFinal = finalValues[1] || 0;
        const zFinal = finalValues[2] || 0;
        const wFinal = finalValues[3] || 0;

        // Generate linear interpolation for visualization
        const x0 = initialConditions.x0 || 0;
        const y0 = initialConditions.y0 || 0;
        const z0 = initialConditions.z0 || 0;
        const w0 = initialConditions.w0 || 0;
        const tf = parseFloat(targetTime) || 1;

        // Build expressions for Desmos
        // We'll show the solution curves as piecewise linear approximations
        const expressions = [
            // Solution curves (x, y, z, w over time)
            {
                id: 'x_curve',
                latex: `x(t)=${x0}+(${xFinal - x0}/${tf})t`,
                color: '#4285F4',
                secret: false
            },
            {
                id: 'y_curve', 
                latex: `y(t)=${y0}+(${yFinal - y0}/${tf})t`,
                color: '#34A853',
                secret: false
            },
            {
                id: 'z_curve',
                latex: `z(t)=${z0}+(${zFinal - z0}/${tf})t`,
                color: '#9B51E0',
                secret: false
            },
            {
                id: 'w_curve',
                latex: `w(t)=${w0}+(${wFinal - w0}/${tf})t`,
                color: '#FBBC05',
                secret: false
            },
            // Initial condition points
            {
                id: 'point_x0',
                latex: `(${0}, ${x0})`,
                color: '#4285F4',
                pointStyle: 'OPEN'
            },
            {
                id: 'point_xf',
                latex: `(${tf}, ${xFinal})`,
                color: '#4285F4',
                pointStyle: 'CLOSED'
            },
            // Axis labels
            {
                id: 'xlabel',
                latex: `\\text{x(t)}`,
                color: '#4285F4',
                secret: false
            },
            {
                id: 'ylabel',
                latex: `\\text{y(t)}`,
                color: '#34A853',
                secret: false
            }
        ];

        // Build the state string for Desmos
        const state = {
            version: 11,
            expressions: {
                list: expressions
            },
            settings: {
                showGrid: true,
                showAxisLabels: true,
                projectorMode: false,
                fontSize: 12,
                invTrigStyle: 'rad',
                decimalSeparators: '.'
            },
            graph: {
                viewport: {
                    xmin: -0.5,
                    xmax: Math.max(tf + 0.5, 2),
                    ymin: Math.min(xFinal, yFinal, zFinal, wFinal, x0, y0, z0, w0) - 1,
                    ymax: Math.max(xFinal, yFinal, zFinal, wFinal, x0, y0, z0, w0) + 1
                }
            }
        };

        // Encode state for embed
        const encodedState = btoa(JSON.stringify(state));
        
        // Create or update iframe
        if (!iframeRef.current) {
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '400px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.allow = 'geolocation; microphone; camera; fullscreen';
            iframe.title = 'Desmos Graph';
            iframeRef.current = iframe;
            containerRef.current.appendChild(iframe);
        }

        // Set the Desmos embed URL
        const desmosUrl = `https://www.desmos.com/calculator?embed&state=${encodedState}`;
        iframeRef.current.src = desmosUrl;

    }, [show, solutionData, initialConditions, targetTime]);

    if (!show) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Solution Visualization
                </h3>
                <a 
                    href="https://www.desmos.com/calculator" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    Open in Desmos ↗
                </a>
            </div>
            <div 
                ref={containerRef} 
                className="p-4 bg-slate-50"
                style={{ minHeight: '420px' }}
            >
                {!solutionData && (
                    <div className="flex items-center justify-center h-[380px] text-slate-400">
                        <p>Run a simulation to see the graph</p>
                    </div>
                )}
            </div>
            {solutionData && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-slate-600">x(t)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-slate-600">y(t)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="text-slate-600">z(t)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-slate-600">w(t)</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesmosGraph;
