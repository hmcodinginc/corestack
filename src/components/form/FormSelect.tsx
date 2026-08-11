import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { DropdownOption } from '@/types';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label: string;
  options: DropdownOption[];
  rules?: RegisterOptions;
  helperText?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({ 
  name, 
  label, 
  options, 
  rules, 
  helperText, 
  className,
  ...props 
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {rules?.required && <span className="text-danger ml-1">*</span>}
      </label>
      <select
        id={name}
        {...register(name, rules)}
        className={cn(
          "w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 bg-white",
          error 
            ? "border-danger text-danger focus:border-danger focus:ring-danger/20" 
            : "border-gray-300 focus:border-primary focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:bg-gray-50",
          className
        )}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
