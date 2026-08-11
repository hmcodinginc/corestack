import React from 'react';
import { cn } from '@/utils/cn';

interface ActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 mb-6", className)}>
      {children}
    </div>
  );
};
