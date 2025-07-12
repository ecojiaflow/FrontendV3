// 📁 src/components/chat/AIChat.tsx

import React, { useState } from 'react';
import { useChat, ChatMessage } from '../../hooks/useChat';
import { Send } from 'lucide-react';

interface Props {
  context?: any;
}

export const AIChat: React.FC<Props> = ({ context }) => {
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage, error, messagesRemaining, clearMessages } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input, context);
    setInput('');
  };

  return (
    <div className="bg-white border rounded-xl shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">💬 Assistant IA Scientifique</h2>
        <button
          onClick={clearMessages}
          className="text-xs text-gray-500 hover:underline"
        >
          Réinitialiser
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto text-sm">
        {messages.map((msg: ChatMessage, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg whitespace-pre-line ${
              msg.role === 'user'
                ? 'bg-blue-50 text-blue-900 self-end text-right'
                : 'bg-emerald-50 text-emerald-900'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isTyping && <p className="text-xs text-gray-400 italic">L'IA réfléchit...</p>}
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Posez votre question scientifique..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || messagesRemaining <= 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-2 text-xs text-gray-500">
        Messages restants : {messagesRemaining}/5
      </div>
    </div>
  );
};
