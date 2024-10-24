import { CircularProgress } from '@mui/material'
import React, { useState } from 'react'
import { BsCheck2 } from 'react-icons/bs';
import { MdOutlineSubdirectoryArrowLeft } from 'react-icons/md'

const NewGroup = () => {
  const [isImageload, setIsImageLoad] = useState(false);
  const [groupName, setGroupname] = useState();

  return (
    <div className='w-full h-full'>
      <div className='flex items-center space-x-10 bg-[#33333] text-white pt-16 px-10 pb-5'>
        <MdOutlineSubdirectoryArrowLeft
          className='cursor-pointer text-2xl font-bold' />
        <p className='font-semibold'>New Group</p>
      </div>
      <div className='flex flex-col justify-center items-center my-12' >
        <label htmlFor="ImgInput" className='relative'>
          <img src="https://cdn.pixabay.com/photo/2024/09/05/08/52/watzmann-9024268_640.jpg" alt="" />
          {isImageload && (
            <CircularProgress className='absolute top-[5rem] left-[6rem]' />
          )}
        </label>
        <input
          onChange={() => console.log("imageOnChange")}
          type="file"
          className='hidden'
          id="ImgInput"
        />
      </div>
      <div className='w-full flex justify-between items-center py-2 px-5'>
        <input className='w-full outline-none border-b-2 border-green-700 px-2 bg-transparent'
          placeholder='Group Name'
          value={groupName}
          type="text" onChange={(e) => setGroupname(e.target.value)} />
      </div>
      {groupName &&
        <div className='py-10 flex items-center justify-center'>
          <botton>
            <div className='bg-[#0c977d] rounded-full p-4'>
              <BsCheck2 className='text-white font-bold text-4xl' />
            </div>
          </botton>
        </div>
      }
    </div>
  )
}

export default NewGroup