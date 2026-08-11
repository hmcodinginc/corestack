import React from 'react';
import { cn } from '@/utils/cn';
import { StatusType, STATUS } from '@/constants/status';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = () => {
    switch (status.toUpperCase()) {
      case STATUS.ACTIVE:
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: <CheckCircle2 size={14} className="mr-1" />
        };
      case STATUS.INACTIVE:
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: <XCircle size={14} className="mr-1" />
        };
      case STATUS.PENDING:
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: <Clock size={14} className="mr-1" />
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: null
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      styles.bg,
      styles.text,
      styles.border,
      className
    )}>
      {styles.icon}
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
};
