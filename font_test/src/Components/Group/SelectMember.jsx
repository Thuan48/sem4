import React from 'react'
import { AiOutlineClose } from 'react-icons/ai'

const SelectMember = ({ removeMember, member }) => {

  const profileImageUrl = member.profile_picture
    ? `http://localhost:8080/uploads/profile/${member.profile_picture}`
    : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png";

  return (
    <div className='flex items-center bg-slate-400 rounded-full'>
      <img
        className='w-7 h-7 rounded-full'
        src={profileImageUrl || "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"}
        alt={member.full_name}
      />
      <p className='px-2'>{member.full_name}</p>
      <AiOutlineClose onClick={removeMember} className='pr-1 cursor-pointer' />
    </div>
  )
}

export default SelectMember