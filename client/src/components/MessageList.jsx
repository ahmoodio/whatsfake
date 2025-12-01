import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';

function MessageList({ messages, currentUser }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="messages-area">
            {messages.map(msg => (
                <MessageItem
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === currentUser.id}
                />
            ))}
            <div ref={bottomRef} />
        </div>
    );
}

export default MessageList;
