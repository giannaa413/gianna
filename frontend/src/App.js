import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { 
  WelcomeScreen, 
  ProfileDiscovery, 
  MatchScreen, 
  ChatInterface, 
  ProfileSetup,
  MainDashboard,
  AICompanionChat,
  DiaryInterface,
  MoodTracker,
  AICompanionSelector,
  AICompanionCreator,
  AICompanionManager
} from './components';

// Mock data for dating profiles
const mockProfiles = [
  {
    id: 1,
    name: "Emma",
    age: 28,
    bio: "Art curator who loves discovering hidden galleries and meaningful conversations. Looking for someone to explore the world with.",
    photos: [
      "https://images.pexels.com/photos/6484132/pexels-photo-6484132.jpeg",
      "https://images.pexels.com/photos/3951883/pexels-photo-3951883.jpeg"
    ],
    interests: ["Art", "Travel", "Photography", "Yoga"],
    distance: "2 miles away",
    occupation: "Art Curator",
    education: "NYU Art History",
    verified: true
  },
  {
    id: 2,
    name: "Marcus",
    age: 31,
    bio: "Tech entrepreneur with a passion for sustainable innovation. Believer in deep connections and authentic relationships.",
    photos: [
      "https://images.unsplash.com/photo-1554774853-b415df9eeb92",
      "https://images.pexels.com/photos/15647646/pexels-photo-15647646.jpeg"
    ],
    interests: ["Startups", "Sustainability", "Hiking", "Cooking"],
    distance: "5 miles away",
    occupation: "Entrepreneur",
    education: "Stanford MBA",
    verified: true
  },
  {
    id: 3,
    name: "Sofia",
    age: 26,
    bio: "Psychology grad student fascinated by human connections. Love deep talks under starry skies and spontaneous adventures.",
    photos: [
      "https://images.unsplash.com/photo-1507522682902-781c2e75716b",
      "https://images.pexels.com/photos/1868991/pexels-photo-1868991.jpeg"
    ],
    interests: ["Psychology", "Astronomy", "Writing", "Dancing"],
    distance: "3 miles away",
    occupation: "Graduate Student",
    education: "Columbia University",
    verified: true
  },
  {
    id: 4,
    name: "David",
    age: 29,
    bio: "Photographer capturing life's beautiful moments. Seeking someone who appreciates both quiet mornings and wild adventures.",
    photos: [
      "https://images.unsplash.com/photo-1517840933437-c41356892b35",
      "https://images.pexels.com/photos/7339183/pexels-photo-7339183.jpeg"
    ],
    interests: ["Photography", "Travel", "Coffee", "Rock Climbing"],
    distance: "4 miles away",
    occupation: "Photographer",
    education: "Art Institute",
    verified: false
  },
  {
    id: 5,
    name: "Luna",
    age: 27,
    bio: "Mindfulness coach helping others find inner peace. Love connecting with souls who value growth and authenticity.",
    photos: [
      "https://images.pexels.com/photos/5083572/pexels-photo-5083572.jpeg",
      "https://images.unsplash.com/photo-1656065469902-3e3dfac35bdc"
    ],
    interests: ["Meditation", "Wellness", "Books", "Nature"],
    distance: "6 miles away",
    occupation: "Wellness Coach",
    education: "Certified Life Coach",
    verified: true
  }
];

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState(mockProfiles);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  
  // Enhanced subscription system from GitHub code
  const [subscription, setSubscription] = useState({
    tier: 'free', // free, premium, platinum
    credits: 10,
    voiceMinutes: 0,
    unlimitedMessages: false,
    expiresAt: null
  });
  
  // AI Companions system from GitHub code
  const [aiCompanions, setAiCompanions] = useState([
    {
      id: 1,
      name: 'Luna',
      personality: 'caring',
      avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      emoji: '🌙',
      description: 'A caring and empathetic companion who loves deep conversations',
      traits: ['Empathetic', 'Wise', 'Supportive'],
      voiceEnabled: false,
      isPremium: false,
      isActive: true
    },
    {
      id: 2,
      name: 'Alex',
      personality: 'creative',
      avatar: 'https://images.pexels.com/photos/8566540/pexels-photo-8566540.jpeg',
      emoji: '🎨',
      description: 'An artistic soul who inspires creativity and imagination',
      traits: ['Creative', 'Inspiring', 'Artistic'],
      voiceEnabled: true,
      isPremium: true,
      isActive: false
    },
    {
      id: 3,
      name: 'Nova',
      personality: 'energetic',
      avatar: 'https://images.unsplash.com/photo-1643255083197-18721220670e',
      emoji: '⚡',
      description: 'An energetic companion who loves adventures and new experiences',
      traits: ['Energetic', 'Adventurous', 'Optimistic'],
      voiceEnabled: true,
      isPremium: true,
      isActive: false
    }
  ]);
  const [activeCompanion, setActiveCompanion] = useState(aiCompanions[0]);

  const handleSwipe = (profileId, direction) => {
    const profile = profiles.find(p => p.id === profileId);
    
    if (direction === 'right') {
      setLikedProfiles(prev => [...prev, profileId]);
      
      // Simulate match (30% chance)
      if (Math.random() > 0.7) {
        const newMatch = {
          id: Date.now(),
          profile: profile,
          matchedAt: new Date(),
          lastMessage: null,
          unread: false
        };
        setMatches(prev => [...prev, newMatch]);
        setCurrentMatch(newMatch);
        setTimeout(() => setCurrentScreen('match'), 500);
        return;
      }
    }
    
    // Move to next profile
    setCurrentProfileIndex(prev => prev + 1);
  };

  const handleStartChat = (match) => {
    setCurrentMatch(match);
    setCurrentScreen('chat');
  };

  const screens = {
    welcome: (
      <WelcomeScreen 
        onGetStarted={() => setCurrentScreen('setup')} 
      />
    ),
    setup: (
      <ProfileSetup 
        onComplete={(userData) => {
          setUser(userData);
          setCurrentScreen('aiSelector');
        }} 
      />
    ),
    aiSelector: (
      <AICompanionSelector 
        companions={aiCompanions}
        onSelectCompanion={(companion) => {
          setActiveCompanion(companion);
          setAiCompanions(prev => prev.map(c => ({
            ...c,
            isActive: c.id === companion.id
          })));
          setCurrentScreen('dashboard');
        }}
        onCreateNew={() => setCurrentScreen('aiCreator')}
      />
    ),
    aiCreator: (
      <AICompanionCreator
        onComplete={(newCompanion) => {
          const companionWithId = { ...newCompanion, id: Date.now(), isActive: true };
          setAiCompanions(prev => [...prev.map(c => ({ ...c, isActive: false })), companionWithId]);
          setActiveCompanion(companionWithId);
          setCurrentScreen('dashboard');
        }}
        onBack={() => setCurrentScreen('aiSelector')}
      />
    ),
    dashboard: (
      <MainDashboard 
        user={user}
        aiCompanion={activeCompanion}
        subscription={subscription}
        onNavigate={setCurrentScreen}
        matches={matches}
      />
    ),
    aiManager: (
      <AICompanionManager
        companions={aiCompanions}
        activeCompanion={activeCompanion}
        onSelectCompanion={(companion) => {
          setActiveCompanion(companion);
          setAiCompanions(prev => prev.map(c => ({
            ...c,
            isActive: c.id === companion.id
          })));
        }}
        onCreateNew={() => setCurrentScreen('aiCreator')}
        onBack={() => setCurrentScreen('dashboard')}
        onDeleteCompanion={(companionId) => {
          setAiCompanions(prev => prev.filter(c => c.id !== companionId));
          if (activeCompanion.id === companionId) {
            const remaining = aiCompanions.filter(c => c.id !== companionId);
            setActiveCompanion(remaining[0] || null);
          }
        }}
      />
    ),
    discovery: (
      <ProfileDiscovery 
        user={user}
        onMatch={handleStartChat}
        onBack={() => setCurrentScreen('dashboard')}
      />
    ),
    match: (
      <MatchScreen 
        match={currentMatch}
        onStartChat={() => setCurrentScreen('chat')}
        onKeepSwiping={() => setCurrentScreen('discovery')}
      />
    ),
    chat: (
      <ChatInterface 
        matches={matches}
        currentMatch={currentMatch}
        onBack={() => setCurrentScreen('dashboard')}
        onSelectMatch={(match) => setCurrentMatch(match)}
      />
    ),
    aiChat: (
      <AICompanionChat
        aiCompanion={activeCompanion}
        user={user}
        onBack={() => setCurrentScreen('dashboard')}
      />
    ),
    diary: (
      <DiaryInterface
        user={user}
        onBack={() => setCurrentScreen('dashboard')}
      />
    ),
    mood: (
      <MoodTracker
        user={user}
        onBack={() => setCurrentScreen('dashboard')}
      />
    )
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="min-h-screen"
        >
          {screens[currentScreen]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;