import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

// Custom Select Component with Search
export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; guid?: string }>;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState(
    options.find(opt => opt.value === value) || null
  );
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update selected option when value changes
  useEffect(() => {
    setSelectedOption(options.find(opt => opt.value === value) || null);
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.guid && option.guid.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Highlight matching text
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleSelect = (option: { value: string; label: string; guid?: string }) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle input change - show dropdown on first character typed
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Open dropdown when user types first character
    if (newValue.length === 1 && !isOpen) {
      setIsOpen(true);
    }
  };

  // Handle arrow click - toggle dropdown
  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    // Only open dropdown if there's already text (preserve existing behavior)
    if (searchTerm.length > 0) {
      setIsOpen(true);
    }
  };

  // Get display value for input
  const getDisplayValue = () => {
    if (searchTerm) return searchTerm;
    if (selectedOption) return selectedOption.label;
    return "";
  };

  return (
    <div ref={selectRef} className={`relative w-64 ${className}`}>
      <div className={`relative w-full bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-400'
      }`}>
        <input
          ref={searchInputRef}
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm text-gray-700 bg-transparent border-none outline-none rounded-lg placeholder-gray-400 pr-10"
        />
        <button
          type="button"
          onClick={handleArrowClick}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
        >
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Options List */}
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors duration-150 ${
                    selectedOption?.value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">
                        {highlightMatch(option.label, searchTerm)}
                      </div>
                      {option.guid && (
                        <div className="text-xs text-gray-500 font-mono truncate">
                          {highlightMatch(option.guid, searchTerm)}
                        </div>
                      )}
                    </div>
                    {selectedOption?.value === option.value && (
                      <Check className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? "No websites found" : "Start typing to search..."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
