import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { 
  WelcomeScreen, 
  ProfileDiscovery, 
  MatchScreen, 
  ChatInterface, 
  ProfileSetup,
  UserProfile,
  SettingsScreen,
  MainDashboard,
  AICompanionChat,
  DiaryInterface,
  MoodTracker,
  AICompanionSelector,
  AICompanionCreator,
  AICompanionManager,
  PaywallScreen,
  SubscriptionScreen,
  VoiceChatInterface,
  CreditsStore
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

  // Listen for force match demo events
  useEffect(() => {
    const handleForceMatch = (event) => {
      const newMatch = event.detail;
      setMatches(prev => [...prev, newMatch]);
      setCurrentMatch(newMatch);
      setCurrentScreen('match');
    };

    window.addEventListener('forceMatch', handleForceMatch);
    return () => window.removeEventListener('forceMatch', handleForceMatch);
  }, []);

  // Check if user can perform action based on subscription
  const canPerformAction = (actionType) => {
    switch (actionType) {
      case 'message':
        return subscription.tier !== 'free' || subscription.credits > 0;
      case 'voice_chat':
        return subscription.tier !== 'free' && subscription.voiceMinutes > 0;
      case 'unlimited_swipes':
        return subscription.tier === 'platinum';
      case 'premium_companions':
        return subscription.tier !== 'free';
      default:
        return true;
    }
  };

  const useCredit = () => {
    if (subscription.tier === 'free' && subscription.credits > 0) {
      setSubscription(prev => ({ ...prev, credits: prev.credits - 1 }));
      return true;
    }
    return subscription.tier !== 'free';
  };

  const handleSwipe = (profileId, direction) => {
    const profile = profiles.find(p => p.id === profileId);
    
    if (direction === 'right') {
      setLikedProfiles(prev => [...prev, profileId]);
      
      // Check subscription limits
      if (subscription.tier === 'free' && likedProfiles.length >= 5) {
        setCurrentScreen('paywall');
        return;
      }
      
      // Simulate match (30% chance for premium, 15% for free)
      const matchChance = subscription.tier !== 'free' ? 0.7 : 0.85;
      if (Math.random() > matchChance) {
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
    paywall: (
      <PaywallScreen 
        subscription={subscription}
        onUpgrade={(newSub) => {
          setSubscription(newSub);
          setCurrentScreen('dashboard');
        }}
        onBack={() => setCurrentScreen('dashboard')}
      />
    ),
    subscription: (
      <SubscriptionScreen
        subscription={subscription}
        onSubscribe={(newSub) => {
          setSubscription(newSub);
          setCurrentScreen('dashboard');
        }}
        onBack={() => setCurrentScreen('dashboard')}
      />
    ),
    credits: (
      <CreditsStore
        subscription={subscription}
        onPurchase={(updatedSub) => {
          setSubscription(updatedSub);
          setCurrentScreen('dashboard');
        }}
        onBack={() => setCurrentScreen('dashboard')}
      />
    ),
    aiSelector: (
      <AICompanionSelector 
        companions={aiCompanions}
        subscription={subscription}
        onSelectCompanion={(companion) => {
          if (companion.isPremium && !canPerformAction('premium_companions')) {
            setCurrentScreen('paywall');
            return;
          }
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
        subscription={subscription}
        onComplete={(newCompanion) => {
          if (newCompanion.isPremium && !canPerformAction('premium_companions')) {
            setCurrentScreen('paywall');
            return;
          }
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
        subscription={subscription}
        onSelectCompanion={(companion) => {
          if (companion.isPremium && !canPerformAction('premium_companions')) {
            setCurrentScreen('paywall');
            return;
          }
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
        profiles={profiles}
        currentIndex={currentProfileIndex}
        subscription={subscription}
        onSwipe={handleSwipe}
        onProfile={() => setCurrentScreen('profile')}
        onMatches={() => setCurrentScreen('matches')}
        onSettings={() => setCurrentScreen('settings')}
        onUpgradeRequired={() => setCurrentScreen('paywall')}
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
        subscription={subscription}
        onBack={() => setCurrentScreen('dashboard')}
        onSelectMatch={(match) => setCurrentMatch(match)}
        onUpgradeRequired={() => setCurrentScreen('paywall')}
        useCredit={useCredit}
      />
    ),
    aiChat: (
      <AICompanionChat
        aiCompanion={activeCompanion}
        user={user}
        subscription={subscription}
        onBack={() => setCurrentScreen('dashboard')}
        onVoiceChat={() => setCurrentScreen('voiceChat')}
        onUpgradeRequired={() => setCurrentScreen('paywall')}
        useCredit={useCredit}
      />
    ),
    voiceChat: (
      <VoiceChatInterface
        aiCompanion={activeCompanion}
        user={user}
        subscription={subscription}
        onBack={() => setCurrentScreen('aiChat')}
        onUpgradeRequired={() => setCurrentScreen('paywall')}
        onUseVoiceMinute={() => {
          setSubscription(prev => ({ 
            ...prev, 
            voiceMinutes: Math.max(0, prev.voiceMinutes - 1) 
          }));
        }}
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
    ),
    matches: (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6 pt-12">
            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Matches</h1>
            <div className="w-10"></div>
          </div>
          
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💫</div>
                <h3 className="text-xl font-semibold text-white mb-2">No matches yet</h3>
                <p className="text-gray-300">Keep swiping to find your perfect connection!</p>
              </div>
            ) : (
              matches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 cursor-pointer"
                  onClick={() => handleStartChat(match)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={match.profile.photos[0]}
                      alt={match.profile.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{match.profile.name}</h3>
                      <p className="text-gray-300 text-sm">
                        {match.lastMessage ? match.lastMessage : "Start your conversation"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        {new Date(match.matchedAt).toLocaleDateString()}
                      </div>
                      {match.unread && (
                        <div className="w-3 h-3 bg-purple-500 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    ),
    profile: (
      <UserProfile 
        user={user}
        onBack={() => setCurrentScreen('dashboard')}
        onEdit={() => setCurrentScreen('setup')}
      />
    ),
    settings: (
      <SettingsScreen 
        user={user}
        subscription={subscription}
        onBack={() => setCurrentScreen('dashboard')}
        onNavigate={setCurrentScreen}
        onLogout={() => {
          setUser(null);
          setCurrentScreen('welcome');
        }}
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