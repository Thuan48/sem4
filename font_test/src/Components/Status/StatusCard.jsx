import React from 'react'
import { useNavigate } from 'react-router-dom'

const StatusCard = () => {
  const navigate = useNavigate();

  const handlerNavigate=()=>{navigate(`/status/{userId}`)}

  return (
    <div onClick={handlerNavigate} className='flex items-center p-3 cursor-pointer'>
      <div>
        <img
        className='h-7 w-7 lg:w-10 lg:h-10 rounded-full'
         src="https://cdn.pixabay.com/photo/2023/09/18/13/46/pile-8260617_1280.jpg" alt="" />
      </div>
      <div className=' ml-2 text-white'>
        <p>name</p>
      </div>
    </div>
  )
}

export default StatusCard