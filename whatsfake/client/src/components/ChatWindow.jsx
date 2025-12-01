import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { socket } from '../App';

function ChatWindow({ currentUser, chat }) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Join chat room
        socket.emit('join_chat', chat.id);

        // Fetch history
        fetch(`http://localhost:3000/api/chats/${chat.id}/messages`)
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(err => console.error(err));

        // Listen for new messages
        const handleNewMessage = (msg) => {
            if (msg.chatId === chat.id) {
                setMessages(prev => [...prev, msg]);
            }
        };

        socket.on('message_new', handleNewMessage);

        return () => {
            socket.off('message_new', handleNewMessage);
        };
    }, [chat.id]);

    const sendMessage = (type, content) => {
        fetch(`http://localhost:3000/api/chats/${chat.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: currentUser.id,
                type,
                content
            })
        }).catch(err => console.error("Failed to send", err));
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        return data.url;
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
                <div className="chat-name">{chat.name}</div>
            </div>

            <MessageList messages={messages} currentUser={currentUser} />

            <MessageInput onSendMessage={sendMessage} onUpload={uploadFile} />
        </div>
    );
}

export default ChatWindow;
