import React from "react";
import { createBoard } from "@wixc3/react-board";

const SimpleTestBoard = () => {
    return (
        <div style={{ 
            padding: '20px', 
            fontFamily: 'system-ui, sans-serif',
            backgroundColor: '#f0f9ff',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <h1 style={{ color: '#0c4a6e', fontSize: '24px', marginBottom: '10px' }}>
                Codux Test Board
            </h1>
            <p style={{ color: '#0369a1' }}>
                If you can see this, the board is working!
            </p>
            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <button style={{
                    padding: '10px 20px',
                    backgroundColor: '#0284c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}>
                    Test Button
                </button>
            </div>
        </div>
    );
};

export default createBoard({
    name: "Simple Test",
    Board: () => <SimpleTestBoard />,
});
