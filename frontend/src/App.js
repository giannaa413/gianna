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

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [aiCompanions, setAiCompanions] = useState([
    {
      id: 1,
      name: 'Luna',
      personality: 'caring',
      avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      emoji: '🌙',
      description: 'A caring and empathetic companion who loves deep conversations',
      traits: ['Empathetic', 'Wise', 'Supportive'],
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
      isActive: false
    }
  ]);
  const [activeCompanion, setActiveCompanion] = useState(aiCompanions[0]);

  const screens = {
    welcome: <WelcomeScreen onGetStarted={() => setCurrentScreen('setup')} />,
    setup: <ProfileSetup onComplete={(userData) => {
      setUser(userData);
      setCurrentScreen('aiSelector');
    }} />,
    aiSelector: <AICompanionSelector 
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
    />,
    aiCreator: <AICompanionCreator
      onComplete={(newCompanion) => {
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
      onNavigate={setCurrentScreen}
      matches={matches}
    />,
    aiManager: <AICompanionManager
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
    />,
    discovery: <ProfileDiscovery 
      user={user}
      onMatch={(matchData) => {
        setMatches(prev => [...prev, matchData]);
        setCurrentMatch(matchData);
        setCurrentScreen('match');
      }}
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
      onBack={() => setCurrentScreen('dashboard')}
      onSelectMatch={(match) => setCurrentMatch(match)}
    />,
    aiChat: <AICompanionChat
      aiCompanion={activeCompanion}
      user={user}
      onBack={() => setCurrentScreen('dashboard')}
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