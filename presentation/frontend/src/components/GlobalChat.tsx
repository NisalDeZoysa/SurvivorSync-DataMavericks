
// import React, { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { MessageCircle, X, Send } from 'lucide-react';
// import { useAuth } from '@/context/AuthContext';
// import { UserRole } from '@/types';

// interface ChatMessage {
//   id: string;
//   message: string;
//   userName: string;
//   timestamp: string;
//   userId: string;
// }

// const GlobalChat: React.FC = () => {
//   const { currentUser } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState<ChatMessage[]>([
//     {
//       id: '1',
//       message: 'Welcome to the global chat! This is where all users can communicate.',
//       userName: 'System',
//       timestamp: new Date().toLocaleTimeString(),
//       userId: 'system'
//     }
//   ]);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Only show for regular users - moved after all hooks
//   if (
//     !currentUser ||
//     (currentUser.role !== UserRole.USER && currentUser.role !== UserRole.VOLUNTEERS && currentUser.role !== UserRole.FIRST_RESPONDER)
//   ) {
//     return null;
//   }

//   const handleSendMessage = () => {
//     if (message.trim() && currentUser) {
//       const newMessage: ChatMessage = {
//         id: Date.now().toString(),
//         message: message.trim(),
//         userName: currentUser.name,
//         timestamp: new Date().toLocaleTimeString(),
//         userId: currentUser.id
//       };
      
//       setMessages(prev => [...prev, newMessage]);
//       setMessage('');
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <>
//       {/* Chat Toggle Button */}
//       <Button
//         onClick={() => setIsOpen(true)}
//         className={`fixed bottom-6 left-6 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg z-40 transition-transform ${
//           isOpen ? 'scale-0' : 'scale-100'
//         }`}
//         size="icon"
//       >
//         <MessageCircle className="h-6 w-6" />
//       </Button>

//       {/* Chat Window */}
//       <div
//         className={`fixed bottom-0 left-0 w-full md:w-96 h-[500px] bg-white shadow-2xl border-t border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
//           isOpen ? 'translate-y-0' : 'translate-y-full'
//         }`}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b bg-safety-50">
//           <div className="flex items-center gap-2">
//             <MessageCircle className="h-5 w-5 text-safety-600" />
//             <h3 className="font-semibold text-gray-900">Global Chat</h3>
//           </div>
//           <Button
//             onClick={() => setIsOpen(false)}
//             variant="ghost"
//             size="icon"
//             className="h-8 w-8"
//           >
//             <X className="h-4 w-4" />
//           </Button>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 h-[380px] space-y-3">
//           {messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={`${
//                 msg.userId === currentUser?.id
//                   ? 'ml-8 text-right'
//                   : 'mr-8 text-left'
//               }`}
//             >
//               <div
//                 className={`inline-block max-w-[80%] p-3 rounded-lg ${
//                   msg.userId === currentUser?.id
//                     ? 'bg-safety-500 text-white'
//                     : msg.userId === 'system'
//                     ? 'bg-gray-100 text-gray-800'
//                     : 'bg-gray-200 text-gray-800'
//                 }`}
//               >
//                 <div className="text-sm break-words">{msg.message}</div>
//                 <div
//                   className={`text-xs mt-1 ${
//                     msg.userId === currentUser?.id
//                       ? 'text-safety-100'
//                       : 'text-gray-500'
//                   }`}
//                 >
//                   {msg.userName} • {msg.timestamp}
//                 </div>
//               </div>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input */}
//         <div className="p-4 border-t bg-white">
//           <div className="flex gap-2">
//             <Input
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Type your message..."
//               className="flex-1"
//               maxLength={500}
//             />
//             <Button
//               onClick={handleSendMessage}
//               disabled={!message.trim()}
//               size="icon"
//               className="bg-safety-500 hover:bg-safety-600"
//             >
//               <Send className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Backdrop */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/20 z-40 md:hidden"
//           onClick={() => setIsOpen(false)}
//         />
//       )}
//     </>
//   );
// };

// export default GlobalChat;

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  message: string;
  userName: string;
  timestamp: string;
  userId: string;
}

const GlobalChat: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Use Vite's environment variable syntax
    const socketUrl = import.meta.env.VITE_API_BASE_URL;
    
    // Connect to Socket.IO server
    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    // Initial connection handler
    socketRef.current.on('connect', () => {
      console.log('Connected to chat server');
    });

    // Receive chat history
    socketRef.current.on('chatHistory', (history: ChatMessage[]) => {
      setMessages(history);
    });

    // Receive new messages
    socketRef.current.on('newMessage', (newMessage: ChatMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  if (
    !currentUser ||
    (currentUser.role !== UserRole.USER && 
     currentUser.role !== UserRole.VOLUNTEERS && 
     currentUser.role !== UserRole.FIRST_RESPONDER)
  ) {
    return null;
  }

  const handleSendMessage = () => {
    if (message.trim() && currentUser && socketRef.current) {
      const newMessage = {
        id: Date.now().toString(),
        message: message.trim(),
        userName: currentUser.name,
        userId: currentUser.id,
      };

      // Send through socket
      socketRef.current.emit('newMessage', newMessage);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg z-40 transition-transform ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-0 left-0 w-full md:w-96 h-[500px] bg-white shadow-2xl border-t border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-safety-50">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-safety-600" />
            <h3 className="font-semibold text-gray-900">Global Chat</h3>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 h-[380px] space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${
                msg.userId === currentUser?.id
                  ? 'ml-8 text-right'
                  : 'mr-8 text-left'
              }`}
            >
              <div
                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  msg.userId === currentUser?.id
                    ? 'bg-safety-500 text-white'
                    : msg.userId === 'system'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-sm break-words">{msg.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.userId === currentUser?.id
                      ? 'text-safety-100'
                      : 'text-gray-500'
                  }`}
                >
                  {msg.userName} • {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              maxLength={500}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              size="icon"
              className="bg-safety-500 hover:bg-safety-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
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

export default GlobalChat;