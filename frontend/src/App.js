import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { 
  WelcomeScreen, 
  ProfileDiscovery, 
  MatchScreen, 
  ChatInterface, 
  ProfileSetup 
} from './components';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);

  const screens = {
    welcome: <WelcomeScreen onGetStarted={() => setCurrentScreen('setup')} />,
    setup: <ProfileSetup onComplete={(userData) => {
      setUser(userData);
      setCurrentScreen('discovery');
    }} />,
    discovery: <ProfileDiscovery 
      user={user}
      onMatch={(matchData) => {
        setMatches(prev => [...prev, matchData]);
        setCurrentMatch(matchData);
        setCurrentScreen('match');
      }}
      onOpenChat={() => setCurrentScreen('chat')}
    />,
    match: <MatchScreen 
      match={currentMatch}
      onStartChat={() => setCurrentScreen('chat')}
      onKeepSwiping={() => setCurrentScreen('discovery')}
    />,
    chat: <ChatInterface 
      matches={matches}
      currentMatch={currentMatch}
      onBack={() => setCurrentScreen('discovery')}
      onSelectMatch={(match) => setCurrentMatch(match)}
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