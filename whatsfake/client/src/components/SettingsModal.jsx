import React, { useState, useRef } from 'react';
import { X, Upload, LogOut } from 'lucide-react';

function SettingsModal({ currentUser, onClose, onUpdateUser, onSignOut }) {
    const [status, setStatus] = useState(currentUser.status || '');
    const [gameActivity, setGameActivity] = useState(currentUser.gameActivity || '');
    const [avatar, setAvatar] = useState(currentUser.avatar);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setAvatar(data.url);
            }
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/users/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar, status, gameActivity })
            });

            const updatedUser = await res.json();
            onUpdateUser(updatedUser);
            onClose();
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Settings</span>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <img
                            src={avatar}
                            alt="Avatar"
                            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
                        />
                        <button
                            className="icon-btn"
                            style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--bg-input)' }}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <Upload size={16} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{currentUser.username}</div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Status Message</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="What's on your mind?"
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Game Activity</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Playing Minecraft"
                        value={gameActivity}
                        onChange={e => setGameActivity(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>
                        Save Changes
                    </button>
                    <button
                        className="btn-primary"
                        onClick={onSignOut}
                        style={{ flex: 1, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
