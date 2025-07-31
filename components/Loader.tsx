
import React from 'react';

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium text-gray-700">{text}</p>
    </div>
  );
};

export default Loader;
