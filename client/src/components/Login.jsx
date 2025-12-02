import React, { useState } from 'react';

function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Username and password are required');
            return;
        }

        const endpoint = isLogin ? '/api/login' : '/api/register';

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                onLogin(data);
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (err) {
            console.error("Auth failed", err);
            setError('Network error - check if server is running');
        }
    };

    return (
        <div className="login-screen">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Gamer WhatsFake</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {isLogin ? 'Welcome back, player.' : 'Join the game.'}
            </p>

            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', width: '350px', border: '1px solid var(--bg-input)' }}>
                <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--bg-input)' }}>
                    <button
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'none',
                            border: 'none',
                            color: isLogin ? 'var(--accent)' : 'var(--text-secondary)',
                            borderBottom: isLogin ? '2px solid var(--accent)' : 'none',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                        onClick={() => { setIsLogin(true); setError(''); }}
                    >
                        Sign In
                    </button>
                    <button
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'none',
                            border: 'none',
                            color: !isLogin ? 'var(--accent)' : 'var(--text-secondary)',
                            borderBottom: !isLogin ? '2px solid var(--accent)' : 'none',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                        onClick={() => { setIsLogin(false); setError(''); }}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                        autoFocus
                    />
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    />

                    {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="btn-primary">
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
