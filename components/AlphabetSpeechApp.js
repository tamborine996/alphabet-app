import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Bookmark, Check as BookmarkCheck } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import Button from './ui/button';
import { Card, CardContent } from './ui/card';

export const AlphabetSpeechApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUpperCase, setIsUpperCase] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  
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

  const speakLetter = (letter) => {
    const letterUtterance = new SpeechSynthesisUtterance(letter);
    const phoneticMap = {
      'A': 'ah', 'B': 'buh', 'C': 'kuh', 'D': 'duh', 'E': 'eh',
      'F': 'fuh', 'G': 'guh', 'H': 'huh', 'I': 'ih', 'J': 'juh',
      'K': 'kuh', 'L': 'lul', 'M': 'muh', 'N': 'nuh', 'O': 'oh',
      'P': 'puh', 'Q': 'kwuh', 'R': 'ruh', 'S': 'suh', 'T': 'tuh',
      'U': 'uh', 'V': 'vuh', 'W': 'wuh', 'X': 'ks', 'Y': 'yuh',
      'Z': 'zuh'
    };
    
    const phoneticUtterance = new SpeechSynthesisUtterance(phoneticMap[letter.toUpperCase()]);
    letterUtterance.onend = () => window.speechSynthesis.speak(phoneticUtterance);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(letterUtterance);
  };

  const getAdjacentLetters = () => {
    return {
      prev2: alphabet[filteredIndices[getModIndex(currentFilteredIndex - 2)]],
      prev1: alphabet[filteredIndices[getModIndex(currentFilteredIndex - 1)]],
      next1: alphabet[filteredIndices[getModIndex(currentFilteredIndex + 1)]],
      next2: alphabet[filteredIndices[getModIndex(currentFilteredIndex + 2)]]
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
    if (e.key === ' ') speakLetter(alphabet[currentIndex]);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const diff = startX - touch.clientX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', handleTouchMove);
    }, { once: true });
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  const adjacentLetters = getAdjacentLetters();

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8" onTouchStart={handleTouchStart}>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 text-gray-800">
        Speaking Alphabet
      </h1>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between sm:justify-start space-x-4">
                <Label htmlFor="case-switch" className="text-lg">
                  {isUpperCase ? 'UPPERCASE' : 'lowercase'}
                </Label>
                <Switch
                  id="case-switch"
                  checked={isUpperCase}
                  onCheckedChange={setIsUpperCase}
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-4">
                <Label htmlFor="bookmark-switch" className="text-lg">
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

            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                className="p-4 rounded-full transition-all text-blue-500 hover:bg-blue-50 active:scale-95 flex items-center"
              >
                <ChevronLeft size={40} />
                <div className="flex items-center ml-2">
                  <span className="text-2xl opacity-25">{adjacentLetters.prev2}</span>
                  <span className="text-4xl opacity-50 ml-2">{adjacentLetters.prev1}</span>
                </div>
              </button>

              <div className="flex flex-col items-center">
                <div 
                  onClick={() => speakLetter(alphabet[currentIndex])}
                  className="text-8xl sm:text-9xl font-bold text-blue-500 cursor-pointer hover:scale-110 transition-all"
                  role="button"
                >
                  {alphabet[currentIndex]}
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

              <button
                onClick={handleNext}
                className="p-4 rounded-full transition-all text-blue-500 hover:bg-blue-50 active:scale-95 flex items-center"
              >
                <div className="flex items-center mr-2">
                  <span className="text-4xl opacity-50">{adjacentLetters.next1}</span>
                  <span className="text-2xl opacity-25 ml-2">{adjacentLetters.next2}</span>
                </div>
                <ChevronRight size={40} />
              </button>
            </div>

            <Button
              onClick={handleRandom}
              className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Random Letter
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
