import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MessagingApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [registrationData, setRegistrationData] = useState({ phone: '', phrase: '' });
  const [isRegistered, setIsRegistered] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [longPressTimeout, setLongPressTimeout] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const autoRefreshInterval = useRef(null);

  // Load languages on component mount
  useEffect(() => {
    loadLanguages();
  }, []);

  // Auto-refresh messages for real-time global messaging
  useEffect(() => {
    if (autoRefresh && isRegistered) {
      loadMessages(); // Initial load
      autoRefreshInterval.current = setInterval(() => {
        loadMessages();
      }, 2000); // Refresh every 2 seconds for real-time feel
    } else {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    }

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [autoRefresh, isRegistered]);

  // Auto-scroll to bottom when new messages arrive (Discord-style)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadLanguages = async () => {
    try {
      const response = await axios.get(`${API}/languages`);
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/register`, {
        phone_number: registrationData.phone,
        phrase: registrationData.phrase
      });
      setCurrentUser(response.data);
      setIsRegistered(true);
      loadMessages();
      loadUsers();
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const translateMessage = async (text, targetLang) => {
    try {
      const response = await axios.post(`${API}/translate`, {
        text: text,
        target_language: targetLang
      });
      return response.data.translated;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      await axios.post(`${API}/messages`, {
        sender_id: currentUser.id,
        content: newMessage,
        message_type: 'text'
      });
      setNewMessage('');
      setShowNewMessageModal(false);
      loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSingleClick = (message, event) => {
    event.preventDefault();
    if (isSelectionMode) {
      toggleMessageSelection(message.id);
    } else {
      // Show message details - for Discord-style, just highlight
      console.log('Viewing message:', message);
    }
  };

  const handleDoubleClick = (message, event) => {
    event.preventDefault();
    if (!isSelectionMode) {
      setNewMessage(`@${getUserById(message.sender_id)?.nickname || 'User'}: `);
      setShowNewMessageModal(true);
    }
  };

  const handleLongPress = (message, event) => {
    event.preventDefault();
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedMessages([message.id]);
    }
  };

  const handleMouseDown = (message, event) => {
    const timeout = setTimeout(() => {
      handleLongPress(message, event);
    }, 500);
    setLongPressTimeout(timeout);
  };

  const handleMouseUp = () => {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
  };

  const handleDragStart = (message, event) => {
    setIsDragging(true);
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedMessages([message.id]);
    }
  };

  const handleDragOver = (message, event) => {
    event.preventDefault();
    if (isDragging && isSelectionMode) {
      toggleMessageSelection(message.id);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedMessages([]);
  };

  const deleteSelectedMessages = () => {
    console.log('Deleting messages:', selectedMessages);
    exitSelectionMode();
  };

  // Get message type icons dynamically (Snake-like icon arrangement)
  const getMessageTypeIcons = (message) => {
    const icons = [];
    
    if (message.message_type === 'voice' || message.voice_base64) {
      icons.push({ type: 'voice', icon: '🎤', color: 'text-purple-500' });
    }
    if (message.message_type === 'image' || message.image_base64) {
      icons.push({ type: 'image', icon: '📷', color: 'text-green-500' });
    }
    if (message.message_type === 'location' || message.location_data) {
      icons.push({ type: 'location', icon: '📍', color: 'text-red-500' });
    }
    if (message.message_type === 'video' || message.video_base64) {
      icons.push({ type: 'video', icon: '🎥', color: 'text-blue-500' });
    }
    if (message.message_type === 'red_packet' || message.red_packet_data) {
      icons.push({ type: 'red_packet', icon: '🧧', color: 'text-red-600' });
    }
    
    return icons;
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,69,19,0.3)_0%,transparent_50%)] animate-pulse"></div>
        </div>
        
        {/* Snake Ring Language Selector */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-80 h-80 md:w-96 md:h-96">
            {/* Language Icons arranged in a circle (Snake-like) */}
            {languages.slice(0, 20).map((lang, index) => {
              const angle = (index * 360) / 20;
              const radius = 140;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              
              return (
                <div
                  key={lang.code}
                  className={`absolute w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all duration-300 cursor-pointer transform hover:scale-110 ${
                    selectedLanguage === lang.code 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50' 
                      : 'bg-gradient-to-r from-blue-400/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-600/50'
                  }`}
                  style={{
                    left: `calc(50% + ${x}px - 24px)`,
                    top: `calc(50% + ${y}px - 24px)`,
                    animationDelay: `${index * 0.1}s`
                  }}
                  onClick={() => setSelectedLanguage(lang.code)}
                  title={lang.name}
                >
                  {lang.code.toUpperCase()}
                </div>
              );
            })}
            
            {/* Central Registration Area */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl p-8 w-72 border border-white/30 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h1 className="text-xl font-bold text-white mb-2">全球智能消息</h1>
                  <p className="text-sm text-white/70">Global AI Chat</p>
                </div>
                
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div className="relative">
                    <input
                      type="tel"
                      value={registrationData.phone}
                      onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                      placeholder="输入手机号"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={registrationData.phrase}
                      onChange={(e) => setRegistrationData({...registrationData, phrase: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                      placeholder="AI生成头像和编码昵称"
                      required
                    />
                  </div>
                  
                  {/* Auto-play Toggle */}
                  <div className="flex items-center justify-center space-x-3 py-2">
                    <span className="text-sm text-white/70">自动播放下一条</span>
                    <button
                      type="button"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoRefresh ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoRefresh ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    进入全球聊天室
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Info Display (Top Right) */}
        {currentUser && (
          <div className="absolute top-6 right-6 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/30">
            <div className="flex items-center space-x-3">
              <img
                src={`data:image/png;base64,${currentUser.avatar_base64}`}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-white/50"
              />
              <div>
                <p className="text-white font-semibold">{currentUser.nickname}</p>
                <p className="text-white/70 text-xs">Code_{currentUser.id.slice(-4)}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom Message Preview */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/30 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">🤖</span>
              </div>
              <div>
                <p className="text-white text-sm">你好，这是一条测试信息</p>
                <p className="text-white/50 text-xs">Hello, this is a test message</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Particles Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Discord-style Header */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-3">
                <img
                  src={`data:image/png;base64,${currentUser.avatar_base64}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-400"
                />
                <div>
                  <span className="font-semibold text-white">{currentUser.nickname}</span>
                  <span className="block text-xs text-gray-400">🌍 Global Chat</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Language Selector and Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {autoRefresh ? '🔄 实时 Live' : '⏸️ 暂停 Pause'}
            </button>
          </div>
        </div>
      </div>

      {/* Discord-style Message Stream */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-2" style={{maxHeight: 'calc(100vh - 140px)'}}>
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">🌍 等待全球消息... Waiting for global messages...</p>
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                发送第一条消息 Send First Message
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message, index) => {
                const sender = getUserById(message.sender_id);
                const icons = getMessageTypeIcons(message);
                const isSelected = selectedMessages.includes(message.id);
                
                return (
                  <div
                    key={message.id}
                    className={`message-row group hover:bg-gray-800/50 rounded-lg p-3 transition-all duration-200 cursor-pointer select-none ${
                      isSelected ? 'bg-blue-900/30 border-l-4 border-blue-400' : ''
                    }`}
                    onClick={(e) => handleSingleClick(message, e)}
                    onDoubleClick={(e) => handleDoubleClick(message, e)}
                    onMouseDown={(e) => handleMouseDown(message, e)}
                    onMouseUp={handleMouseUp}
                    draggable={isSelectionMode}
                    onDragStart={(e) => handleDragStart(message, e)}
                    onDragOver={(e) => handleDragOver(message, e)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Position 1: Avatar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(sender);
                          setShowUserDetails(true);
                        }}
                        className="flex-shrink-0"
                      >
                        {sender && (
                          <img
                            src={`data:image/png;base64,${sender.avatar_base64}`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full hover:ring-2 hover:ring-blue-400 transition-all"
                          />
                        )}
                      </button>

                      {/* Message Content Area */}
                      <div className="flex-1 min-w-0">
                        {/* Username and timestamp */}
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="font-semibold text-white hover:underline cursor-pointer">
                            {sender?.nickname || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          {/* Position 3: Dynamic Icons (Snake-like arrangement) */}
                          <div className="flex space-x-1 ml-auto">
                            {icons.map((iconData, idx) => (
                              <button
                                key={`${iconData.type}-${idx}`}
                                className={`text-lg hover:scale-110 transition-transform ${iconData.color}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(`Clicked ${iconData.type} for message:`, message);
                                }}
                                title={iconData.type}
                              >
                                {iconData.icon}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Position 2: Message Content */}
                        <div className="text-gray-200 break-words">
                          {message.content}
                          
                          {/* Additional content based on message type */}
                          {message.location_data && (
                            <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
                              📍 {message.location_data.address}
                            </div>
                          )}
                          
                          {message.voice_base64 && (
                            <div className="mt-2 flex items-center space-x-2 text-purple-400">
                              <span>🎤 Voice message</span>
                            </div>
                          )}
                          
                          {message.image_base64 && (
                            <div className="mt-2 flex items-center space-x-2 text-green-400">
                              <span>📷 Image attached</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Selection Mode Controls */}
      {isSelectionMode && (
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              已选择 {selectedMessages.length} 条消息
            </span>
            <div className="flex space-x-3">
              <button
                onClick={exitSelectionMode}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                取消 Cancel
              </button>
              <button
                onClick={deleteSelectedMessages}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                删除 Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowNewMessageModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-110 flex items-center justify-center text-2xl z-50"
      >
        ✏️
      </button>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-white">🌍 发送全球消息 Send Global Message</h3>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
              placeholder="输入消息内容... Type your message..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                取消 Cancel
              </button>
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                发送 Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
            <div className="text-center">
              <img
                src={`data:image/png;base64,${selectedUser.avatar_base64}`}
                alt="Avatar"
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-400"
              />
              <h3 className="text-xl font-semibold mb-2 text-white">{selectedUser.nickname}</h3>
              <p className="text-gray-400 text-sm mb-2">ID: {selectedUser.id}</p>
              <p className="text-gray-400 text-sm">Phone: {selectedUser.phone_number}</p>
            </div>
            <button
              onClick={() => {
                setShowUserDetails(false);
                setSelectedUser(null);
              }}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              关闭 Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingApp;