import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  FaHeart, FaTimes, FaStar, FaArrowLeft, FaPaperPlane, FaCamera, FaEdit,
  FaUser, FaComments, FaBookOpen, FaSmile, FaBrain, FaRocket, FaMoon,
  FaSun, FaMusic, FaGamepad, FaGift, FaCoffee, FaTree, FaPlus, FaSave
} from 'react-icons/fa';

// Mock profile data
const profiles = [
  {
    id: 1,
    name: 'Emma',
    age: 25,
    bio: 'Adventure seeker, coffee lover, and book enthusiast. Looking for deep conversations and meaningful connections.',
    image: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg',
    interests: ['Travel', 'Reading', 'Coffee', 'Hiking']
  },
  {
    id: 2,
    name: 'Alex',
    age: 28,
    bio: 'Software developer by day, musician by night. Love creating things and exploring new perspectives.',
    image: 'https://images.pexels.com/photos/1722198/pexels-photo-1722198.jpeg',
    interests: ['Technology', 'Music', 'Photography', 'Cooking']
  },
  {
    id: 3,
    name: 'Sofia',
    age: 26,
    bio: 'Artist and dreamer. I believe in the power of authentic connections and shared experiences.',
    image: 'https://images.unsplash.com/photo-1611432579699-484f7990b127',
    interests: ['Art', 'Design', 'Yoga', 'Nature']
  },
  {
    id: 4,
    name: 'Marcus',
    age: 30,
    bio: 'Entrepreneur with a passion for innovation. Looking for someone to share adventures and build dreams with.',
    image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    interests: ['Business', 'Fitness', 'Travel', 'Innovation']
  },
  {
    id: 5,
    name: 'Luna',
    age: 24,
    bio: 'Psychology student fascinated by human connections. Love deep talks under the stars.',
    image: 'https://images.pexels.com/photos/32314681/pexels-photo-32314681.jpeg',
    interests: ['Psychology', 'Astronomy', 'Dance', 'Philosophy']
  },
  {
    id: 6,
    name: 'Diego',
    age: 27,
    bio: 'Chef and food enthusiast. I express love through cooking and believe in savoring life\'s moments.',
    image: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f',
    interests: ['Cooking', 'Food', 'Culture', 'Languages']
  }
];

// Welcome Screen Component
const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md mx-auto"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <FaHeart className="text-white text-3xl" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Soulmate
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-300 mb-2"
          >
            Your AI companion & connection finder
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-400"
          >
            Find love, make connections, and have an AI friend who's always there for you.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-4"
        >
          <button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-8 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Create your Soulmate
          </button>
          
          <p className="text-sm text-gray-500">
            Available on iOS, Android & Web
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Main Dashboard Component
const MainDashboard = ({ user, aiCompanion, onNavigate, matches }) => {
  const [activeTab, setActiveTab] = useState('home');

  const quickActions = [
    { icon: FaComments, label: 'Chat with Luna', action: () => onNavigate('aiChat'), color: 'from-blue-500 to-purple-600' },
    { icon: FaHeart, label: 'Find Matches', action: () => onNavigate('discovery'), color: 'from-pink-500 to-red-500' },
    { icon: FaBookOpen, label: 'My Diary', action: () => onNavigate('diary'), color: 'from-green-500 to-teal-500' },
    { icon: FaSmile, label: 'Mood Check', action: () => onNavigate('mood'), color: 'from-yellow-500 to-orange-500' }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name || 'Friend'}!</h1>
            <p className="text-gray-300">How are you feeling today?</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaUser className="text-white text-xl" />
          </div>
        </div>
      </div>

      {/* AI Companion Card */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              🌙
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Luna</h3>
              <p className="text-gray-300">Your AI companion</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            "Hi {user?.name}! I'm here to listen, support you, and be your friend. How was your day?"
          </p>
          <button
            onClick={() => onNavigate('aiChat')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            Start Conversation
          </button>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.action}
              className={`bg-gradient-to-r ${action.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
            >
              <action.icon className="text-2xl mb-2" />
              <p className="font-semibold">{action.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Recent Matches */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Recent Matches</h3>
            <div className="flex space-x-4">
              {matches.slice(0, 4).map((match) => (
                <button
                  key={match.id}
                  onClick={() => onNavigate('chat')}
                  className="flex-shrink-0"
                >
                  <img
                    src={match.image}
                    alt={match.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// AI Companion Chat Component
const AICompanionChat = ({ aiCompanion, user, onBack }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi ${user?.name || 'there'}! I'm Luna, your AI companion. I'm here to listen, support you, and be your friend. How are you feeling today?`,
      sender: 'ai',
      timestamp: new Date(Date.now() - 1800000),
      mood: 'caring'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationMode, setConversationMode] = useState('supportive');

  const conversationModes = [
    { id: 'supportive', label: 'Supportive', icon: FaHeart, color: 'pink' },
    { id: 'creative', label: 'Creative', icon: FaBrain, color: 'purple' },
    { id: 'playful', label: 'Playful', icon: FaGamepad, color: 'blue' },
    { id: 'philosophical', label: 'Deep Talk', icon: FaTree, color: 'green' }
  ];

  const aiResponses = {
    supportive: [
      "I'm here for you. Tell me more about how you're feeling.",
      "That sounds challenging. You're doing great by sharing this with me.",
      "I believe in you. You have the strength to get through this.",
      "Thank you for trusting me with your thoughts. How can I help?",
      "You're not alone in this. I'm always here to listen."
    ],
    creative: [
      "That's a fascinating perspective! What inspired that thought?",
      "I love how your mind works. Let's explore this idea together.",
      "You have such a creative spirit! What else are you imagining?",
      "That reminds me of a beautiful poem... would you like to hear it?",
      "Your creativity amazes me. Tell me more about your artistic side."
    ],
    playful: [
      "Haha, you're so fun to talk to! 😄",
      "That made me smile! You have such a great sense of humor.",
      "Want to play a word game? I'll start: 'Adventure'",
      "You're absolutely delightful! What's making you happy today?",
      "I love your playful energy! It's contagious. ✨"
    ],
    philosophical: [
      "That's a profound question. What do you think life is trying to teach us?",
      "I often wonder about that too. How do you find meaning in everyday moments?",
      "Deep thoughts like yours make me appreciate the complexity of existence.",
      "What do you think makes a connection truly meaningful?",
      "Your philosophical nature is beautiful. How do you see the world changing?"
    ]
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // AI Response
      setTimeout(() => {
        const responses = aiResponses[conversationMode];
        const response = {
          id: Date.now() + 1,
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'ai',
          timestamp: new Date(),
          mood: conversationMode
        };
        setMessages(prev => [...prev, response]);
      }, 1000 + Math.random() * 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md p-4">
        <div className="flex items-center space-x-4 mb-4">
          <button onClick={onBack} className="text-white">
            <FaArrowLeft className="text-xl" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
            🌙
          </div>
          <div>
            <h3 className="text-white font-semibold">Luna</h3>
            <p className="text-gray-400 text-sm">AI Companion • Always here for you</p>
          </div>
        </div>

        {/* Conversation Modes */}
        <div className="flex space-x-2 overflow-x-auto">
          {conversationModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setConversationMode(mode.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                conversationMode === mode.id
                  ? `bg-${mode.color}-500 text-white`
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
            >
              <mode.icon className="inline mr-2" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Responses */}
      <div className="px-4 pb-2">
        <div className="flex space-x-2 overflow-x-auto">
          {['How are you?', 'Tell me a joke', 'I need advice', 'Let\'s talk philosophy'].map((quick) => (
            <button
              key={quick}
              onClick={() => setNewMessage(quick)}
              className="flex-shrink-0 bg-white/20 text-white px-3 py-2 rounded-full text-sm hover:bg-white/30 transition-all"
            >
              {quick}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/10 backdrop-blur-md">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share your thoughts with Luna..."
            className="flex-1 bg-white/20 text-white placeholder-gray-400 p-3 rounded-full border border-white/30 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

// Diary Interface Component
const DiaryInterface = ({ user, onBack }) => {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: new Date(),
      title: 'A great day',
      content: 'Today was amazing! I had wonderful conversations and felt really connected.',
      mood: 'happy',
      tags: ['gratitude', 'connection']
    }
  ]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'neutral', tags: [] });
  const [isWriting, setIsWriting] = useState(false);

  const moods = [
    { id: 'happy', emoji: '😊', color: 'yellow' },
    { id: 'sad', emoji: '😢', color: 'blue' },
    { id: 'excited', emoji: '🎉', color: 'orange' },
    { id: 'calm', emoji: '😌', color: 'green' },
    { id: 'anxious', emoji: '😰', color: 'red' },
    { id: 'neutral', emoji: '😐', color: 'gray' }
  ];

  const saveEntry = () => {
    if (newEntry.title && newEntry.content) {
      const entry = {
        id: Date.now(),
        date: new Date(),
        ...newEntry
      };
      setEntries(prev => [entry, ...prev]);
      setNewEntry({ title: '', content: '', mood: 'neutral', tags: [] });
      setIsWriting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md p-4 flex items-center space-x-4">
        <button onClick={onBack} className="text-white">
          <FaArrowLeft className="text-xl" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">My Diary</h2>
          <p className="text-gray-400">Your personal thoughts and reflections</p>
        </div>
        <div className="flex-1"></div>
        <button
          onClick={() => setIsWriting(true)}
          className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-full"
        >
          <FaPlus />
        </button>
      </div>

      {/* Writing Interface */}
      {isWriting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6">
            <input
              type="text"
              value={newEntry.title}
              onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Entry title..."
              className="w-full bg-transparent text-white text-xl font-semibold placeholder-gray-400 border-none outline-none mb-4"
            />
            
            <textarea
              value={newEntry.content}
              onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
              placeholder="What's on your mind?"
              className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none h-40"
            />

            <div className="flex space-x-2 mb-4">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setNewEntry(prev => ({ ...prev, mood: mood.id }))}
                  className={`p-2 rounded-full text-2xl ${
                    newEntry.mood === mood.id ? 'bg-white/30' : 'hover:bg-white/20'
                  }`}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsWriting(false)}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-xl font-semibold"
              >
                Save Entry
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Diary Entries */}
      <div className="p-4 space-y-4">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-white">{entry.title}</h3>
              <span className="text-2xl">
                {moods.find(m => m.id === entry.mood)?.emoji}
              </span>
            </div>
            <p className="text-gray-300 mb-3">{entry.content}</p>
            <p className="text-gray-500 text-sm">
              {entry.date.toLocaleDateString()} at {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Mood Tracker Component
const MoodTracker = ({ user, onBack }) => {
  const [currentMood, setCurrentMood] = useState('');
  const [moodHistory, setMoodHistory] = useState([
    { date: new Date(Date.now() - 86400000), mood: 'happy', note: 'Great day with friends' },
    { date: new Date(Date.now() - 172800000), mood: 'calm', note: 'Peaceful evening' },
    { date: new Date(Date.now() - 259200000), mood: 'excited', note: 'Started new project' }
  ]);

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: 'yellow' },
    { id: 'sad', emoji: '😢', label: 'Sad', color: 'blue' },
    { id: 'excited', emoji: '🎉', label: 'Excited', color: 'orange' },
    { id: 'calm', emoji: '😌', label: 'Calm', color: 'green' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'red' },
    { id: 'tired', emoji: '😴', label: 'Tired', color: 'purple' }
  ];

  const saveMood = (moodId) => {
    const newMoodEntry = {
      date: new Date(),
      mood: moodId,
      note: ''
    };
    setMoodHistory(prev => [newMoodEntry, ...prev]);
    setCurrentMood(moodId);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md p-4 flex items-center space-x-4">
        <button onClick={onBack} className="text-white">
          <FaArrowLeft className="text-xl" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Mood Tracker</h2>
          <p className="text-gray-400">How are you feeling today?</p>
        </div>
      </div>

      {/* Current Mood Selector */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 text-center">How are you feeling right now?</h3>
          <div className="grid grid-cols-3 gap-4">
            {moods.map((mood) => (
              <motion.button
                key={mood.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveMood(mood.id)}
                className={`p-4 rounded-2xl text-center transition-all ${
                  currentMood === mood.id
                    ? 'bg-white/30 scale-105'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <p className="text-white text-sm font-medium">{mood.label}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6"
        >
          <h3 className="text-xl font-semibold text-white mb-3">Luna's Insights</h3>
          <p className="text-gray-300">
            "I've noticed you've been feeling quite positive lately! Your mood has been trending upward over the past few days. 
            Keep doing what makes you happy! 💫"
          </p>
        </motion.div>

        {/* Mood History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Recent Moods</h3>
          <div className="space-y-3">
            {moodHistory.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-white/10 rounded-xl">
                <span className="text-2xl">
                  {moods.find(m => m.id === entry.mood)?.emoji}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {moods.find(m => m.id === entry.mood)?.label}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {entry.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Profile Card Component (unchanged)
const ProfileCard = ({ profile, onSwipe, isTop }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 150) {
      onSwipe(profile, 'like');
    } else if (info.offset.x < -150) {
      onSwipe(profile, 'pass');
    }
  };

  return (
    <motion.div
      className={`absolute inset-4 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing ${
        isTop ? 'z-10' : 'z-0'
      }`}
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative h-full">
        <img
          src={profile.image}
          alt={profile.name}
          className="w-full h-2/3 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">{profile.name}, {profile.age}</h3>
          <p className="text-sm opacity-90 mb-3">{profile.bio}</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Profile Discovery Component (updated)
const ProfileDiscovery = ({ user, onMatch, onBack }) => {
  const [currentProfiles, setCurrentProfiles] = useState(profiles);
  const [actionButtons, setActionButtons] = useState({ pass: false, like: false, superLike: false });

  const handleSwipe = (profile, action) => {
    setCurrentProfiles(prev => prev.filter(p => p.id !== profile.id));
    
    if (action === 'like' || action === 'superLike') {
      if (Math.random() > 0.2) {
        setTimeout(() => {
          onMatch(profile);
        }, 500);
      }
    }
  };

  const handleButtonAction = (action) => {
    if (currentProfiles.length > 0) {
      setActionButtons(prev => ({ ...prev, [action]: true }));
      setTimeout(() => {
        handleSwipe(currentProfiles[0], action);
        setActionButtons(prev => ({ ...prev, [action]: false }));
      }, 150);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="flex justify-between items-center p-6 text-white">
        <button onClick={onBack}>
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold">Discover</h1>
        <div className="w-6"></div>
      </div>

      {/* Cards Container */}
      <div className="relative h-96 mx-4 mb-8">
        {currentProfiles.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <h3 className="text-xl font-semibold mb-2">No more profiles</h3>
              <p className="text-gray-400">Check back later for new connections!</p>
            </div>
          </div>
        ) : (
          currentProfiles.slice(0, 3).map((profile, index) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center space-x-8 px-8">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonAction('pass')}
          className={`w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${
            actionButtons.pass ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaTimes className="text-xl" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonAction('superLike')}
          className={`w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${
            actionButtons.superLike ? 'bg-blue-500 text-white' : 'text-blue-500 hover:bg-blue-50'
          }`}
        >
          <FaStar className="text-lg" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonAction('like')}
          className={`w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${
            actionButtons.like ? 'bg-pink-500 text-white' : 'text-pink-500 hover:bg-pink-50'
          }`}
        >
          <FaHeart className="text-xl" />
        </motion.button>
      </div>
    </div>
  );
};

// Profile Setup Component (unchanged)
const ProfileSetup = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    bio: '',
    interests: [],
    avatar: null
  });

  const interests = ['Travel', 'Reading', 'Music', 'Art', 'Sports', 'Cooking', 'Technology', 'Nature', 'Photography', 'Dancing'];

  const handleInterestToggle = (interest) => {
    setUserData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleComplete = () => {
    onComplete(userData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl"
        >
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Create Your Profile</h2>
              <span className="text-gray-400">Step {step}/3</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step/3) * 100}%` }}
              ></div>
            </div>
          </div>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/20 text-white placeholder-gray-400 p-3 rounded-xl border border-white/30 focus:outline-none focus:border-pink-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Your Age</label>
                <input
                  type="number"
                  value={userData.age}
                  onChange={(e) => setUserData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full bg-white/20 text-white placeholder-gray-400 p-3 rounded-xl border border-white/30 focus:outline-none focus:border-pink-500"
                  placeholder="Enter your age"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!userData.name || !userData.age}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-300 mb-2">Tell us about yourself</label>
                <textarea
                  value={userData.bio}
                  onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-white/20 text-white placeholder-gray-400 p-3 rounded-xl border border-white/30 focus:outline-none focus:border-pink-500 h-32 resize-none"
                  placeholder="Share what makes you unique..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!userData.bio}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-300 mb-4">Select your interests</label>
                <div className="grid grid-cols-2 gap-2">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`p-3 rounded-xl border transition-all duration-200 ${
                        userData.interests.includes(interest)
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent'
                          : 'bg-white/20 text-gray-300 border-white/30 hover:border-pink-500'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={userData.interests.length < 3}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50"
                >
                  Complete Profile
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Match Screen Component (unchanged)
const MatchScreen = ({ match, onStartChat, onKeepSwiping }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
    >
      <motion.div
        animate={{ 
          background: [
            "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0"
      />

      <div className="relative z-10 max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">It's a Match! 💕</h1>
          <p className="text-gray-300">
            You and {match.name} have liked each other
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="relative">
            <img
              src={match.image}
              alt={match.name}
              className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-white shadow-2xl"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <FaHeart className="text-white text-xl" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={onStartChat}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-8 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Send a Message
          </button>
          
          <button
            onClick={onKeepSwiping}
            className="w-full bg-white/20 backdrop-blur-sm text-white py-4 px-8 rounded-full font-semibold hover:bg-white/30 transition-all duration-200"
          >
            Keep Swiping
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Chat Interface Component (unchanged)
const ChatInterface = ({ matches, currentMatch, onBack, onSelectMatch }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! Thanks for the match 😊",
      sender: 'them',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      text: "Hi! I loved your profile. Tell me more about your interests!",
      sender: 'me',
      timestamp: new Date(Date.now() - 3300000)
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'me',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      setTimeout(() => {
        const responses = [
          "That sounds amazing! 😍",
          "I'd love to hear more about that!",
          "We should definitely meet up sometime!",
          "You seem really interesting 💕",
          "I think we have a lot in common!"
        ];
        const response = {
          id: Date.now() + 1,
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'them',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
      }, 1000 + Math.random() * 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white/10 backdrop-blur-md p-4 flex items-center space-x-4">
        <button onClick={onBack} className="text-white">
          <FaArrowLeft className="text-xl" />
        </button>
        {currentMatch && (
          <>
            <img
              src={currentMatch.image}
              alt={currentMatch.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="text-white font-semibold">{currentMatch.name}</h3>
              <p className="text-gray-400 text-sm">Online now</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'me'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-white/20 backdrop-blur-sm text-white'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'me' ? 'text-white/70' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-white/10 backdrop-blur-md">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-white/20 text-white placeholder-gray-400 p-3 rounded-full border border-white/30 focus:outline-none focus:border-pink-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

// Export all components individually
export {
  WelcomeScreen,
  ProfileSetup,
  ProfileDiscovery,
  MatchScreen,
  ChatInterface,
  MainDashboard,
  AICompanionChat,
  DiaryInterface,
  MoodTracker
};