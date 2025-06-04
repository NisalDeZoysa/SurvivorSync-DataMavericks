import React, { useState } from 'react';
import { Bot, MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}


const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Emergency Aid Assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);

  // const [isLoading, setIsLoading] = useState(false);
  // const messagesEndRef = useRef<HTMLDivElement>(null);

  // // Auto-scroll to bottom when messages change
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };


  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "I understand you need assistance. For immediate emergencies, please call emergency services. For non-urgent matters, I'm here to help guide you through our platform.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };


  //   const handleSendMessage = async () => {
  //   if (!message.trim() || isLoading) return;

  //   // Add user message to chat
  //   const userMessage: Message = {
  //     id: Date.now(),
  //     text: message,
  //     isBot: false,
  //     timestamp: new Date()
  //   };

  //   setMessages(prev => [...prev, userMessage]);
  //   setMessage('');
  //   setIsLoading(true);

  //   try {
  //     // Send message to chatbot backend
  //     const response = await axios.post('http://localhost:5003/chat', {
  //       message: message,
  //       history: messages.slice(-10).map(m => ({
  //         role: m.isBot ? 'assistant' : 'user',
  //         content: m.text
  //       }))
  //     }, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     // Add bot response to chat
  //     const botResponse: Message = {
  //       id: Date.now() + 1,
  //       text: response.data.response,
  //       isBot: true,
  //       timestamp: new Date()
  //     };

  //     setMessages(prev => [...prev, botResponse]);
  //   } catch (error) {
  //     console.error("Chatbot error:", error);
  //     const errorMessage: Message = {
  //       id: Date.now() + 1,
  //       text: "Sorry, I'm having trouble connecting. Please try again later.",
  //       isBot: true,
  //       timestamp: new Date()
  //     };
  //     setMessages(prev => [...prev, errorMessage]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            "bg-gradient-to-r from-safety-500 to-safety-600 hover:from-safety-600 hover:to-safety-700",
            "border-2 border-white shadow-xl",
            isOpen && "scale-0"
          )}
          size="icon"
        >
          <Bot className="h-6 w-6 text-white animate-pulse" />
        </Button>
        
        {/* Floating notification dot */}
        <div className={cn(
          "absolute -top-1 -right-1 h-4 w-4 bg-emergency-500 rounded-full",
          "animate-ping",
          isOpen && "hidden"
        )} />
      </div>

      {/* Chat Window */}
      <div className={cn(
        "fixed right-0 top-0 h-[90%] w-96 bg-white shadow-2xl z-50",
        "transform transition-transform duration-500 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        "border-l border-gray-200"
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-safety-500 to-safety-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Emergency Assistant</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        <div className={cn(
          "flex flex-col h-full",
          isMinimized && "hidden"
        )}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.isBot ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl shadow-sm",
                  msg.isBot 
                    ? "bg-white border border-gray-200 rounded-bl-sm" 
                    : "bg-safety-500 text-white rounded-br-sm"
                )}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={cn(
                    "text-xs mt-1 opacity-70",
                    msg.isBot ? "text-gray-500" : "text-white"
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border-gray-300 focus:border-safety-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-safety-500 hover:bg-safety-600"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              For emergencies, call emergency services immediately
            </p>
          </div>
        </div>

        {/* Minimized State */}
        {isMinimized && (
          <div className="p-4 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-safety-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-600">Chat minimized</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="text-safety-600 hover:bg-safety-50"
            >
              Expand
            </Button>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default FloatingChatbot;