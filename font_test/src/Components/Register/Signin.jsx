import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { currenUser, login } from '../../Redux/Auth/Action';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Button } from '@mui/material';
import { green, red } from '@mui/material/colors';

const Signin = () => {
  const navigate = useNavigate();
  const [inputData, setInputData] = useState({ email: "", password: "" });
  const [open, setOpen] = useState(false);
  const [notificationType, setNotificationType] = useState('success');
  const { auth } = useSelector(store => store);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(login(inputData));
      if (response && response.jwt) {
        setNotificationType('success');
        setOpen(true);
        navigate("/");
      } else {
        setNotificationType('error');
        setOpen(true);
      }
    } catch (error) {
      setNotificationType('error');
      setOpen(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((values) => ({ ...values, [name]: value }));
  };

  useEffect(() => {
    if (token) dispatch(currenUser(token));
  }, [token, dispatch]);

  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (auth.reqUser?.full_name) {
      navigate('/');
    }
  }, [auth.reqUser, navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4"
      style={{ background: ` no-repeat center center fixed`, backgroundSize: 'cover' }}>
      {successMessage && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded">
          {successMessage}
        </div>
      )}
      {auth.signin && auth.signin.success === false && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
          {auth.signin.message || 'Login failed.'}
        </div>
      )}
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
            Sign In
          </motion.h2>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <AnimatePresence>
              {['email', 'password'].map((field) => (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: field === 'email' ? 0.3 : 0.4 }}
                >
                  <label htmlFor={field} className='block text-white text-lg mb-2 font-semibold'>{field.charAt(0).toUpperCase() + field.slice(1)} :</label>
                  <input
                    id={field}
                    type={field}
                    name={field}
                    className='py-3 px-4 w-full rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition duration-300 text-lg'
                    placeholder={`Enter your ${field}`}
                    value={inputData[field]}
                    onChange={handleChange}
                    required
                  />
                </motion.div>
              ))}
            </AnimatePresence>
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
                Sign In
              </Button>
            </motion.div>

            {open && (
              <Alert
                onClose={() => setOpen(false)}
                severity={notificationType}
                sx={{
                  mt: 2,
                  width: "100%",
                  bgcolor: notificationType === 'success' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 0, 0, 0.9)',
                  color: notificationType === 'success' ? green[800] : red[200],
                  fontSize: '1rem',
                  '& .MuiAlert-icon': {
                    fontSize: '2rem'
                  }
                }}
              >
                {notificationType === 'success' ? 'Sign In Successful!' : 'Sign In Failed! Incorrect email or password.'}
              </Alert>
            )}
          </form>
          <motion.div
            className='flex space-x-3 items-center mt-8 justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className='text-white text-lg'>New Account?</p>
            <Button
              variant='text'
              className='py-2 px-6 text-white bg-pink-500 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition duration-300 transform hover:scale-105 text-lg font-semibold'
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </motion.div>
          <motion.div
            className='flex justify-center mt-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              variant='text'
              className='text-white underline'
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signin;