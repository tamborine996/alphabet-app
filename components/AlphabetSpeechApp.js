import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Bookmark, Check as BookmarkCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const AlphabetSpeechApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUpperCase, setIsUpperCase] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [touchTimeout, setTouchTimeout] = useState(null);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const phonicsWords = {
    'A': 'apple',
    'B': 'ball',
    'C': 'cat',
    'D': 'dog',
    'E': 'egg',
    'F': 'fish',
    'G': 'goat',
    'H': 'hat',
    'I': 'igloo',
    'J': 'jam',
    'K': 'kite',
    'L': 'lion',
    'M': 'mouse',
    'N': 'net',
    'O': 'octopus',
    'P': 'pen',
    'Q': 'queen',
    'R': 'rat',
    'S': 'sun',
    'T': 'tap',
    'U': 'umbrella',
    'V': 'van',
    'W': 'web',
    'X': 'box',
    'Y': 'yak',
    'Z': 'zip'
  };
  
  const alphabet = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    return isUpperCase ? letter : letter.toLowerCase();
  });

  const filteredIndices = showOnlyBookmarks 
    ? alphabet.map((_, index) => index).filter(index => bookmarks.has(index))
    : alphabet.map((_, index) => index);

  const currentFilteredIndex = filteredIndices.indexOf(currentIndex);

  const getModIndex = (index) => {
    const len = filteredIndices.length;
    return ((index % len) + len) % len;
  };

  const speakPhonicsWord = (letter) => {
    const word = phonicsWords[letter.toUpperCase()];
    if (word) {
      const phoneticMap = {
        'A': 'ae', 'B': 'buh', 'C': 'kuh', 'D': 'duh', 'E': 'eh',
        'F': 'fuh', 'G': 'guh', 'H': 'huh', 'I': 'ih', 'J': 'juh',
        'K': 'kuh', 'L': 'luh', 'M': 'muh', 'N': 'nuh', 'O': 'oh',
        'P': 'puh', 'Q': 'kwa', 'R': 'ruh', 'S': 'suh', 'T': 'tuh',
        'U': 'uh', 'V': 'vuh', 'W': 'wuh', 'X': 'ksuh', 'Y': 'yuh',
        'Z': 'zuh'
      };
      
      const phoneticSound = new SpeechSynthesisUtterance(phoneticMap[letter.toUpperCase()]);
      const isFor = new SpeechSynthesisUtterance(`is for ${word}`);
      
      window.speechSynthesis.cancel();
      phoneticSound.onend = () => {
        window.speechSynthesis.speak(isFor);
      };
      window.speechSynthesis.speak(phoneticSound);
    }
  };

  const getAdjacentLetters = () => {
    return {
      prev1: alphabet[filteredIndices[getModIndex(currentFilteredIndex - 1)]],
      next1: alphabet[filteredIndices[getModIndex(currentFilteredIndex + 1)]]
    };
  };

  const handlePrevious = () => {
    setCurrentIndex(filteredIndices[getModIndex(currentFilteredIndex - 1)]);
  };

  const handleNext = () => {
    setCurrentIndex(filteredIndices[getModIndex(currentFilteredIndex + 1)]);
  };

  const handleRandom = () => {
    const availableIndices = showOnlyBookmarks ? Array.from(bookmarks) : Array.from(Array(26).keys());
    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setCurrentIndex(randomIndex);
    }
  };

  const toggleBookmark = () => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(currentIndex)) {
        newBookmarks.delete(currentIndex);
      } else {
        newBookmarks.add(currentIndex);
      }
      return newBookmarks;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setHasPlayedSound(false);
    
    const timeout = setTimeout(() => {
      if (!isSwiping) {
        const phoneticMap = {
          'A': 'ae', 'B': 'buh', 'C': 'kuh', 'D': 'duh', 'E': 'eh',
          'F': 'fuh', 'G': 'guh', 'H': 'huh', 'I': 'ih', 'J': 'juh',
          'K': 'kuh', 'L': 'luh', 'M': 'muh', 'N': 'nuh', 'O': 'oh',
          'P': 'puh', 'Q': 'kwa', 'R': 'ruh', 'S': 'suh', 'T': 'tuh',
          'U': 'uh', 'V': 'vuh', 'W': 'wuh', 'X': 'ksuh', 'Y': 'yuh',
          'Z': 'zuh'
        };
        const phoneticUtterance = new SpeechSynthesisUtterance(phoneticMap[alphabet[currentIndex].toUpperCase()]);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(phoneticUtterance);
        setHasPlayedSound(true);
        setIsHolding(true);
      }
    }, 400);
    
    setTouchTimeout(timeout);
  };

  const handleTouchMove = (e) => {
    if (!touchStartX) return;
    
    const diff = touchStartX - e.touches[0].clientX;
    if (Math.abs(diff) > 10) {
      setIsSwiping(true);
      if (touchTimeout) {
        clearTimeout(touchTimeout);
        setTouchTimeout(null);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (isSwiping && Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    } else if (!isSwiping && !hasPlayedSound) {
      const letterUtterance = new SpeechSynthesisUtterance(alphabet[currentIndex]);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(letterUtterance);
    }
    
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      setTouchTimeout(null);
    }
    
    setTouchStartX(null);
    setIsSwiping(false);
    setIsHolding(false);
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (touchTimeout) clearTimeout(touchTimeout);
    };
  }, [currentIndex]);

  React.useEffect(() => {
    setShowTooltip(true);
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const adjacentLetters = getAdjacentLetters();

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 text-gray-800 select-none">
        Speaking Alphabet
      </h1>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between sm:justify-start space-x-4">
                <Label htmlFor="case-switch" className="text-lg select-none">
                  {isUpperCase ? 'UPPERCASE' : 'lowercase'}
                </Label>
                <Switch
                  id="case-switch"
                  checked={isUpperCase}
                  onCheckedChange={setIsUpperCase}
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-4">
                <Label htmlFor="bookmark-switch" className="text-lg select-none">
                  Bookmarks Only
                </Label>
                <Switch
                  id="bookmark-switch"
                  checked={showOnlyBookmarks}
                  onCheckedChange={setShowOnlyBookmarks}
                  disabled={bookmarks.size === 0}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-2">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-full transition-all text-blue-500 hover:bg-blue-50 active:scale-95 select-none"
              >
                <ChevronLeft size={40} />
              </button>

              <div className="flex items-center justify-center gap-4">
                <span 
                  className="text-3xl text-gray-400 cursor-pointer hover:text-gray-600 transition-colors select-none"
                  onClick={handlePrevious}
                >
                  {adjacentLetters.prev1}
                </span>
                <div className="flex flex-col items-center">
                  <div 
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`
                      text-8xl sm:text-9xl font-bold text-blue-500 
                      cursor-pointer transition-all group relative
                      select-none touch-none
                      ${isHolding ? 'scale-95' : 'hover:scale-110'}
                    `}
                    role="button"
                  >
                    {alphabet[currentIndex]}
                    {showTooltip && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap select-none">
                        Hold for phonics sound
                      </div>
                    )}
                  </div>
                  <button
                    onClick={toggleBookmark}
                    className="mt-4 text-blue-500 hover:text-blue-600"
                  >
                    {bookmarks.has(currentIndex) ? 
                      <BookmarkCheck className="w-8 h-8" /> : 
                      <Bookmark className="w-8 h-8" />
                    }
                  </button>
                </div>
                <span 
                  className="text-3xl text-gray-400 cursor-pointer hover:text-gray-600 transition-colors select-none"
                  onClick={handleNext}
                >
                  {adjacentLetters.next1}
                </span>
              </div>

              <button
                onClick={handleNext}
                className="p-2 rounded-full transition-all text-blue-500 hover:bg-blue-50 active:scale-95 select-none"
              >
                <ChevronRight size={40} />
              </button>
            </div>

            <Button
              onClick={handleRandom}
              className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              <span className="select-none">Random Letter</span>
            </Button>

            <div className="flex justify-center gap-2">
              {alphabet.map((letter, index) => {
                if (showOnlyBookmarks && !bookmarks.has(index)) return null;
                return (
                  <div
                    key={letter}
                    className={`relative ${index === currentIndex ? 'w-4' : 'w-2'}`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                    {bookmarks.has(index) && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Bookmark className="w-3 h-3 text-blue-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-8">
              <div className="flex flex-col items-center">
                {currentIndex === 0 ? (
                  <>
                    <svg 
                      viewBox="0 0 100 100" 
                      className="w-20 h-20 cursor-pointer hover:scale-110 transition-all"
                      onClick={() => speakPhonicsWord(alphabet[currentIndex])}
                      role="button"
                      aria-label={`${alphabet[currentIndex]} is for apple`}
                    >
                      <circle cx="50" cy="50" r="45" fill="#ff6b6b"/>
                      <path d="M50,20 C60,20 70,30 70,45 C70,60 60,80 50,80 C40,80 30,60 30,45 C30,30 40,20 50,20" fill="#4a9e5c"/>
                      <path d="M50,25 L55,15 L60,20" fill="#4a9e5c" stroke="#4a9e5c" strokeWidth="2"/>
                    </svg>
                    <span className="mt-2 text-gray-600 font-medium">apple</span>
                  </>
                ) : (
                  <>
                    <div 
                      className="w-20 h-20 bg-gray-100 rounded-lg cursor-pointer hover:scale-110 transition-all flex items-center justify-center"
                      onClick={() => speakPhonicsWord(alphabet[currentIndex])}
                      role="button"
                      aria-label={`${alphabet[currentIndex]} is for ${phonicsWords[alphabet[currentIndex].toUpperCase()]}`}
                    >
                      <span className="text-4xl text-gray-400">
                        {alphabet[currentIndex].toUpperCase()}
                      </span>
                    </div>
                    <span className="mt-2 text-gray-600 font-medium">
                      {phonicsWords[alphabet[currentIndex].toUpperCase()]}
                    </span>
                  </>
                )}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};
