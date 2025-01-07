import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { forgotPassword, resetPassword } from '../../Redux/Auth/Action';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Alert } from '@mui/material';
import { green, red } from '@mui/material/colors';
import { motion, AnimatePresence } from 'framer-motion';

const ResetPasswordCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer;
    if (email && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [email, timeLeft]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await dispatch(resetPassword(email, code.join(''), newPassword));
      setMessage("Password has been reset successfully.");
      setError(false);
      navigate("/signin");
    } catch (err) {
      setMessage("Failed to reset password.");
      setError(true);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await dispatch(forgotPassword(email));
      setMessage("A new verification code has been sent to your email.");
      setError(false);
      setTimeLeft(60);
    } catch (err) {
      setMessage("Failed to resend verification code.");
      setError(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4"
      style={{ background: `no-repeat center center fixed`, backgroundSize: 'cover' }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className='p-8 rounded-2xl shadow-2xl bg-white bg-opacity-10 backdrop-blur-xl border border-white border-opacity-20'>
          <motion.h2
            className="text-4xl font-bold text-white text-center mb-8"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          >
            Reset Password
          </motion.h2>
          <form onSubmit={handleResetPassword} className='space-y-6'>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="email" className='block text-white text-lg mb-2 font-semibold'>
                  Email:
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className='py-3 px-4 w-full rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition duration-300 text-lg'
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!!location.state?.email}
                />
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
                className="relative w-full"
              >
                <label htmlFor="code" className='block text-white text-lg mb-2 font-semibold'>
                  Verification Code:
                </label>
                <div className="flex justify-between items-center space-x-2 mb-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      className='w-12 h-12 text-center rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-10 text-white text-2xl font-bold placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition duration-300'
                      value={code[index] || ''}
                      onChange={(e) => {
                        const newCode = [...code];
                        newCode[index] = e.target.value;
                        setCode(newCode);
                        if (e.target.value && e.target.nextElementSibling) {
                          e.target.nextElementSibling.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !e.target.value && e.target.previousElementSibling) {
                          e.preventDefault();
                          e.target.previousElementSibling.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-white text-sm">
                    {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Code expired'}
                  </p>
                  {timeLeft === 0 && (
                    <Button
                      variant='text'
                      className='text-white text-sm font-semibold bg-pink-500 bg-opacity-50 px-4 py-2 rounded-lg hover:bg-opacity-70 transition duration-300'
                      onClick={handleResendCode}
                      disabled={isResending}
                    >
                      {isResending ? 'Resending...' : 'Resend Code'}
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="newPassword" className='block text-white text-lg mb-2 font-semibold'>
                  New Password:
                </label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  className='py-3 px-4 w-full rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition duration-300 text-lg'
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </motion.div>
            </AnimatePresence>

            {message && (
              <Alert
                severity={error ? "error" : "success"}
                onClose={() => setMessage(null)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: error ? red[800] : green[800],
                  fontSize: '1rem',
                  '& .MuiAlert-icon': {
                    fontSize: '2rem'
                  }
                }}
              >
                {message}
              </Alert>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: "0.75rem 0",
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
                variant='contained'
                className='w-full rounded-lg transition duration-300 hover:shadow-lg transform hover:scale-105'
                type='submit'
                disabled={timeLeft == 0}
              >
                Reset Password
              </Button>
            </motion.div>
          </form>
          <motion.div
            className='flex space-x-3 items-center mt-8 justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className='text-lg text-white'>Want to try again?</p>
            <Button
              variant='text'
              className='py-2 px-6 text-white bg-pink-500 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition duration-300 transform hover:scale-105 text-lg font-semibold'
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPasswordCard;

