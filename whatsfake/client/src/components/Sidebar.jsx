import React from 'react';
import ChatList from './ChatList';
import { MessageSquare, Users, Settings } from 'lucide-react';

function Sidebar({ currentUser, activeView, onChangeView, activeChat, onSelectChat, onUpdateUser, onSignOut }) {
    return (
        <div className="sidebar" style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
            {/* Top Navigation Bar */}
            <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--bg-input)' }}>
                <button
                    className="btn-primary"
                    style={{ flex: 1, background: activeView === 'chats' ? 'var(--bg-input)' : 'transparent', color: 'var(--text-primary)' }}
                    onClick={() => onChangeView('chats')}
                >
                    <MessageSquare size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Chats
                </button>
                <button
                    className="btn-primary"
                    style={{ flex: 1, background: activeView === 'friends' ? 'var(--bg-input)' : 'transparent', color: 'var(--text-primary)' }}
                    onClick={() => onChangeView('friends')}
                >
                    <Users size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Friends
                </button>
            </div>

            {activeView === 'chats' ? (
                <ChatList
                    currentUser={currentUser}
                    activeChat={activeChat}
                    onSelectChat={onSelectChat}
                    onUpdateUser={onUpdateUser}
                    onSignOut={onSignOut}
                />
            ) : (
                <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
                    Select "Friends" to manage your connections.
                </div>
            )}
        </div>
    );
}

export default Sidebar;
