import React, { useEffect, useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material'; // Import Material-UI components
import { green } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { currenUser, register } from '../../Redux/Auth/Action';

const Signup = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [inputData, setInputData] = useState({ email: "", full_name: "", password: "" });
  const dispatch = useDispatch();
  const { auth } = useSelector(store => store);
  const token = localStorage.getItem("token");

  const snackBar = () => {
    setOpen(false);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', inputData);
    dispatch(register(inputData));
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((values) => ({ ...values, [name]: value }));
  };
  useEffect(() => {
    if (token) dispatch(currenUser(token))
  }, [token])
  useEffect(() => {{
    if (auth.reqUser?.full_name)
      navigate('/')
  }}, [auth.reqUser])

  return (
    <div className='flex justify-center h-screen items-center'>
      <div className='w-[30%] p-10 shadow-md bg-white'>
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <p className='mb-2 text-left'>Email:</p>
            <input
              type="email"
              name="email"
              className='py-2 outline outline-green-600 w-full rounded-md border'
              placeholder='Enter your Email'
              value={inputData.email}
              onChange={(e) => handleChange(e)}
              required
            />
          </div>
          <div>
            <p className='mb-2 text-left'>Full Name:</p>
            <input
              type="text"
              name="full_name"
              className='py-2 outline outline-green-600 w-full rounded-md border'
              placeholder='Enter your name'
              value={inputData.full_name}
              onChange={(e) => handleChange(e)}
              required
            />
          </div>
          <div>
            <p className='mb-2 text-left'>Password:</p>
            <input
              type="password"
              name="password"
              className='py-2 outline outline-green-600 w-full rounded-md border'
              placeholder='Enter your Password'
              value={inputData.password}
              onChange={(e) => handleChange(e)}
              required
            />
          </div>
          <div>
            <Button
              sx={{ bgcolor: green[700], padding: ".5rem 0rem" }}
              variant='contained'
              className='w-full'
              type='submit'
              color='success'
            >Sign Up</Button>
          </div>
        </form>
        <div className='flex space-x-3 items-center mt-5'>
          <p className='m-0'>Already have an account?</p>
          <Button
            variant='text'
            className='py-2 px-4 text-white bg-green-600 rounded-md'
            onClick={() => navigate("/signin")}
          >Sign In</Button>
        </div>
      </div>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={snackBar}>
        <Alert onClose={snackBar} severity="success" sx={{ width: "100%" }}>
          Sign Up Successful!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Signup;
