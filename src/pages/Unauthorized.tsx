import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <div className="text-center">
        <div className="mx-auto w-24 h-24 bg-red-50 text-danger rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          You do not have the necessary permissions to view this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <Link to="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
