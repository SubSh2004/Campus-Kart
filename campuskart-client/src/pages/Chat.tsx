import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { SOCKET_URL } from '../config/api';

interface User {
  _id: string;
  username: string;
  email: string;
  hostel: string;
}

interface Message {
  _id?: string;
  message: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  createdAt?: string;
  read?: boolean;
}

interface Chat {
  _id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  otherUser: User;
  unreadCount: number;
}

export default function Chat() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [view, setView] = useState<'chats' | 'users'>('chats');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket and fetch data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/login');
      return;
    }

    setCurrentUserId(userId);

    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Initialize socket
    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      newSocket.emit('userJoin', userId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected');
      setIsConnected(false);
    });

    // Listen for new messages
    newSocket.on('newPrivateMessage', (message: Message) => {
      // Only add if not already in the list (prevent duplicates)
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      // Update chat list
      fetchChats();
    });

    // Listen for message sent confirmation (from server)
    newSocket.on('messageSent', (message: Message) => {
      // Update the temporary message with the server response
      setMessages(prev => 
        prev.map(m => 
          m._id?.toString().startsWith('temp-') && m.message === message.message
            ? message
            : m
        )
      );
    });

    setSocket(newSocket);

    // Fetch initial data
    fetchUsers();
    fetchChats();

    return () => {
      newSocket.close();
    };
  }, [navigate]);

  // Handle selected chat from navigation state
  useEffect(() => {
    const selectedChatId = location.state?.selectedChatId;
    if (selectedChatId && chats.length > 0) {
      const chat = chats.find(c => c._id === selectedChatId);
      if (chat) {
        openChat(chat);
      }
    }
  }, [location.state, chats]);

  const fetchUsers = async (search = '') => {
    try {
      const response = await axios.get(`/api/chat/users?search=${encodeURIComponent(search)}`);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Search users when search query changes
  useEffect(() => {
    if (view === 'users') {
      const timer = setTimeout(() => {
        fetchUsers(searchQuery);
      }, 300); // Debounce 300ms
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery, view]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat/chats');
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const startChat = async (user: User) => {
    try {
      // Get or create chat
      const response = await axios.get(`/api/chat/chat/${user._id}`);
      if (response.data.success) {
        const chat = response.data.chat;
        setSelectedChat({ ...chat, otherUser: user, unreadCount: 0 });
        setSelectedUser(user);
        setView('chats');
        fetchMessages(chat._id);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await axios.get(`/api/chat/messages/${chatId}`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !selectedUser || isSending) return;

    const tempId = `temp-${Date.now()}-${messageIdRef.current++}`;
    const messageText = messageInput.trim();
    
    // Optimistically add message to UI immediately
    const optimisticMessage: Message = {
      _id: tempId,
      message: messageText,
      senderId: currentUserId,
      senderName: 'You',
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setMessageInput('');
    setIsSending(true);

    const messageData = {
      chatId: selectedChat._id,
      receiverId: selectedUser._id,
      senderId: currentUserId,
      senderName: 'You',
      message: messageText
    };

    try {
      // Only emit via socket - let server handle database save
      socket?.emit('sendPrivateMessage', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setMessageInput(messageText); // Restore message
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const openChat = (chat: Chat) => {
    setSelectedChat(chat);
    setSelectedUser(chat.otherUser);
    fetchMessages(chat._id);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center ${theme === 'dark' ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'} transition`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo-icon.svg" alt="CampusZon" className="w-8 h-8" />
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Messages</h1>
          </div>
          <div className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? '● Online' : '● Offline'}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transition-colors duration-300`} style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className={`w-80 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-r flex flex-col transition-colors duration-300`}>
              {/* View Toggle */}
              <div className="flex border-b">
                <button
                  onClick={() => setView('chats')}
                  className={`flex-1 py-3 text-sm font-medium ${
                    view === 'chats'
                      ? theme === 'dark'
                        ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400'
                        : 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  } transition-colors duration-300`}
                >
                  Chats
                </button>
                <button
                  onClick={() => setView('users')}
                  className={`flex-1 py-3 text-sm font-medium ${
                    view === 'users'
                      ? theme === 'dark'
                        ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400'
                        : 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  } transition-colors duration-300`}
                >
                  Users
                </button>
              </div>

              {/* Search Input */}
              <div className={`p-3 border-b ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                <div className="relative">
                  <input
                    type="text"
                    value={view === 'chats' ? chatSearchQuery : searchQuery}
                    onChange={(e) => view === 'chats' ? setChatSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                    placeholder={view === 'chats' ? "Search chats..." : "Search users..."}
                    className={`w-full px-4 py-2 pl-10 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-600 text-white placeholder-gray-400 border-gray-500'
                        : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-300'
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  <svg
                    className={`absolute left-3 top-2.5 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {view === 'chats' ? (
                  chats.filter(chat => 
                    chat.otherUser?.username.toLowerCase().includes(chatSearchQuery.toLowerCase())
                  ).length > 0 ? (
                    chats.filter(chat => 
                      chat.otherUser?.username.toLowerCase().includes(chatSearchQuery.toLowerCase())
                    ).map(chat => (
                      <button
                        key={chat._id}
                        onClick={() => openChat(chat)}
                        className={`w-full p-4 text-left ${
                          selectedChat?._id === chat._id
                            ? theme === 'dark'
                              ? 'bg-gray-800'
                              : 'bg-white'
                            : theme === 'dark'
                            ? 'hover:bg-gray-600'
                            : 'hover:bg-gray-100'
                        } border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-200`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {chat.otherUser?.username || 'Unknown'}
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                              {chat.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          {chat.unreadCount > 0 && (
                            <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p>{chatSearchQuery ? 'No chats found' : 'No conversations yet'}</p>
                      <p className="text-sm mt-2">{chatSearchQuery ? 'Try a different search' : 'Start chatting with users!'}</p>
                    </div>
                  )
                ) : (
                  users.map(user => (
                    <button
                      key={user._id}
                      onClick={() => startChat(user)}
                      className={`w-full p-4 text-left ${
                        theme === 'dark'
                          ? 'hover:bg-gray-600 border-gray-600'
                          : 'hover:bg-gray-100 border-gray-200'
                      } border-b transition-colors duration-200`}
                    >
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user.username}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.hostel}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-b transition-colors duration-300`}>
                    <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedUser.username}
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedUser.email}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                    {messages.length === 0 ? (
                      <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-8`}>
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isOwnMessage = msg.senderId === currentUserId;
                        const isPending = msg._id?.toString().startsWith('temp-');
                        return (
                          <div
                            key={msg._id || index}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                isOwnMessage
                                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-md'
                                  : theme === 'dark'
                                  ? 'bg-gray-700 text-white rounded-bl-md'
                                  : 'bg-gray-200 text-gray-900 rounded-bl-md'
                              } ${isPending ? 'opacity-70' : ''}`}
                            >
                              <p className="break-words">{msg.message}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <p className={`text-xs ${isOwnMessage ? 'text-indigo-200' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </p>
                                {isPending && isOwnMessage && (
                                  <svg className="w-3 h-3 animate-spin text-indigo-200" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-t transition-colors duration-300`}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Type a message..."
                        disabled={isSending}
                        className={`flex-1 px-4 py-3 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-600 text-white placeholder-gray-400 border-gray-500'
                            : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                        } border focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!messageInput.trim() || isSending}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                        {isSending ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Send
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg className={`w-20 h-20 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Select a user to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
