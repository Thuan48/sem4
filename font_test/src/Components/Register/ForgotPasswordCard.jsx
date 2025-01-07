import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../../Redux/Auth/Action';
import { Button, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { green, red } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordCard = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await dispatch(forgotPassword(email));
      setMessage("Verification code sent to your email.");
      setError(false);
      navigate("/reset-password", { state: { email } }); 
    } catch (err) {
      setMessage("Failed to send verification code.");
      setError(true);
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
            Forgot Password
          </motion.h2>
          <form onSubmit={handleForgotPassword} className='space-y-6'>
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
              >
                Send Verification Code
              </Button>
            </motion.div>
          </form>
          <motion.div
            className='flex space-x-3 items-center mt-8 justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className='text-white text-lg'>Remembered your password?</p>
            <Button
              variant='text'
              className='py-2 px-6 text-white bg-pink-500 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition duration-300 transform hover:scale-105 text-lg font-semibold'
              onClick={() => navigate("/signin")}
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordCard;