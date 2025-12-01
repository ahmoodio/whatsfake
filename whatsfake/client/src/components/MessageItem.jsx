import React from 'react';

function MessageItem({ message, isOwn }) {
    const renderContent = () => {
        switch (message.type) {
            case 'image':
                return <img src={message.content} alt="Shared" className="message-image" />;
            case 'video':
                return <video src={message.content} controls className="message-video" />;
            case 'audio':
                return <audio src={message.content} controls className="message-audio" />;
            case 'text':
            default:
                return <div>{message.content}</div>;
        }
    };

    return (
        <div className={`message ${isOwn ? 'sent' : 'received'}`}>
            <div className="message-bubble">
                {renderContent()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: isOwn ? 'flex-end' : 'flex-start' }}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
}

export default MessageItem;
