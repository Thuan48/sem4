import React, { useState } from 'react'
import { BsArrowLeft, BsCheck2Square, BsPencilSquare } from "react-icons/bs"
import { useNavigate } from 'react-router-dom'

const Profile = ({ handleNavigate }) => {
  const navigate = useNavigate();
  const [flag, setFlag] = useState(false);
  const [username, setUsername] = useState(null);


  const handlerFlag = () => {
    setFlag(true);
  }
  const handlerCheck = () => {
    setFlag(false);
  }
  const handleChange = (e) => { 
    setUsername(e.target.value); 
    console.log(username);
  }
  return (
    <div className='w-full h-full'>
      {/* image */}
      <div
        className='flex items-center spacce-x-10 bg-[#008069] text-white pt-16 px-10 pb-5'>
        <BsArrowLeft className='cursor-pointer text-2xl font-bold'
          onClick={handleNavigate} />
        <p className='cursor-pointer font-semibold'>Profile</p>
      </div>
      <div className='flex flex-col justify-center items-center my-12'>
        <label htmlFor="imgInput">
          <img
            className='rounded-full w-[11vw] h-[11vw] cursor-pointer'
            src="https://cdn.pixabay.com/photo/2024/09/23/23/38/piggy-bank-9070156_640.jpg" alt="" />
        </label>
        <input type="file" id='imgInput' className='hidden' />
      </div>

      {/* name */}
      <div className='bg-white text-black px-3'>
        <p className='py-3'>your name</p>

        {!flag && <div className='w-full flex justity-between items-center'>
          <p className='py-3'>{username || "username"}</p>
          <BsPencilSquare onClick={handlerFlag} className='cursor-pointer' />
        </div>}

        {flag && <div className='w-full flex justity-between items-center py-2'>
          <input onChange={handleChange} type="text" className='border-b-2 outline-none rounded-md w-[80%] border-600 p-2' placeholder='Enter your name' />
          <BsCheck2Square onClick={handlerCheck} className='cursor-pointer text-2xl' />
        </div>}

      </div>
    </div>
  )
}

export default Profile