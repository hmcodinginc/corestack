import React from 'react';
import { cn } from '@/utils/cn';

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  action,
  children,
  className,
  bodyClassName
}) => {
  return (
    <section className={cn("bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden", className)}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-6", bodyClassName)}>
        {children}
      </div>
    </section>
  );
};
