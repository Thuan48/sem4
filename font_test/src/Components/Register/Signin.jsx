import { Alert, Button, Snackbar } from '@mui/material';
import { green } from '@mui/material/colors';
import React, {useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { currenUser, login } from '../../Redux/Auth/Action';

const Signin = () => {
  const navigate = useNavigate();
  const [inputData, setInputData] = useState({ email: "", password: "" });
  const [open, setOpen] = useState(false);
  const {auth}=useSelector(store=>store)
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const snackBar = () => {
    setOpen(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', inputData);
    setOpen(true);
    navigate("/");
    dispatch(login(inputData));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((values) => ({ ...values, [name]: value }));
  };

  useEffect(() => {
    if (token) dispatch(currenUser(token))
  }, [token])

  useEffect(() => {
    if (auth.reqUser?.full_name) {
      navigate('/')
    }
  }, [auth.reqUser])

  return (
    <div>
      <div className=' flex justify-center h-screen items-center'>
        <div className='w-[30%] p-10 shadow-md bg-white'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <p className='mb-2 text-left'>Email :</p>
              <input
                type="email"
                name="email"
                className='py-2 outline outline-green-600 w-full rounded-md border'
                placeholder='Enter your Email'
                value={inputData.email}
                onChange={handleChange}
                required 
              />
            </div>
            <div>
              <p className='mb-2 text-left'>Password :</p>
              <input
                type="password"
                name="password"
                className='py-2 outline outline-green-600 w-full rounded-md border'
                placeholder='Enter your Password'
                value={inputData.password}
                onChange={handleChange}
                required 
              />
            </div>
            <div>
              <Button
                sx={{ bgcolor: green[700], padding: ".5rem 0rem" }}
                variant='contained'
                className='w-full bg-green-800'
                type='submit'
                color='success'
              >
                Sign In
              </Button>
            </div>
          </form>
          <div className='flex  space-x-3 items-center mt-5'>
            <p className='m-0'>New Account</p>
            <Button
              variant='text'
              className='py-2 px-4 text-white bg-green-600 rounded-md'
              onClick={() => navigate("/signup")}>Sign Up</Button>
          </div>
        </div>
      </div>
      <div>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={snackBar}>
          <Alert onClose={snackBar}
            severity="success"
            sx={{ width: "100%" }}>
            Sign In Successful!
          </Alert>
        </Snackbar>
      </div>
    </div>
  )
}

export default Signin