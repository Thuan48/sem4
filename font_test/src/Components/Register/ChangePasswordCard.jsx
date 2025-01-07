import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { changePassword } from '../../Redux/Auth/Action';
import { useNavigate } from 'react-router-dom';
import { Button, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { green, red } from '@mui/material/colors';

const ChangePasswordCard = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (oldPassword === newPassword) {
      setError("Old password and new password cannot be the same.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Confirm password is not samee.");
      return;
    }

    try {
      const response = await dispatch(changePassword(token, oldPassword, newPassword));

      if (response.success) {
        setMessage("Password changed successfully.");
        navigate('/');
      } else {
        setError("Old password is incorrect.");
      }
    } catch (error) {
      setError("An error occurred while changing the password.");
      console.error("Change Password Error:", error);
    }
  }

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
            Change Password
          </motion.h2>
          <form onSubmit={handleChangePassword} className='space-y-6'>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="oldPassword" className='block text-white text-lg mb-2 font-semibold'>
                  Old Password:
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  name="oldPassword"
                  className='py-3 px-4 w-full rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition duration-300 text-lg'
                  placeholder="Enter your old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="newPassword" className='block text-white text-lg mb-2 font-semibold'>
                  New Password:
                </label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  className='py-3 px-4 w-full rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition duration-300 text-lg'
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="confirmPassword" className='block text-white text-lg mb-2 font-semibold'>
                  Confirm New Password:
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  className='py-3 px-4 w-full rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition duration-300 text-lg'
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </motion.div>
            </AnimatePresence>

            {(message || error) && (
              <Alert
                severity={error ? "error" : "success"}
                onClose={() => {
                  setMessage(null);
                  setError(null);
                }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: error ? red[800] : green[800],
                  fontSize: '1rem',
                  '& .MuiAlert-icon': {
                    fontSize: '2rem'
                  }
                }}
              >
                {message || error}
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
                Change Password
              </Button>
            </motion.div>
          </form>
          <motion.div
            className='flex space-x-3 items-center mt-8 justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className='text-white text-lg'>Want to go back?</p>
            <Button
              variant='text'
              className='py-2 px-6 text-white bg-pink-500 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition duration-300 transform hover:scale-105 text-lg font-semibold'
              onClick={() => navigate("/")}
            >
              Home
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default ChangePasswordCard;