import React, { useEffect, useState } from 'react';
import { communicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { isStudent } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await communicationAPI.getMessages();
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        <div className="bg-white rounded-lg shadow">
          {messages.length > 0 ? (
            <div className="divide-y">
              {messages.map((msg) => (
                <div key={msg.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {isStudent ? `To: ${msg.receiver_name}` : `From: ${msg.sender_name}`}
                    </h3>
                    <span className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{msg.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">No messages yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
