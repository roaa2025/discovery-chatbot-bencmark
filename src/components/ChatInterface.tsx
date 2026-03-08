import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  threadId: number | null;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string, userId?: number, chatId?: number) => void;
  isLoading: boolean;
  error: string | null;
  threadId: number | null;
  messages: Message[];
  onNewThread: () => void;
}

export default function ChatInterface({ 
  onSendMessage, 
  isLoading, 
  error,
  threadId,
  messages,
  onNewThread
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('1');
  const [chatId, setChatId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const parsedChatId = chatId.trim() ? parseInt(chatId) : undefined;
      onSendMessage(message.trim(), parseInt(userId) || 1, parsedChatId);
      setMessage('');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>
              Discovery Chatbot
            </h1>
            {threadId && (
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                Thread ID: {threadId}
              </p>
            )}
          </div>
          {threadId && (
            <button
              onClick={onNewThread}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              New Thread
            </button>
          )}
        </div>
      </div>

      <div style={{ 
        flex: '1', 
        padding: '20px', 
        overflow: 'auto',
        backgroundColor: '#f5f5f5'
      }}>
        {messages.length === 0 && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#1976d2' }}>
              Enter your message below to interact with the discovery chatbot.
              The system will classify your intent and route to the appropriate agent.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: msg.role === 'user' ? '#1976d2' : 'white',
                color: msg.role === 'user' ? 'white' : '#333',
                border: msg.role === 'user' ? 'none' : '1px solid #e0e0e0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
              <div style={{ 
                fontSize: '11px', 
                opacity: 0.7, 
                marginTop: '6px',
                textAlign: 'right'
              }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                color: '#666',
                fontSize: '14px'
              }}
            >
              Thinking...
            </div>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ffebee', 
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#c62828'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{ 
        padding: '20px', 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: 'white'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: '1' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                User ID:
              </label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ flex: '1' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Chat ID:
              </label>
              <input
                type="number"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Optional"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: '1',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: isLoading ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading || !message.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

