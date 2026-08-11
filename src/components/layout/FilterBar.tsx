import React from 'react';
import { cn } from '@/utils/cn';
import { Filter } from 'lucide-react';

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
  onClear?: () => void;
  hasActiveFilters?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  children, 
  className,
  onClear,
  hasActiveFilters = false
}) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Filter size={16} />
        <span className="hidden sm:inline">Filters:</span>
      </div>
      {children}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className="text-sm text-primary hover:text-primary-dark transition-colors font-medium ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
};
