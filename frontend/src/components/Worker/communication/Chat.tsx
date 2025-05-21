// WorkerChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, SmilePlus } from 'lucide-react';
import axiosInstance, { socket } from '../../../API/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { format } from 'date-fns';
import { ReactionPicker } from '../../User/communication/ReactionPicker';

interface Reaction {
  emoji: string;
  senderId: string;
  timestamp: Date;
}

interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'media';
  mediaUrl?: string;
  mediaType?: string;
  reactions?: Reaction[];
}

interface ChatMessageProps {
  message: Message;
  currentUserId: string;
  onReactionClick?: (messageId: string, emoji: string) => void;
}

const ReactionBubble = ({ emoji, count, isSelected, onClick }: { emoji: string; count: number; isSelected: boolean; onClick: () => void; }) => (
  <button onClick={onClick}
    className={`
    flex items-center gap-1 px-2 py-1 rounded-full text-sm
    transition-colors duration-200
    ${isSelected
        ? 'bg-tealCustom text-white'
        : 'bg-white border hover:bg-gray-50 text-gray-900'
      }
  `}
  >
    <span>{emoji}</span>
    <span className="text-xs">{count}</span>
  </button>
);


export const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId, onReactionClick }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const isOwnMessage = message.sender === currentUserId;

  const renderContent = () => {
    if (message.type === 'media' && message.mediaUrl) {
      if (message.mediaType?.startsWith('image/')) {
        return (
          <img
            src={message.mediaUrl}
            alt="Shared media"
            className="max-w-48 max-h-48 rounded-lg object-cover"
          />
        );
      }
      return (
        <div className="flex items-center bg-white bg-opacity-90 p-2 rounded-lg">
          <Paperclip className="mr-2 w-4 h-4" />
          <span className="text-sm">Attachment</span>
        </div>
      );
    }
    return <div className="whitespace-pre-wrap break-words">{message.content}</div>;
  };

  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    acc[reaction.emoji] = acc[reaction.emoji] || { count: 0, userIds: [] };
    acc[reaction.emoji].count++;
    if (reaction.senderId) acc[reaction.emoji].userIds.push(reaction.senderId);
    return acc;
  }, {} as { [key: string]: { count: number; userIds: string[] } }) || {};

  const handleReactionSelect = (emoji: string) => {
    if (onReactionClick) {
      onReactionClick(message._id, emoji);
    }
    setShowReactionPicker(false);
  };


  return (
    <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex flex-col max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className="relative">
          <div
            className={`
              p-3 rounded-2xl relative
              ${isOwnMessage
                ? 'bg-tealCustom text-white rounded-tr-none'
                : 'bg-gray-200 text-gray-900 rounded-tl-none'
              }
            `}
          >
            {renderContent()}
          </div>

          <div
            className={`
              absolute top-1/2 -translate-y-1/2
              ${isOwnMessage ? '-left-10' : '-right-10'}
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
            `}
          >
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 text-gray-500 hover:text-tealCustom"
            >
              <SmilePlus className="w-4 h-4" />
            </button>
          </div>

          {showReactionPicker && (
            <div
              className={`
                absolute top-0 z-10
                ${isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'}
              `}
            >
              <ReactionPicker onSelect={handleReactionSelect} />
            </div>
          )}
        </div>

        {Object.entries(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(groupedReactions).map(([emoji, { count, userIds }]) => (
              <button
                key={emoji}
                onClick={() => onReactionClick && onReactionClick(message._id, emoji)}
                className={`
                  flex items-center gap-1 px-2 py-0.5 rounded-full text-sm
                  ${userIds.includes(currentUserId)
                    ? 'bg-tealCustom text-white'
                    : 'bg-white border hover:bg-gray-50'}
                `}
              >
                <span>{emoji}</span>
                <span className="text-xs">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


interface ChatComponentProps {
  jobId: string;
  userId: string;
  onClose: () => void;
}

interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'media';
  mediaUrl?: string;
  mediaType?: string;
}

const WorkerChat: React.FC<ChatComponentProps> = ({ jobId, userId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const workerId = useSelector((state: RootState) => state.worker.workerDetails?.id);
  const workerToken = useSelector((state: RootState) => state.worker.workerToken);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.emit('joinRoom', jobId);
    socket.on('receiveMessage', (newMessage: Message) => {
      setMessages(prev => [...prev, newMessage]);
    });

    const fetchInitialMessages = async () => {
      try {
        const response = await axiosInstance.get(`/chat/booking-messages/${jobId}`, {
          headers: {
            Authorization: `Bearer ${workerToken}`
          },
          withCredentials: true
        });
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };

    fetchInitialMessages();

    return () => {
      socket.off('receiveMessage');
      socket.emit('leaveRoom', jobId);
    };
  }, [jobId, workerToken]);


  const handleSendMessage = async (reactionData?: { messageId: string; emoji: string }) => {
    try {
      if (reactionData) {
        // Handle reaction
        const response = await axiosInstance.post('/chat/send-message', {
          messageId: reactionData.messageId,
          emoji: reactionData.emoji,
          senderId: workerId
        }, {
          headers: {
            Authorization: `Bearer ${workerToken}`
          },
          withCredentials: true
        });

        // Update messages with new reaction
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === reactionData.messageId
              ? { ...msg, reactions: response.data.reactions }
              : msg
          )
        );

        // Emit socket event for reaction
        socket.emit('messageReaction', {
          room: jobId,
          messageId: reactionData.messageId,
          reaction: response.data.reactions
        });
      } else {
        // Handle regular message
        if (!newMessage.trim() && !selectedMedia) return;

        const formData = new FormData();
        formData.append('bookingId', jobId);
        formData.append('content', newMessage);
        if (workerId) {
          formData.append('senderId', workerId);
        }
        if (selectedMedia) {
          formData.append('media', selectedMedia);
        }

        const response = await axiosInstance.post('/chat/send-message', formData, {
          headers: {
            Authorization: `Bearer ${workerToken}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        });

        socket.emit('sendMessage', {
          room: jobId,
          message: response.data.message
        });

        setNewMessage('');
        setSelectedMedia(null);
      }
    } catch (error) {
      console.error('Failed to send message or reaction', error);
    }
  };

  const handleReactionClick = (messageId: string, emoji: string) => {
    handleSendMessage({ messageId, emoji });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white w-96 h-[500px] rounded-lg shadow-xl flex flex-col">
        <div className="bg-tealCustom text-white p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="font-bold">Job Chat</h2>
          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message._id}
              message={message}
              currentUserId={workerId || ""}
              onReactionClick={handleReactionClick}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {selectedMedia && (
          <div className="p-2 bg-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <Paperclip className="mr-2" />
              <span>{selectedMedia.name}</span>
            </div>
            <button onClick={() => setSelectedMedia(null)}>
              <X className="text-red-500" />
            </button>
          </div>
        )}

        <div className="p-4 border-t flex items-center space-x-2">
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            id="mediaUpload"
            onChange={(e) => setSelectedMedia(e.target.files?.[0] || null)}
          />
          <label htmlFor="mediaUpload">
            <Paperclip className="text-gray-500 cursor-pointer hover:text-tealCustom" />
          </label>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-grow p-2 border rounded-lg"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={() => handleSendMessage()}
            className="bg-tealCustom text-white p-2 rounded-full"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerChat;