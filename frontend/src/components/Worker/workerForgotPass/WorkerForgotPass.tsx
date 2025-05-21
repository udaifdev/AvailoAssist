import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../API/axios';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkerForgotPass = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(4).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize timer when OTP is sent
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, timer]);

  // Reset timer when resending OTP
  const resetTimer = () => {
    setTimer(30);
  };

  const validateEmail = (email: string): boolean => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/worker/forgotPass-send-otp', { email });
      if (response.status === 200) {
        localStorage.setItem('WorkerResetEmail', email);
        setOtpSent(true);
        resetTimer();
        toast.success('OTP sent to your email!', { position: 'top-center' });
        // Focus the first input after OTP is sent
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Move focus to next input if value is entered
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPSubmit = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      const email = localStorage.getItem('WorkerResetEmail');
      if (!email) throw new Error("Email data is missing");

      const response = await axiosInstance.post('/worker/forgotPass-verify-otp', {
        email,  
        otp: otp.join(''), 
      });
      if (response.status === 201) {
        toast.success("OTP verification successful!");
        navigate('/worker-reset-password');
      }
    } catch (error: any) {
      setOtp(new Array(4).fill(''));
      toast.error(error.response?.data?.message || "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer === 0) {
      await handleSubmit({ preventDefault: () => { } } as FormEvent);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-50">
      {otpSent ? (
        <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-lg relative">
          <div className="absolute top-0 right-0 w-32 h-32">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-600 rounded-full opacity-20" />
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-300 bg-opacity-20 rotate-45" />
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32">
            <div className="absolute left-0 bottom-0 w-24 h-24 bg-emerald-600 rounded-full opacity-20" />
            <div className="absolute left-0 bottom-0 w-24 h-24 bg-indigo-300 bg-opacity-20 rotate-45" />
          </div>

          <h1 className="text-emerald-600 text-3xl font-semibold text-center mb-8">Reset Password</h1>
          <div className="space-y-6">
            <p className="text-gray-700 text-center mb-4">Enter Your OTP</p>
            <div className="flex justify-center gap-4">
              {otp.map((data, index) => (
                <input
                  key={index}
                  ref={(el) => { if (el) { inputRefs.current[index] = el; } }}
                  type="text"
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 border-2 rounded-lg text-center text-xl focus:border-emerald-600 focus:outline-none border-gray-300"
                />
              ))}
            </div>
            <div className="text-center text-sm text-gray-500">
              {timer > 0 ? (
                <p>Resend OTP in {timer} seconds</p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  Resend OTP
                </button>
              )}
            </div>
            <button
              onClick={handleOTPSubmit}
              disabled={otp.some((v) => !v) || isLoading}
              className={`w-full bg-emerald-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center ${isLoading || otp.some((v) => !v) ? 'cursor-not-allowed opacity-50' : 'hover:bg-emerald-700'
                }`}
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : 'Verify OTP'}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="p-8 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32">
              <div className="absolute right-0 top-0 w-40 h-40 bg-teal-600 rounded-full translate-x-1/2 -translate-y-1/2 opacity-40"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-32 h-32">
              <div className="absolute left-0 bottom-0 w-40 h-40 bg-teal-600 rounded-full -translate-x-1/2 translate-y-1/2 opacity-40"></div>
            </div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-teal-600">AVAILOASSIST <span>Expertist</span></h1>
            </div>
            <h2 className="text-2xl font-semibold text-emerald-700 mb-2">Forgot Password</h2>
            <p className="text-gray-600 mb-6">
              Enter your email and we'll send you instructions to reset your password
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter email address"
                  disabled={isLoading}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerForgotPass;