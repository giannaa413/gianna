import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

// Welcome Screen Component
export const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: 0 
              }}
              animate={{ 
                y: [Math.random() * window.innerHeight, -100],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2 
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo/Icon */}
          <motion.div 
            className="mb-8"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-8xl mb-4">💫</div>
          </motion.div>

          {/* Main heading */}
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Find Your
            <motion.span 
              className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Soul Connection
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg text-gray-200 mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Where meaningful connections bloom through 
            <span className="text-purple-300 font-medium"> deep conversations</span> and 
            <span className="text-pink-300 font-medium"> authentic moments</span>
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-8 rounded-2xl text-lg shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            Begin Your Journey
          </motion.button>

          <motion.p 
            className="text-sm text-gray-400 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            Join thousands finding love through deeper connections
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

// Profile Setup Component
export const ProfileSetup = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    interests: [],
    photos: [],
    lookingFor: '',
    occupation: '',
    education: ''
  });

  const availableInterests = [
    'Art', 'Travel', 'Photography', 'Yoga', 'Music', 'Reading', 'Cooking', 
    'Hiking', 'Dancing', 'Writing', 'Tech', 'Fitness', 'Movies', 'Gaming',
    'Fashion', 'Meditation', 'Sports', 'Coffee', 'Wine', 'Adventure'
  ];

  const mockPhotos = [
    "https://images.pexels.com/photos/3951883/pexels-photo-3951883.jpeg",
    "https://images.unsplash.com/photo-1554774853-b415df9eeb92",
    "https://images.pexels.com/photos/15647646/pexels-photo-15647646.jpeg"
  ];

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest].slice(0, 5)
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Auto-assign photos for demo
      const finalData = {
        ...formData,
        photos: mockPhotos
      };
      onComplete(finalData);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.name && formData.age;
      case 2: return formData.bio.length >= 20;
      case 3: return formData.interests.length >= 3;
      case 4: return formData.lookingFor && formData.occupation;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-white text-lg font-semibold mb-2">What's your name?</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-gray-300 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="block text-white text-lg font-semibold mb-2">How old are you?</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-gray-300 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Your age"
                min="18"
                max="100"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-white text-lg font-semibold mb-2">Tell us about yourself</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-gray-300 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 h-32 resize-none"
                placeholder="Share what makes you unique, your passions, and what you're looking for in a connection..."
                maxLength="300"
              />
              <div className="text-right text-gray-400 text-sm mt-1">
                {formData.bio.length}/300 characters
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-white text-lg font-semibold mb-4">What are your interests?</label>
              <p className="text-gray-300 mb-4">Select at least 3 that represent you</p>
              <div className="grid grid-cols-2 gap-3">
                {availableInterests.map((interest) => (
                  <motion.button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {interest}
                  </motion.button>
                ))}
              </div>
              <div className="text-center text-gray-400 text-sm mt-4">
                {formData.interests.length}/5 selected
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-white text-lg font-semibold mb-2">What's your occupation?</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-gray-300 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Your job title or profession"
              />
            </div>
            <div>
              <label className="block text-white text-lg font-semibold mb-2">What are you looking for?</label>
              <select
                value={formData.lookingFor}
                onChange={(e) => setFormData(prev => ({ ...prev, lookingFor: e.target.value }))}
                className="w-full bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Select relationship type</option>
                <option value="serious">Serious relationship</option>
                <option value="casual">Casual dating</option>
                <option value="friendship">New friends</option>
                <option value="something_casual">Something casual</option>
                <option value="not_sure">Not sure yet</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 mb-6"
        >
          {renderStep()}
        </motion.div>

        {/* Navigation */}
        <div className="flex space-x-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-white/10 backdrop-blur-md text-white font-semibold py-3 px-6 rounded-xl border border-white/20"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all ${
              isStepValid()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === 4 ? 'Complete Profile' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Profile Discovery Component (Tinder-style swiping)
export const ProfileDiscovery = ({ user, profiles, currentIndex, onSwipe, onProfile, onMatches, onSettings }) => {
  const [draggedCard, setDraggedCard] = useState(null);
  const currentProfile = profiles[currentIndex];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Early return if no current profile
  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">You're all caught up!</h2>
          <p className="text-gray-300">Check back later for more profiles</p>
        </div>
      </div>
    );
  }

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > 100 || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 'right' : 'left';
      onSwipe(currentProfile.id, direction);
      x.set(0);
    } else {
      x.set(0);
    }
  };

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">You're all caught up!</h2>
          <p className="text-gray-300">Check back later for more profiles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <button onClick={onProfile} className="p-2 rounded-full bg-white/10 backdrop-blur-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Discover</h1>
          <div className="text-sm text-gray-300">{profiles.length - currentIndex} remaining</div>
        </div>
        
        <button onClick={onSettings} className="p-2 rounded-full bg-white/10 backdrop-blur-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center p-6 pb-32">
        <div className="relative w-full max-w-sm">
          {/* Background cards */}
          {profiles.slice(currentIndex + 1, currentIndex + 3).map((profile, index) => (
            <motion.div
              key={profile.id}
              className="absolute inset-0 bg-white rounded-3xl shadow-2xl"
              initial={{ scale: 0.95 - index * 0.05, y: index * 10 }}
              animate={{ scale: 0.95 - index * 0.05, y: index * 10 }}
              style={{ zIndex: -index }}
            />
          ))}

          {/* Current card */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, rotate, opacity }}
            onDragEnd={handleDragEnd}
            className="relative bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
            whileHover={{ scale: 1.02 }}
            style={{ height: '600px', zIndex: 10 }}
          >
            {/* Main photo */}
            <div className="relative h-2/3">
              <img
                src={currentProfile.photos[0]}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Verification badge */}
              {currentProfile.verified && (
                <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-2">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Like/Pass indicators */}
              <motion.div
                className="absolute top-8 left-8 px-4 py-2 border-4 border-green-500 text-green-500 font-bold text-2xl rounded-xl transform -rotate-12"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: useTransform(x, [50, 150], [0, 1]).get(),
                  scale: useTransform(x, [50, 150], [0.5, 1]).get()
                }}
              >
                LIKE
              </motion.div>
              
              <motion.div
                className="absolute top-8 right-8 px-4 py-2 border-4 border-red-500 text-red-500 font-bold text-2xl rounded-xl transform rotate-12"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: useTransform(x, [-150, -50], [1, 0]).get(),
                  scale: useTransform(x, [-150, -50], [1, 0.5]).get()
                }}
              >
                PASS
              </motion.div>
            </div>

            {/* Profile info */}
            <div className="p-6 h-1/3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{currentProfile.name}</h2>
                <span className="text-xl text-gray-600">{currentProfile.age}</span>
              </div>
              
              <p className="text-gray-600 mb-3 line-clamp-2">{currentProfile.bio}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{currentProfile.occupation}</span>
                <span>{currentProfile.distance}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
                {currentProfile.interests.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    +{currentProfile.interests.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
        <motion.button
          onClick={() => onSwipe(currentProfile.id, 'left')}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        <motion.button
          onClick={onMatches}
          className="w-12 h-12 bg-purple-500 rounded-full shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>

        <motion.button
          onClick={() => onSwipe(currentProfile.id, 'right')}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

// Match Screen Component
export const MatchScreen = ({ match, onStartChat, onKeepSwiping }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center p-6"
    >
      <div className="text-center max-w-md w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-8xl mb-6"
        >
          💫
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white mb-2"
        >
          It's a Match!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-white/80 mb-8"
        >
          You and {match.profile.name} liked each other
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center space-x-4 mb-8"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
            <img
              src="https://images.pexels.com/photos/3951883/pexels-photo-3951883.jpeg"
              alt="You"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-3xl">💝</div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
            <img
              src={match.profile.photos[0]}
              alt={match.profile.name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-4"
        >
          <button
            onClick={onStartChat}
            className="w-full bg-white text-purple-600 font-bold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Start Conversation
          </button>
          
          <button
            onClick={onKeepSwiping}
            className="w-full bg-white/20 backdrop-blur-md text-white font-semibold py-4 px-8 rounded-2xl border border-white/30"
          >
            Keep Swiping
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Chat Interface Component
export const ChatInterface = ({ matches, currentMatch, onBack, onSelectMatch }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! Thanks for the match 😊",
      sender: 'them',
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: 2,
      text: "Hi! I loved your profile, especially your photos from the art gallery!",
      sender: 'me',
      timestamp: new Date(Date.now() - 1000 * 60 * 25)
    },
    {
      id: 3,
      text: "Thank you! I'm actually a curator there. Do you enjoy art?",
      sender: 'them',
      timestamp: new Date(Date.now() - 1000 * 60 * 20)
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'me',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate response
      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          text: "That sounds amazing! I'd love to hear more about that 😊",
          sender: 'them',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex">
      {/* Sidebar - Matches list */}
      <div className="w-80 bg-black/20 backdrop-blur-md border-r border-white/10 hidden md:block">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">Messages</h2>
        </div>
        <div className="overflow-y-auto">
          {matches.map((match) => (
            <motion.div
              key={match.id}
              onClick={() => onSelectMatch(match)}
              className={`p-4 cursor-pointer border-b border-white/5 hover:bg-white/5 ${
                currentMatch?.id === match.id ? 'bg-white/10' : ''
              }`}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={match.profile.photos[0]}
                  alt={match.profile.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{match.profile.name}</h3>
                  <p className="text-gray-300 text-sm truncate">
                    {match.lastMessage || "Start your conversation"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 md:hidden">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {currentMatch && (
              <>
                <img
                  src={currentMatch.profile.photos[0]}
                  alt={currentMatch.profile.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-white">{currentMatch.profile.name}</h3>
                  <p className="text-green-400 text-sm">Online</p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-white/10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-white/10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'me'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
              }`}>
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

        {/* Message input */}
        <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-white/10 backdrop-blur-md text-white placeholder-gray-300 border border-white/20 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <motion.button
              onClick={sendMessage}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Profile Component
export const UserProfile = ({ user, onBack, onEdit }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6 pt-6">
          <button onClick={onBack} className="p-2 rounded-full bg-white/10 backdrop-blur-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <button onClick={onEdit} className="p-2 rounded-full bg-white/10 backdrop-blur-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden">
          {/* Profile photo */}
          <div className="relative h-96">
            <img
              src={user?.photos?.[0] || "https://images.pexels.com/photos/3951883/pexels-photo-3951883.jpeg"}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Profile info */}
          <div className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold">{user?.name}</h2>
              <span className="text-2xl">{user?.age}</span>
            </div>

            <p className="text-gray-200 mb-6 leading-relaxed">{user?.bio}</p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Occupation</h3>
                <p className="text-gray-300">{user?.occupation}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Looking for</h3>
                <p className="text-gray-300 capitalize">{user?.lookingFor?.replace('_', ' ')}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user?.interests?.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-purple-500/30 backdrop-blur-md rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Screen Component
export const SettingsScreen = ({ user, onBack, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6 pt-6">
          <button onClick={onBack} className="p-2 rounded-full bg-white/10 backdrop-blur-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <div className="w-10"></div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Account</h2>
            <div className="space-y-3">
              <button className="w-full text-left text-white py-3 border-b border-white/10">
                Edit Profile
              </button>
              <button className="w-full text-left text-white py-3 border-b border-white/10">
                Privacy Settings
              </button>
              <button className="w-full text-left text-white py-3 border-b border-white/10">
                Notification Preferences
              </button>
              <button className="w-full text-left text-white py-3">
                Discovery Settings
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Support</h2>
            <div className="space-y-3">
              <button className="w-full text-left text-white py-3 border-b border-white/10">
                Help Center
              </button>
              <button className="w-full text-left text-white py-3 border-b border-white/10">
                Contact Us
              </button>
              <button className="w-full text-left text-white py-3">
                Safety Guidelines
              </button>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full bg-red-500/20 backdrop-blur-md text-red-400 font-semibold py-4 px-6 rounded-2xl border border-red-500/30"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};