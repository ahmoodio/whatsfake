import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import FriendsView from './components/FriendsView';
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

function App() {
    const [user, setUser] = useState(null);
    const [activeView, setActiveView] = useState('chats'); // 'chats' or 'friends'
    const [activeChat, setActiveChat] = useState(null);

    useEffect(() => {
        if (user) {
            socket.emit('join_user', user.id);
        }
    }, [user]);

    if (!user) {
        return <Login onLogin={setUser} />;
    }

    const handleStartChat = async (friend) => {
        // Check if chat exists or create new
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/chats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'direct',
                    participants: [user.id, friend.id]
                })
            });
            const chat = await res.json();
            setActiveChat(chat);
            setActiveView('chats');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="app-container">
            <Sidebar
                currentUser={user}
                activeView={activeView}
                onChangeView={setActiveView}
                activeChat={activeChat}
                onSelectChat={(chat) => { setActiveChat(chat); setActiveView('chats'); }}
                onUpdateUser={setUser}
                onSignOut={() => { setUser(null); setActiveChat(null); }}
            />

            {activeView === 'friends' ? (
                <FriendsView currentUser={user} onStartChat={handleStartChat} />
            ) : activeChat ? (
                <ChatWindow
                    currentUser={user}
                    chat={activeChat}
                />
            ) : (
                <div className="chat-window" style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <h2>Welcome back, {user.username}</h2>
                        <p>Select a chat or find friends to start messaging</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
