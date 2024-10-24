import React, { useState } from 'react'
import { MdOutlineSubdirectoryArrowLeft } from "react-icons/md";
import SelectMember from './SelectMember';
import ChatCard from '../ChatCard/ChatCard';
import { FaArrowRightToBracket } from "react-icons/fa6";
import NewGroup from './NewGroup';

const CreateGroup = () => {
  const [newGroup, setNewGroup] = useState(false);
  const [query, setQuerys] = useState("");
  const [groupMember, setGroupMember] = useState(new Set());
  const removeMember = (item) => {
    groupMember.delete(item);
    setGroupMember(groupMember);
  };
  const handlerSearch = () => { }

  return (
    <div className='w-full h-full'>
      {!newGroup && (
        <div>
          <div className='flex items-center space-x-10 bg-slate-700-700 text-white pt-16 px-10 pb-5'>
            <MdOutlineSubdirectoryArrowLeft
              className='cursor-pointer text-3xl font-bold hover:text-red-300' />
            <p className='text-4xl font-semibold'>Add Group</p>
          </div>
          <div className='relative bg-white py-4 px-3'>
            <div className='flex space-x-2 flex-wrap space-y-1'>
              {groupMember.size > 0 &&
                Array.from(groupMember).map((item) => (<SelectMember removeMember={() => removeMember(item)} member={item}
                />
                ))}
            </div>
            <input type="text" onChange={(e) => {
              handlerSearch(e.target.value)
              setQuerys(e.target.value)
            }}
              className='text-black outline-none border-b border-[#8888] p-2 w-[90%]'
              placeholder='Search User'
              value={query}
            />
          </div>
          <div className='bg-white overflow-auto h-[50%.2vh] px-4'>
            {query && [1, 1, 1, 1, 1].map((item) =>
              <div
                className='text-black'
                onClick={() => {
                  groupMember.add(item)
                  setGroupMember(groupMember)
                  setQuerys("")
                }}
                key={item?.id}
              ><hr />
                <ChatCard />
              </div>
            )}
          </div>
          <div
            onClick={() => {
              setNewGroup(true)
            }}
            className='bottom-10 py-10 flex items-center justify-center'

          >
            <div className='bg-red-600 rounded-full p-4 cursor-pointer'>
              <FaArrowRightToBracket className='text-white font-bold text-4xl hover:text-blue-400' />
            </div>
          </div>
        </div>
      )}
      {newGroup && <NewGroup />}
    </div>
  );
};

export default CreateGroup