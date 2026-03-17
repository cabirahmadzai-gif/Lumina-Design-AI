import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, GripVertical } from 'lucide-react';
import { ChatMessage, MessageRole } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  onReorderMessages?: (messages: ChatMessage[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping, onReorderMessages }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || !onReorderMessages) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newMessages = [...messages];
    const draggedMessage = newMessages[draggedIndex];
    newMessages.splice(draggedIndex, 1);
    newMessages.splice(index, 0, draggedMessage);

    onReorderMessages(newMessages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-xl" dir="rtl">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          دستیار جواهرشناس
        </h2>
        <p className="text-xs text-slate-500">پشتیبانی شده توسط هوش مصنوعی</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            draggable={!!onReorderMessages}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex flex-col ${
              msg.role === MessageRole.USER ? 'items-start' : 'items-end'
            } ${draggedIndex === index ? 'opacity-50' : 'opacity-100'} transition-all cursor-grab active:cursor-grabbing relative`}
          >
            {dragOverIndex === index && draggedIndex !== index && (
              <div className={`absolute left-0 right-0 h-1 bg-brand-400 rounded-full z-10 ${draggedIndex !== null && draggedIndex < index ? '-bottom-2' : '-top-2'}`} />
            )}
            <div className={`flex items-center gap-2 max-w-[85%] ${msg.role === MessageRole.USER ? 'flex-row' : 'flex-row-reverse'}`}>
              {onReorderMessages && (
                <div className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0">
                  <GripVertical size={16} />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === MessageRole.USER
                    ? 'bg-brand-600 text-white rounded-bl-none'
                    : 'bg-slate-100 text-slate-800 rounded-br-none border border-slate-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
            
            <span className={`text-[10px] text-slate-400 mt-1 px-1 ${onReorderMessages ? (msg.role === MessageRole.USER ? 'mr-6' : 'ml-6') : ''}`}>
              {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-end">
            <div className="bg-slate-100 rounded-2xl rounded-br-none px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="سوال خود را بپرسید..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-full pr-4 pl-12 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="absolute left-2 p-2 bg-brand-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors shadow-md transform rotate-180"
          >
            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
