import React from 'react';
import { LengthSuggestion } from '../types';

interface LengthSelectionProps {
  title: string;
  lengthSuggestions: LengthSuggestion[];
  onSelect: (length: number) => void;
  onReset?: () => void;
}

const LengthSelection: React.FC<LengthSelectionProps> = ({ 
  title, 
  lengthSuggestions, 
  onSelect,
  onReset 
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">文字数を選択</h3>
        <p className="text-gray-600">選択したタイトル「{title}」に基づいて、適切な文字数を選んでください。</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lengthSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => onSelect(suggestion.length)}
              className="bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {suggestion.description}
                </h4>
                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 font-medium">
                  {suggestion.length.toLocaleString()}字
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                {suggestion.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {onReset && (
        <div className="mt-6 text-center">
          <button
            onClick={onReset}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-300 text-sm border border-gray-200">
            🔄 やり直す
          </button>
        </div>
      )}
    </div>
  );
};

export default LengthSelection; 