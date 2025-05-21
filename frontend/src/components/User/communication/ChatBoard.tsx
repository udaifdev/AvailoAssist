// User-side ChatBoard Component
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, MessageCircle } from 'lucide-react';
import axiosInstance, { socket } from '../../../API/axios';
import { format } from 'date-fns';
import { RootState } from '../../../store';
import { useSelector } from 'react-redux';
import { ReactionPicker } from './ReactionPicker';

interface Reaction {
    emoji: string;
    userId: string;
    userName?: string;
}

interface Message {
    _id: string;
    sender: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'media';
    mediaUrl?: string;
    mediaType?: string;
    reactions: Reaction[];
    isRead: boolean;
}

interface ChatMessageProps {
    message: Message;
    currentUserId: string | undefined;
    onAddReaction: (messageId: string, emoji: string) => void;
}


interface UnreadIndicatorProps {
    count: number;
}

export const UnreadIndicator: React.FC<UnreadIndicatorProps> = ({ count }) => {
    if (count === 0) return null;
    return (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count > 9 ? '9+' : count}
        </div>
    );
};


export const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId, onAddReaction }) => {
    const [showReactions, setShowReactions] = useState(false);
    if (!currentUserId) return null;

    const isOwnMessage = message.sender === currentUserId; // Check if the message is sent by the logged-in user

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

    // Group reactions by emoji
    const groupedReactions = message.reactions?.reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    return (
        <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex flex-col max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} group`}>
                <div className="relative">
                    <div
                        className={`
              p-3 rounded-2xl
              ${isOwnMessage
                                ? 'bg-tealCustom text-white rounded-tr-none'
                                : 'bg-gray-200 text-gray-900 rounded-tl-none'
                            }
            `}
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        {renderContent()}

                        {/* Reaction picker button */}
                        {showReactions && (
                            <div className="absolute top-1/2 -translate-y-1/2 z-10">
                                {isOwnMessage ? (
                                    <div className="absolute right-full mr-2">
                                        <ReactionPicker onSelect={(emoji) => onAddReaction(message._id, emoji)} />
                                    </div>
                                ) : (
                                    <div className="absolute left-full ml-2">
                                        <ReactionPicker onSelect={(emoji) => onAddReaction(message._id, emoji)} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Display reactions */}
                    {Object.keys(groupedReactions).length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(groupedReactions).map(([emoji, count]) => (
                                <button
                                    key={emoji}
                                    onClick={() => onAddReaction(message._id, emoji)}
                                    className="flex items-center gap-1 bg-white rounded-full px-2 py-0.5 text-sm border hover:bg-gray-50"
                                >
                                    <span>{emoji}</span>
                                    <span className="text-gray-600">{count}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <span className="text-xs text-gray-500 mt-1">
                    {format(new Date(message.timestamp), 'h:mm a')}
                </span>
            </div>
        </div>
    );
};



interface ChatBoardProps {
    bookingId: string;
    status: string;
    workerId?: string;
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

const ChatBoard: React.FC<ChatBoardProps> = ({ bookingId, status }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userId = useSelector((state: RootState) => state.user.userDetails?.id);
    const userToken = useSelector((state: RootState) => state.user.userToken);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if ((status === 'Accepted' || true) && (isChatOpen || true)) {
            socket.emit('joinRoom', bookingId);
            socket.on('receiveMessage', (newMessage: Message) => {
                setMessages(prev => {
                    const messageExists = prev.some(msg => msg._id === newMessage._id);
                    if (!messageExists) {
                        return [...prev, newMessage];
                    }
                    return prev;
                });
            });

            fetchMessages();

            return () => {
                socket.off('receiveMessage');
                socket.emit('leaveRoom', bookingId);
            };
        }
    }, [bookingId, isChatOpen, status]);

    const fetchMessages = async () => {
        try {
            const response = await axiosInstance.get(`/chat/booking-messages/${bookingId}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                },
                withCredentials: true
            });
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };



    const sendMessage = async (messageContent?: string, messageId?: string, emoji?: string) => {
        // If no content and no media and no reaction, return
        if (!messageContent?.trim() && !selectedMedia && !messageId) return;

        try {
            let payload;
            let contentType = 'application/json';

            if (messageId && emoji) {
                // This is a reaction
                payload = JSON.stringify({ messageId, emoji, userId });
                console.log('imoji payload...........', payload)
            } else {
                const formData = new FormData();
                formData.append('bookingId', bookingId);
                formData.append('content', messageContent || '');
                if (userId) {
                    formData.append('senderId', userId);
                }
                if (selectedMedia) {
                    formData.append('media', selectedMedia);
                }
                payload = formData;
                contentType = 'multipart/form-data';
            }

            const response = await axiosInstance.post('/chat/send-message', payload, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    'Content-Type': contentType
                },
                withCredentials: true
            });

            if (messageId && emoji) {
                // Handle reaction response
                socket.emit('messageReaction', {
                    room: bookingId,
                    messageId,
                    reaction: response.data.reaction
                });

                // Update local state for reaction
                setMessages(prev => prev.map(msg =>
                    msg._id === messageId
                        ? { ...msg, reactions: response.data.reactions }
                        : msg
                ));
            } else {
                // Handle regular message response
                socket.emit('sendMessage', {
                    room: bookingId,
                    message: response.data.message
                });

                setMessages(prev => [...prev, response.data.message]);
                setNewMessage('');
                setSelectedMedia(null);
            }
        } catch (error) {
            console.error('Failed to send message/reaction', error);
        }
    };

    // Handler for adding reactions
    const handleAddReaction = (messageId: string, emoji: string) => {
        if (!userId || !userToken) return;
        sendMessage('', messageId, emoji);
    };

    // Update the socket listener for reactions
    useEffect(() => {
        socket.on('messageReactionUpdate', ({ messageId, reactions }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, reactions }
                    : msg
            ));
        });

        return () => {
            socket.off('messageReactionUpdate');
        };
    }, []);


    if (status !== 'Accepted') return null;

    if (!isChatOpen) {
        return (
            <button
                onClick={() => setIsChatOpen(true)}
                className="ml-2 text-teal-700 bg-white p-1 rounded-xl hover:text-teal-600 transition-colors"
                title="Open Chat"
            >
                <MessageCircle className="w-6 h-6 font-bold" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-100 w-96 h-[500px] rounded-lg shadow-xl flex flex-col">
                <div className="bg-tealCustom text-white p-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="font-bold">Booking Chat</h2>
                    <button onClick={() => setIsChatOpen(false)}>
                        <X className="text-white" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4">
                    {messages.map((message) => (
                        <ChatMessage
                            key={message._id}
                            message={message}
                            currentUserId={userId}
                            onAddReaction={handleAddReaction}
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
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(newMessage)}
                    />
                    <button onClick={() => sendMessage(newMessage)} className="bg-tealCustom text-white p-2 rounded-full">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBoard;