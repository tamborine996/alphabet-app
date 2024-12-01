import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Bookmark, Check as BookmarkCheck } from 'lucide-react';
import Switch from './ui/switch';
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

  const handleLetterClick = (letter, isDoubleClick) => {
    if (isDoubleClick) {
      // Letter sound only
      const letterUtterance = new SpeechSynthesisUtterance(letter);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(letterUtterance);
    } else {
      // Phonics sound only
      const phoneticMap = {
        'A': 'ae', // as in cat
        'B': 'buh',
        'C': 'kuh',
        'D': 'duh',
        'E': 'eh', // as in bed
        'F': 'fuh',
        'G': 'guh',
        'H': 'huh',
        'I': 'ih', // as in sit
        'J': 'juh',
        'K': 'kuh',
        'L': 'luh',
        'M': 'muh',
        'N': 'nuh',
        'O': 'oh', // as in hot
        'P': 'puh',
        'Q': 'kwa',
        'R': 'ruh',
        'S': 'suh',
        'T': 'tuh',
        'U': 'uh', // as in cup
        'V': 'vuh',
        'W': 'wuh',
        'X': 'ksuh',
        'Y': 'yuh',
        'Z': 'zuh'
      };
      const phoneticUtterance = new SpeechSynthesisUtterance(phoneticMap[letter.toUpperCase()]);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(phoneticUtterance);
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
    if (e.key === ' ') handleLetterClick(alphabet[currentIndex], false);
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  const adjacentLetters = getAdjacentLetters();

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
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

            <div className="flex items-center justify-between gap-2 px-2">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-full transition-all text-blue-500 hover:bg-blue-50 active:scale-95"
              >
                <ChevronLeft size={40} />
              </button>

              <div className="flex items-center justify-center gap-4">
                <span className="text-3xl text-gray-400">{adjacentLetters.prev1}</span>
                <div className="flex flex-col items-center">
                  <div 
                    onClick={(e) => {
                      if (!e.detail || e.detail === 1) {
                        setTimeout(() => {
                          if (!e.detail || e.detail === 1) {
                            handleLetterClick(alphabet[currentIndex], false);
                          }
                        }, 200);
                      }
                    }}
                    onDoubleClick={() => handleLetterClick(alphabet[currentIndex], true)}
                    className="text-8xl sm:text-9xl font-bold text-blue-500 cursor-pointer hover:scale-110 transition-all group relative"
                    role="button"
                  >
                    {alphabet[currentIndex]}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Click for phonics, double-click for letter
                    </div>
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
                <span className="text-3xl text-gray-400">{adjacentLetters.next1}</span>
              </div>

              <button
                onClick={handleNext}
                className="p-2 rounded-full transition-all text-blue-500 hover:bg-blue-50 active:scale-95"
              >
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
