import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  className?: string;
  id?: string;
  maxDisplayItems?: number;
}

const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  id,
  maxDisplayItems = 3,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length <= maxDisplayItems) {
      return selectedOptions.map((opt) => opt.label).join(", ");
    }
    return `${value.length} items selected`;
  };

  return (
    <div className="relative" ref={selectRef} id={id}>
      <div
        className={cn(
          "w-full p-3 border rounded-lg bg-background focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-400 transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-between hover:border-gray-300",
          value.length > 0 ? "border-gray-300 bg-gray-50" : "border-border",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 text-left">
          <span className={cn(
            value.length === 0 ? "text-muted-foreground" : "text-foreground font-medium"
          )}>
            {getDisplayText()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {value.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
                {value.length}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className={cn(
            "text-muted-foreground transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-auto z-50 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-2 border-b border-gray-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                {value.length === options.length ? "Deselect All" : "Select All"}
              </button>
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          <div className="py-1">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors flex items-center justify-between"
                  onClick={() => handleToggleOption(option.value)}
                >
                  <span className="font-medium">{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
