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

  // Auto-refresh messages for real-time experience
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

  // Auto-scroll to bottom when new messages arrive
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
      // Show message details - for now just log
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
      // Start selection mode or delete single message
      setIsSelectionMode(true);
      setSelectedMessages([message.id]);
    }
  };

  const handleMouseDown = (message, event) => {
    const timeout = setTimeout(() => {
      handleLongPress(message, event);
    }, 500); // 500ms for long press
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
    // In a real app, this would call the delete API
    console.log('Deleting messages:', selectedMessages);
    exitSelectionMode();
  };

  const currentMessage = messages[currentMessageIndex];
  const currentSender = currentMessage ? getUserById(currentMessage.sender_id) : null;

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20">
          <h1 className="text-3xl font-bold text-white text-center mb-8">智能消息 AI Chat</h1>
          <form onSubmit={handleRegistration} className="space-y-6">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                手机号 Phone Number
              </label>
              <input
                type="tel"
                value={registrationData.phone}
                onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                随便说一句话 Say anything
              </label>
              <input
                type="text"
                value={registrationData.phrase}
                onChange={(e) => setRegistrationData({...registrationData, phrase: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="AI will generate your avatar and nickname"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              创建账户 Create Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-3">
                <img
                  src={`data:image/png;base64,${currentUser.avatar_base64}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-400"
                />
                <span className="font-semibold text-gray-800">{currentUser.nickname}</span>
              </div>
            )}
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoPlay 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {autoPlay ? '停止自动播放' : '开始自动播放'}
            </button>
          </div>
        </div>
      </div>

      {/* Message Display Area */}
      <div className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">暂无消息 No messages yet</p>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              发送第一条消息 Send First Message
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Single Message Display */}
            {currentMessage && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
                {/* Position 1: Avatar and User Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    onClick={() => setShowUserDetails(true)}
                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    {currentSender && (
                      <>
                        <img
                          src={`data:image/png;base64,${currentSender.avatar_base64}`}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full border-2 border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{currentSender.nickname}</p>
                          <p className="text-xs text-gray-500">{currentSender.id}</p>
                        </div>
                      </>
                    )}
                  </button>
                </div>

                {/* Position 2: Message Content */}
                <div
                  className="bg-gray-50 rounded-xl p-4 mb-4 cursor-pointer select-none message-content"
                  onClick={(e) => handleSingleClick(currentMessage, e)}
                  onDoubleClick={(e) => handleDoubleClick(currentMessage, e)}
                  onMouseDown={(e) => handleMouseDown(currentMessage, e)}
                  onMouseUp={handleMouseUp}
                  onDragStart={(e) => handleDragSelect(currentMessage)}
                >
                  <p className="text-gray-800">{currentMessage.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(currentMessage.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {currentMessage.message_type}
                    </span>
                  </div>
                </div>

                {/* Position 3: Message Icons/Attachments */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <button className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-gray-100">
                      🎤
                    </button>
                    <button className="text-gray-400 hover:text-green-500 transition-colors p-2 rounded-lg hover:bg-gray-100">
                      📷
                    </button>
                    <button className="text-gray-400 hover:text-purple-500 transition-colors p-2 rounded-lg hover:bg-gray-100">
                      📍
                    </button>
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-100">
                      🎁
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {currentMessageIndex + 1} / {messages.length}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setCurrentMessageIndex(Math.max(0, currentMessageIndex - 1))}
                disabled={currentMessageIndex === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              >
                上一条 Previous
              </button>
              <button
                onClick={() => setCurrentMessageIndex(Math.min(messages.length - 1, currentMessageIndex + 1))}
                disabled={currentMessageIndex === messages.length - 1}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              >
                下一条 Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selection Mode Controls */}
      {isSelectionMode && (
        <div className="fixed bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              已选择 {selectedMessages.length} 条消息
            </span>
            <div className="flex space-x-3">
              <button
                onClick={exitSelectionMode}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消 Cancel
              </button>
              <button
                onClick={deleteSelectedMessages}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-110 flex items-center justify-center text-2xl"
      >
        ✏️
      </button>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">发送新消息 New Message</h3>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="输入消息内容... Type your message..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消 Cancel
              </button>
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                发送 Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && currentSender && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <img
                src={`data:image/png;base64,${currentSender.avatar_base64}`}
                alt="Avatar"
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-400"
              />
              <h3 className="text-xl font-semibold mb-2">{currentSender.nickname}</h3>
              <p className="text-gray-600 text-sm mb-2">ID: {currentSender.id}</p>
              <p className="text-gray-600 text-sm">Phone: {currentSender.phone_number}</p>
            </div>
            <button
              onClick={() => setShowUserDetails(false)}
              className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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