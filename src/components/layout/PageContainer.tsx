import React from 'react';
import { cn } from '@/utils/cn';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className }) => {
  return (
    <div className={cn("w-full max-w-7xl mx-auto animate-in fade-in duration-500", className)}>
      {children}
    </div>
  );
};
