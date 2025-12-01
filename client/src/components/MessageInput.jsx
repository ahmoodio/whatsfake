import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Mic, Video, X } from 'lucide-react';

function MessageInput({ onSendMessage, onUpload }) {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage('text', text);
            setText('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Determine type
        let type = 'text';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else return; // Unsupported for now

        try {
            const url = await onUpload(file);
            onSendMessage(type, url);
        } catch (err) {
            console.error("Upload failed", err);
        }

        // Reset input
        e.target.value = null;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([audioBlob], "voice-note.webm", { type: 'audio/webm' });

                try {
                    const url = await onUpload(file);
                    onSendMessage('audio', url);
                } catch (err) {
                    console.error("Audio upload failed", err);
                }

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Could not start recording", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="input-area">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,video/*"
                onChange={handleFileSelect}
            />

            <button className="icon-btn" onClick={() => fileInputRef.current.click()}>
                <ImageIcon size={24} />
            </button>

            <input
                type="text"
                className="input-field"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            {text ? (
                <button className="send-btn" onClick={handleSend}>
                    <Send size={20} />
                </button>
            ) : (
                <button
                    className="icon-btn"
                    style={{ color: isRecording ? 'red' : 'var(--text-secondary)' }}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                >
                    <Mic size={24} />
                </button>
            )}
        </div>
    );
}

export default MessageInput;
