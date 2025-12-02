import React, { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';

function CreateChatModal({ currentUser, onClose, onChatCreated }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [error, setError] = useState('');
    const [groupName, setGroupName] = useState('');
    const [mode, setMode] = useState('direct'); // 'direct' or 'group'
    const [groupParticipants, setGroupParticipants] = useState([]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setError('');
        setFoundUser(null);

        if (searchQuery.toLowerCase() === currentUser.username.toLowerCase()) {
            setError("You can't add yourself!");
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: searchQuery })
            });

            const data = await res.json();

            if (res.ok) {
                setFoundUser(data);
            } else {
                setError(data.error || 'User not found');
            }
        } catch (err) {
            setError('Search failed');
        }
    };

    const startDirectChat = async (otherUser) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/chats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'direct',
                    participants: [currentUser.id, otherUser.id]
                })
            });
            const newChat = await res.json();
            onChatCreated(newChat);
            onClose();
        } catch (err) {
            console.error("Failed to create chat", err);
        }
    };

    const addToGroupList = (user) => {
        if (!groupParticipants.find(p => p.id === user.id)) {
            setGroupParticipants([...groupParticipants, user]);
            setFoundUser(null);
            setSearchQuery('');
        }
    };

    const createGroup = async () => {
        if (!groupName || groupParticipants.length === 0) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/chats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'group',
                    participants: [currentUser.id, ...groupParticipants.map(u => u.id)],
                    name: groupName
                })
            });
            const newChat = await res.json();
            onChatCreated(newChat);
            onClose();
        } catch (err) {
            console.error("Failed to create group", err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    {mode === 'direct' ? 'Add Friend' : 'Create Group'}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                        className={`btn-primary ${mode === 'direct' ? '' : 'secondary'}`}
                        style={{ background: mode === 'direct' ? 'var(--accent)' : 'var(--bg-input)' }}
                        onClick={() => { setMode('direct'); setGroupParticipants([]); setError(''); setFoundUser(null); setSearchQuery(''); }}
                    >
                        Direct Message
                    </button>
                    <button
                        className={`btn-primary ${mode === 'group' ? '' : 'secondary'}`}
                        style={{ background: mode === 'group' ? 'var(--accent)' : 'var(--bg-input)' }}
                        onClick={() => { setMode('group'); setError(''); setFoundUser(null); setSearchQuery(''); }}
                    >
                        Create Group
                    </button>
                </div>

                {mode === 'group' && (
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Group Name"
                            className="input-field"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {groupParticipants.map(p => (
                                <div key={p.id} style={{ background: 'var(--bg-input)', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {p.username}
                                    <X size={14} style={{ cursor: 'pointer' }} onClick={() => setGroupParticipants(prev => prev.filter(x => x.id !== p.id))} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Enter username (e.g. ProGamer22)"
                            className="input-field"
                            style={{ flex: 1 }}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="icon-btn" style={{ background: 'var(--bg-input)', borderRadius: '0.5rem' }} onClick={handleSearch}>
                            <Search size={20} />
                        </button>
                    </div>
                    {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</div>}
                </div>

                {foundUser && (
                    <div className="chat-item" style={{ background: 'var(--bg-input)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <img src={foundUser.avatar} alt={foundUser.username} className="chat-avatar" style={{ width: 40, height: 40 }} />
                        <div className="chat-info">
                            <div className="chat-name">{foundUser.username}</div>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ width: 'auto', padding: '0.5rem 1rem' }}
                            onClick={() => mode === 'direct' ? startDirectChat(foundUser) : addToGroupList(foundUser)}
                        >
                            {mode === 'direct' ? 'Chat' : 'Add'}
                        </button>
                    </div>
                )}

                {mode === 'group' && groupParticipants.length > 0 && (
                    <button className="btn-primary" onClick={createGroup}>
                        Create Group ({groupParticipants.length} members)
                    </button>
                )}
            </div>
        </div>
    );
}

export default CreateChatModal;
