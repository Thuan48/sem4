import React from 'react'
import { AiOutlineClose } from 'react-icons/ai'

const SelectMember = (removeMember,member) => {
  
  return (
    <div className='flex items-center bg-slate-400 rounded-full'>
      <img 
      className='w-7 h-7 rounded-full'
      src="https://cdn.pixabay.com/photo/2024/06/05/19/45/mountains-8811206_640.jpg" alt="" />
      <p className='px-2'> username</p>
      <AiOutlineClose onClick={removeMember} className='pr-1 cursor-pointer'/>
    </div>
  )
}

export default SelectMember