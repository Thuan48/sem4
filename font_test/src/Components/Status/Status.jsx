import React from 'react'
import StatusCard from './StatusCard'
import { AiOutlineClose } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'

const Status = () => {
const navigate=useNavigate();
const handleNavigate=()=>{
  navigate(-1); 
}


  return (
    <div>
      <div className='flex items-center px-[14vm] py-[7vh]'>
        {/* left */}
        <div className='left h-[85vh] bg-[#1e262c] lg:w-[30%] w-[50%] px-5'>
          <div className='pt-5 h-[13%]'>
            <StatusCard />
          </div><hr />
          <div className='overflow-auto h-[86%] pt-2'>
            {[1, 1, 1, 1, 1, 1].map((item) => <StatusCard />)}
          </div>
        </div>

        {/* right */}

        <div className='relative h-[85vh] lg:w-[70%] w-[50%] bg-[#0b141a]'>
         <AiOutlineClose onClick={handleNavigate} className='text-white cursor-pointer absolute top-5 right-10 text-xl'/>
        </div>
      </div>
    </div>
  )
}

export default Status