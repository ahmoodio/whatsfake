import React, { useState, useEffect } from 'react';
import { Plus, Users, Settings } from 'lucide-react';
import CreateChatModal from './CreateChatModal';
import SettingsModal from './SettingsModal';
import { socket } from '../App';

function ChatList({ currentUser, activeChat, onSelectChat, onUpdateUser, onSignOut }) {
    const [chats, setChats] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    useEffect(() => {
        fetchChats();

        socket.on('chat_new', (newChat) => {
            // Refresh chats or append
            fetchChats();
        });

        return () => {
            socket.off('chat_new');
        };
    }, [currentUser]);

    const fetchChats = () => {
        fetch(`http://localhost:3000/api/chats?userId=${currentUser.id}`)
            .then(res => res.json())
            .then(data => setChats(data))
            .catch(err => console.error(err));
    };

    return (
        <>
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={currentUser.avatar} alt="Me" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontWeight: 'bold' }}>Chats</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="icon-btn" onClick={() => setShowSettingsModal(true)}>
                        <Settings size={20} />
                    </button>
                    <button className="icon-btn" onClick={() => setShowCreateModal(true)}>
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="chat-list">
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                        onClick={() => onSelectChat(chat)}
                    >
                        <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
                        <div className="chat-info">
                            <div className="chat-name">{chat.name}</div>
                            <div className="chat-preview">
                                {chat.type === 'group' && <Users size={12} style={{ marginRight: 4 }} />}
                                {chat.messages.length > 0 ? 'Last message...' : 'Start a conversation'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showCreateModal && (
                <CreateChatModal
                    currentUser={currentUser}
                    onClose={() => setShowCreateModal(false)}
                    onChatCreated={(chat) => {
                        setChats(prev => [...prev, chat]);
                        onSelectChat(chat);
                    }}
                />
            )}

            {showSettingsModal && (
                <SettingsModal
                    currentUser={currentUser}
                    onClose={() => setShowSettingsModal(false)}
                    onUpdateUser={onUpdateUser}
                    onSignOut={onSignOut}
                />
            )}
        </>
    );
}

export default ChatList;
