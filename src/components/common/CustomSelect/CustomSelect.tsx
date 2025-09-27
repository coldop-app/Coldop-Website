import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  id?: string;
}

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  id,
}: CustomSelectProps) => {
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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={selectRef} id={id}>
      <input
        type="text"
        readOnly
        value={selectedOption?.label || ""}
        onClick={() => setIsOpen(!isOpen)}
        placeholder={placeholder}
        className={cn(
          "w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className
        )}
      />
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-auto z-50 bg-white rounded-md shadow-lg border border-gray-200">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <div className="font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
