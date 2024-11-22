import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Bookmark } from 'lucide-react';

const Preview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  
  const getModIndex = (index) => {
    return ((index % 26) + 26) % 26;
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Speaking Alphabet</h1>
      
      <div className="flex items-center justify-between gap-2 px-2">
        <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
          <ChevronLeft size={40} />
        </button>

        <div className="flex items-center justify-center gap-4">
          <span className="text-3xl text-gray-400">
            {alphabet[getModIndex(currentIndex - 1)]}
          </span>
          <div className="flex flex-col items-center">
            <span className="text-9xl font-bold text-blue-500">
              {alphabet[currentIndex]}
            </span>
            <Bookmark className="mt-4 w-8 h-8 text-blue-500" />
          </div>
          <span className="text-3xl text-gray-400">
            {alphabet[getModIndex(currentIndex + 1)]}
          </span>
        </div>

        <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
          <ChevronRight size={40} />
        </button>
      </div>
    </div>
  );
};

export default Preview;
