import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { cn } from '@/utils/cn';

interface FormSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  rules?: RegisterOptions;
  description?: string;
}

export const FormSwitch: React.FC<FormSwitchProps> = ({ 
  name, 
  label, 
  rules, 
  description,
  className,
  ...props 
}) => {
  const { register, watch, formState: { errors } } = useFormContext();
  const isChecked = watch(name);
  const error = errors[name]?.message as string;

  return (
    <div className={cn("flex items-start", className)}>
      <div className="flex items-center h-5">
        <input
          id={name}
          type="checkbox"
          {...register(name, rules)}
          className="hidden"
          {...props}
        />
        <label 
          htmlFor={name}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isChecked ? 'bg-primary' : 'bg-gray-200',
            props.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              isChecked ? 'translate-x-4' : 'translate-x-0'
            )}
          />
        </label>
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={name} className="font-medium text-gray-700 cursor-pointer">
          {label}
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
