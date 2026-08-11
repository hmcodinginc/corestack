import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { cn } from '@/utils/cn';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  rules?: RegisterOptions;
  description?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({ 
  name, 
  label, 
  rules, 
  description,
  className,
  ...props 
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

  return (
    <div className={cn("relative flex items-start", className)}>
      <div className="flex h-6 items-center">
        <input
          id={name}
          type="checkbox"
          {...register(name, rules)}
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 transition-colors",
            error && "border-danger text-danger focus:ring-danger/20",
            props.disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
          )}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm leading-6">
        <label htmlFor={name} className="font-medium text-gray-900 cursor-pointer">
          {label}
          {rules?.required && <span className="text-danger ml-1">*</span>}
        </label>
        {description && (
          <p className="text-gray-500">{description}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    </div>
  );
};
