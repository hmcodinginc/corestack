import React from 'react';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  colorVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
  colorVariant = 'primary'
}) => {
  const getColors = () => {
    switch (colorVariant) {
      case 'success': return 'bg-green-50 text-green-600';
      case 'warning': return 'bg-yellow-50 text-yellow-600';
      case 'danger': return 'bg-red-50 text-red-600';
      case 'info': return 'bg-blue-50 text-blue-600';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0 pr-2 group relative">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-2 text-2xl lg:text-3xl font-bold text-gray-900 truncate">
            {value}
          </p>
          
          {/* Custom Tooltip */}
          <div className="absolute left-0 -top-2 translate-y-[-100%] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-3 bg-gray-900 text-white rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-gray-700">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-6 -mt-[1px] border-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
        <div className={cn("p-3 rounded-full shrink-0 flex items-center justify-center", getColors())}>
          <Icon size={24} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn(
            "font-medium",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-gray-500">from last month</span>
        </div>
      )}
    </div>
  );
};
