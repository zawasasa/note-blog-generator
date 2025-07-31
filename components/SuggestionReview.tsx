
import React from 'react';

interface SuggestionReviewProps {
  title: string;
  description: string;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  buttonText: string;
  onReset?: () => void;
}

const SuggestionReview: React.FC<SuggestionReviewProps> = ({ 
  title, 
  description, 
  suggestions, 
  onSelect, 
  buttonText,
  onReset 
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<string>('');

  const handleSelect = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    onSelect(suggestion);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-blue-400 transition-colors">
                  {selectedSuggestion === suggestion && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                  )}
                </div>
                <p className="text-gray-800 group-hover:text-blue-700 transition-colors font-medium">
                  {suggestion}
                </p>
              </div>
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

export default SuggestionReview;
