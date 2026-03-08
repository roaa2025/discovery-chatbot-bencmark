import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ResponseViewer from './components/ResponseViewer';
import type { ChatRequest, ChatResponse, SavedResponse } from './types';
import { sendMessage } from './api/chatService';
import { detectBranch } from './utils/branchDetector';
import { saveResponse } from './utils/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  threadId: number | null;
}

function App() {
  const [currentResponse, setCurrentResponse] = useState<ChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (message: string, userId: number = 1, chatId?: number) => {
    setIsLoading(true);
    setError(null);
    
    const currentThreadId = threadId;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      threadId: currentThreadId,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const request: ChatRequest = {
        userId,
        message,
        threadId: currentThreadId || undefined,
        chatId: chatId || undefined,
      };
      
      const response = await sendMessage(request);
      
      const newThreadId = response.chat_id || currentThreadId;
      if (newThreadId && !threadId) {
        setThreadId(newThreadId);
      }
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message_text || 'No response',
        timestamp: new Date().toISOString(),
        threadId: newThreadId,
      };
      
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === userMessage.id && newThreadId ? { ...msg, threadId: newThreadId } : msg
        );
        return [...updated, assistantMessage];
      });
      setCurrentResponse(response);
      
      const branch = detectBranch(response);
      const savedResponse: SavedResponse = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        request,
        response,
        branch,
        outputContract: response.metadata || {},
      };
      
      saveResponse(savedResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewThread = () => {
    setThreadId(null);
    setMessages([]);
    setCurrentResponse(null);
    setError(null);
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column',
        borderRight: '1px solid #e0e0e0'
      }}>
        <ChatInterface 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          error={error}
          threadId={threadId}
          messages={messages.filter(m => m.threadId === threadId || (!threadId && !m.threadId))}
          onNewThread={handleNewThread}
        />
      </div>
      
      <div style={{ flex: '1', overflow: 'auto' }}>
        <ResponseViewer response={currentResponse} />
      </div>
    </div>
  );
}

export default App;

