import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, MessageSquare, Users } from 'lucide-react';

function FriendsView({ currentUser, onStartChat }) {
    const [activeTab, setActiveTab] = useState('online'); // online, all, pending, add
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [addUsername, setAddUsername] = useState('');
    const [addStatus, setAddStatus] = useState('');

    useEffect(() => {
        fetchFriends();
    }, [currentUser]);

    const fetchFriends = () => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/friends?userId=${currentUser.id}`)
            .then(res => res.json())
            .then(data => {
                setFriends(data.friends);
                setRequests(data.requests);
            })
            .catch(err => console.error(err));
    };

    const sendRequest = async () => {
        if (!addUsername.trim()) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/friends/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromUserId: currentUser.id, toUsername: addUsername })
            });
            const data = await res.json();
            if (res.ok) {
                setAddStatus('Friend request sent!');
                setAddUsername('');
            } else {
                setAddStatus(data.error || 'Failed to send request');
            }
        } catch (err) {
            setAddStatus('Network error');
        }
    };

    const acceptRequest = async (fromUserId) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/friends/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, fromUserId })
            });
            fetchFriends();
        } catch (err) {
            console.error(err);
        }
    };

    const renderFriendList = (filterFn) => (
        <div className="friend-list" style={{ padding: '1rem' }}>
            {friends.filter(filterFn).map(friend => (
                <div key={friend.id} className="chat-item" style={{ cursor: 'default' }}>
                    <img src={friend.avatar} alt={friend.username} className="chat-avatar" />
                    <div className="chat-info">
                        <div className="chat-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {friend.username}
                            {friend.gameActivity && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                    Playing {friend.gameActivity}
                                </span>
                            )}
                        </div>
                        <div className="chat-preview">{friend.status || 'Online'}</div>
                    </div>
                    <button className="icon-btn" onClick={() => onStartChat(friend)}>
                        <MessageSquare size={20} />
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="chat-window">
            <div className="chat-header" style={{ justifyContent: 'flex-start', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    <Users size={24} /> Friends
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {['online', 'all', 'pending', 'add'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab ? '600' : '400',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                backgroundColor: activeTab === tab ? 'var(--bg-input)' : 'transparent'
                            }}
                        >
                            {tab === 'add' ? 'Add Friend' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="messages-area">
                {activeTab === 'online' && renderFriendList(f => f.isOnline)}
                {activeTab === 'all' && renderFriendList(() => true)}

                {activeTab === 'pending' && (
                    <div style={{ padding: '1rem' }}>
                        {requests.length === 0 ? <div style={{ color: 'var(--text-secondary)' }}>No pending requests</div> : null}
                        {requests.map(req => (
                            <div key={req.id} className="chat-item" style={{ cursor: 'default' }}>
                                <img src={req.avatar} alt={req.username} className="chat-avatar" />
                                <div className="chat-info">
                                    <div className="chat-name">{req.username}</div>
                                    <div className="chat-preview">Incoming Friend Request</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="icon-btn" style={{ color: '#22c55e' }} onClick={() => acceptRequest(req.id)}>
                                        <Check size={20} />
                                    </button>
                                    <button className="icon-btn" style={{ color: '#ef4444' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'add' && (
                    <div style={{ padding: '2rem', maxWidth: '600px' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>Add Friend</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You can add friends with their username.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter username"
                                value={addUsername}
                                onChange={e => setAddUsername(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button className="btn-primary" style={{ width: 'auto' }} onClick={sendRequest}>
                                Send Friend Request
                            </button>
                        </div>
                        {addStatus && <div style={{ marginTop: '1rem', color: addStatus.includes('sent') ? '#22c55e' : '#ef4444' }}>{addStatus}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FriendsView;


