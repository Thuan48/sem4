import React, { useEffect, useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { green } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { currenUser, register } from '../../Redux/Auth/Action';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [inputData, setInputData] = useState({ email: "", full_name: "", password: "", confirmPassword: "" });
  const dispatch = useDispatch();
  const { auth } = useSelector(store => store);
  const token = localStorage.getItem("token");

  const snackBar = () => {
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputData.password !== inputData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log('Form submitted:', inputData);
    dispatch(register({ email: inputData.email, full_name: inputData.full_name, password: inputData.password }));
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((values) => ({ ...values, [name]: value }));
  };

  useEffect(() => {
    if (token) dispatch(currenUser(token));
  }, [token, dispatch]);

  useEffect(() => {
    if (auth.reqUser?.full_name) {
      navigate('/');
    }
  }, [auth.reqUser, navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4"
      style={{ background: `url('https://img3.thuthuatphanmem.vn/uploads/2019/10/10/background-anh-dong_032845920.gif') no-repeat center center fixed`, backgroundSize: 'cover' }}>
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
            Sign Up
          </motion.h2>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <AnimatePresence>
              {['email', 'full_name', 'password', 'confirmPassword'].map((field, index) => (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <label htmlFor={field} className='block text-white text-lg mb-2 font-semibold'>
                    {field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}:
                  </label>
                  <input
                    id={field}
                    type={field === 'password' || field === 'confirmPassword' ? 'password' : 'text'}
                    name={field}
                    className='py-3 px-4 w-full rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition duration-300 text-lg'
                    placeholder={`Enter your ${field === 'full_name' ? 'name' : field}`}
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
                Sign Up
              </Button>
            </motion.div>
          </form>
          <motion.div
            className='flex space-x-3 items-center mt-8 justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className='text-white text-lg'>Already have an account?</p>
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
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={snackBar}
      >
        <Alert
          onClose={snackBar}
          severity="success"
          sx={{
            width: "100%",
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: green[800],
            fontSize: '1rem',
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          Sign Up Successful!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Signup;
