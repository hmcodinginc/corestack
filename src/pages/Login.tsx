import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@demo.com',
      password: '123456',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error handled by AuthContext toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setResetLoading(true);
    setTimeout(() => {
      toast.success('Password reset instructions sent to ' + resetEmail);
      setResetLoading(false);
      setIsForgotPassword(false);
      setResetEmail('');
    }, 1000);
  };

  if (isForgotPassword) {
    return (
      <form onSubmit={handleResetSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
          <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you instructions to reset your password.</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-default focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={resetLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-default shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {resetLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
        </button>

        <button
          type="button"
          onClick={() => setIsForgotPassword(false)}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-default shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            {...register('email')}
            type="email"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-default focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="admin@demo.com"
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            {...register('password')}
            type="password"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-default focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="••••••"
          />
        </div>
        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary mr-2" />
          Remember me
        </label>
        <button type="button" onClick={() => setIsForgotPassword(true)} className="text-primary hover:text-primary-dark font-medium">
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-default shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
      </button>

      <div className="mt-4 text-center text-sm text-gray-600 flex flex-col gap-2">
        <div>
          New user? <Link to="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">Register here</Link>
        </div>
        <div>
          Return to <Link to="/" className="font-medium text-primary hover:text-primary-dark transition-colors">Marketing site</Link>
        </div>
      </div>
    </form>
  );
};

export default Login;
