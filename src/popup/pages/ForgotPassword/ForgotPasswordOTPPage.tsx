import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyForgotPasswordOTP, requestForgotPasswordOTP } from '../../../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordOTPPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [isUsernameRequest, setIsUsernameRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [hasShownError, setHasShownError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedIdentifier = localStorage.getItem('forgotPasswordIdentifier');
    const storedIsUsernameRequest = localStorage.getItem('forgotPasswordIsUsernameRequest');
    const storedTimer = localStorage.getItem('forgotPasswordResendTimer');
    
    if (!storedIdentifier) {
      toast.error('Please start the password reset process again');
      navigate('/forgot-password');
      return;
    }
    
    setIdentifier(storedIdentifier);
    setIsUsernameRequest(storedIsUsernameRequest === 'true');
    
    if (storedTimer) {
      const timeLeft = parseInt(storedTimer) - Date.now();
      if (timeLeft > 0) {
        setResendTimer(Math.ceil(timeLeft / 1000));
      }
    }
  }, [navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('forgotPasswordResendTimer');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      if (!hasShownError) {
        toast.error('Please enter the verification code');
        setHasShownError(true);
        setTimeout(() => setHasShownError(false), 1000);
      }
      return;
    }

    if (otp.length !== 6) {
      if (!hasShownError) {
        toast.error('Verification code must be 6 digits');
        setHasShownError(true);
        setTimeout(() => setHasShownError(false), 1000);
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyForgotPasswordOTP(identifier, otp);
      
      if (response.success) {
        localStorage.removeItem('forgotPasswordResendTimer');
        localStorage.setItem('forgotPasswordStep', 'reset-password');
        
        toast.success(response.message || 'Code verified successfully!');
        navigate('/forgot-password/reset');
      } else {
        if (response.requireResend) {
          toast.error(response.error || 'Code expired. Please request a new code.');
          handleResendCode();
        } else if (response.attemptsRemaining !== undefined) {
          setAttemptsRemaining(response.attemptsRemaining);
          toast.error(response.error || `Invalid code. ${response.attemptsRemaining} attempts remaining.`);
          setOtp('');
        } else {
          toast.error(response.error || response.message || 'Invalid verification code');
          setOtp('');
        }
      }
    } catch (error: any) {
      console.error('Verify forgot password OTP error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);

    try {
      const response = await requestForgotPasswordOTP(identifier);
      
      if (response.success) {
        localStorage.setItem('forgotPasswordIdentifier', response.data.identifier);
        localStorage.setItem('forgotPasswordIsUsernameRequest', response.data.isUsernameRequest.toString());
        
        setIdentifier(response.data.identifier);
        setIsUsernameRequest(response.data.isUsernameRequest);
        
        const expiryTime = Date.now() + 60000; // 1 minute
        localStorage.setItem('forgotPasswordResendTimer', expiryTime.toString());
        setResendTimer(60);
        
        setOtp('');
        setAttemptsRemaining(null);
        toast.success('New verification code sent!');
      } else {
        toast.error(response.error || 'Failed to resend code');
      }
    } catch (error: any) {
      console.error('Resend forgot password OTP error:', error);
      toast.error(error.message || 'Failed to resend code');
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayMessage = () => {
    if (isUsernameRequest) {
      return `We've sent a 6-digit code to the email associated with username "${identifier}"`;
    } else {
      return `We've sent a 6-digit code to ${identifier}`;
    }
  };

  return (
    <div className="min-h-[600px] w-[400px] bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-white hover:text-blue-100 mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Enter Verification Code</h1>
        </div>
        <p className="text-blue-100 mt-2">
          {getDisplayMessage()}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
            />
            {attemptsRemaining !== null && (
              <p className="text-sm text-orange-600 mt-2">
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in {formatTime(resendTimer)}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code
              </button>
            )}
            
            <div>
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
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

export default ForgotPasswordOTPPage;