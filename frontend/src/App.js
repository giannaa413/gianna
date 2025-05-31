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
  AICompanionManager,
  PaywallScreen,
  SubscriptionScreen,
  VoiceChatInterface,
  CreditsStore
} from './components';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [subscription, setSubscription] = useState({
    tier: 'free', // free, premium, platinum
    credits: 10,
    voiceMinutes: 0,
    unlimitedMessages: false,
    expiresAt: null
  });
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

  const screens = {
    welcome: <WelcomeScreen onGetStarted={() => setCurrentScreen('setup')} />,
    setup: <ProfileSetup onComplete={(userData) => {
      setUser(userData);
      setCurrentScreen('aiSelector');
    }} />,
    paywall: <PaywallScreen 
      subscription={subscription}
      onUpgrade={(newSub) => {
        setSubscription(newSub);
        setCurrentScreen('dashboard');
      }}
      onBack={() => setCurrentScreen('dashboard')}
    />,
    subscription: <SubscriptionScreen
      subscription={subscription}
      onSubscribe={(newSub) => {
        setSubscription(newSub);
        setCurrentScreen('dashboard');
      }}
      onBack={() => setCurrentScreen('dashboard')}
    />,
    credits: <CreditsStore
      subscription={subscription}
      onPurchase={(updatedSub) => {
        setSubscription(updatedSub);
        setCurrentScreen('dashboard');
      }}
      onBack={() => setCurrentScreen('dashboard')}
    />,
    aiSelector: <AICompanionSelector 
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
    />,
    aiCreator: <AICompanionCreator
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
    />,
    dashboard: <MainDashboard 
      user={user}
      aiCompanion={activeCompanion}
      subscription={subscription}
      onNavigate={setCurrentScreen}
      matches={matches}
    />,
    aiManager: <AICompanionManager
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
    />,
    discovery: <ProfileDiscovery 
      user={user}
      subscription={subscription}
      onMatch={(matchData) => {
        setMatches(prev => [...prev, matchData]);
        setCurrentMatch(matchData);
        setCurrentScreen('match');
      }}
      onUpgradeRequired={() => setCurrentScreen('paywall')}
      onBack={() => setCurrentScreen('dashboard')}
    />,
    match: <MatchScreen 
      match={currentMatch}
      onStartChat={() => setCurrentScreen('chat')}
      onKeepSwiping={() => setCurrentScreen('discovery')}
    />,
    chat: <ChatInterface 
      matches={matches}
      currentMatch={currentMatch}
      subscription={subscription}
      onBack={() => setCurrentScreen('dashboard')}
      onSelectMatch={(match) => setCurrentMatch(match)}
      onUpgradeRequired={() => setCurrentScreen('paywall')}
      useCredit={useCredit}
    />,
    aiChat: <AICompanionChat
      aiCompanion={activeCompanion}
      user={user}
      subscription={subscription}
      onBack={() => setCurrentScreen('dashboard')}
      onVoiceChat={() => setCurrentScreen('voiceChat')}
      onUpgradeRequired={() => setCurrentScreen('paywall')}
      useCredit={useCredit}
    />,
    voiceChat: <VoiceChatInterface
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
    />,
    diary: <DiaryInterface
      user={user}
      onBack={() => setCurrentScreen('dashboard')}
    />,
    mood: <MoodTracker
      user={user}
      onBack={() => setCurrentScreen('dashboard')}
    />
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {screens[currentScreen]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;