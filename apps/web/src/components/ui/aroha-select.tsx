'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ArohaSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

export interface ArohaSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (ArohaSelectOption | string)[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export function ArohaSelect({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  disabled = false,
  id,
  name,
  'aria-label': ariaLabel,
}: ArohaSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Normalize options to object format
  const normalizedOptions: ArohaSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[role="option"]');
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [isOpen, focusedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = normalizedOptions.findIndex((opt) => opt.value === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
          const opt = normalizedOptions[focusedIndex];
          if (!opt.disabled) {
            onChange(opt.value);
            setIsOpen(false);
            setFocusedIndex(-1);
            triggerRef.current?.focus();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSelectOption = (opt: ArohaSelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Accessible native select mirror for form submission & screen readers */}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only pointer-events-none absolute -bottom-1 left-0 h-0 w-0 opacity-0"
      >
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom Aroha Styled Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${selectId}-menu`}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            const willOpen = !isOpen;
            setIsOpen(willOpen);
            if (willOpen) {
              const idx = normalizedOptions.findIndex((opt) => opt.value === value);
              setFocusedIndex(idx >= 0 ? idx : 0);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-2 rounded-md border border-[#DFD8CB] bg-[#FFFFFF] px-3 py-2 text-xs sm:text-sm font-medium text-[#1E221B] shadow-2xs transition-colors hover:border-[#233D22] focus:border-[#233D22] focus:outline-none focus:ring-1 focus:ring-[#233D22] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${triggerClassName}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : <span className="text-[#8A8F7E] font-normal">{placeholder}</span>}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#6B7260] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#233D22]' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Custom Aroha Styled Dropdown Popover Menu */}
      {isOpen && (
        <ul
          ref={menuRef}
          id={`${selectId}-menu`}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          className={`absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[#DFD8CB] bg-[#FCFAF6] p-1 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100 ${menuClassName}`}
        >
          {normalizedOptions.length === 0 ? (
            <li className="px-3 py-2 text-xs text-[#8A8F7E] italic select-none">
              No options available
            </li>
          ) : (
            normalizedOptions.map((opt, index) => {
              const isSelected = opt.value === value;
              const isFocused = index === focusedIndex;

              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onClick={() => handleSelectOption(opt)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md text-xs sm:text-sm transition-colors cursor-pointer select-none ${
                    opt.disabled
                      ? 'cursor-not-allowed opacity-40 text-[#8A8F7E]'
                      : isSelected
                      ? 'bg-[#233D22] text-[#FAF8F2] font-semibold'
                      : isFocused
                      ? 'bg-[#EAE4D6] text-[#1E221B]'
                      : 'text-[#1E221B] hover:bg-[#EAE4D6]'
                  }`}
                >
                  <div className="truncate">
                    <span>{opt.label}</span>
                    {opt.subLabel && (
                      <span
                        className={`block text-[10px] ${
                          isSelected ? 'text-[#D0E2CE]' : 'text-[#6B7260]'
                        }`}
                      >
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#FAF8F2]" aria-hidden="true" />
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
