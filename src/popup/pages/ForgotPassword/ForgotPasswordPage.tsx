import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestForgotPasswordOTP } from '../../../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedIdentifier = localStorage.getItem('forgotPasswordIdentifier');
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim()) {
      toast.error('Please enter your username or email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestForgotPasswordOTP(identifier.trim());
      
      if (response.success) {
        localStorage.setItem('forgotPasswordIdentifier', identifier.trim());
        localStorage.setItem('forgotPasswordIsUsernameRequest', response.data.isUsernameRequest.toString());
        localStorage.setItem('forgotPasswordStep', 'verify-otp');
        
        toast.success(response.message);
        navigate('/forgot-password/verify-otp');
      } else {
        toast.error(response.error || 'Failed to send reset code');
      }
    } catch (error: any) {
      console.error('Forgot password request error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('forgotPasswordIdentifier');
    localStorage.removeItem('forgotPasswordIsUsernameRequest');
    localStorage.removeItem('forgotPasswordStep');
    localStorage.removeItem('forgotPasswordResendTimer');
    navigate('/login');
  };

  return (
    <div className="min-h-[600px] w-[400px] bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/login')}
            className="text-white hover:text-blue-100 mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Reset Password</h1>
        </div>
        <p className="text-blue-100 mt-2">
          Enter your username or email address and we'll send you a code to reset your password.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
              Username or Email Address
            </label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username or email"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="p-6 border-t bg-gray-50">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;