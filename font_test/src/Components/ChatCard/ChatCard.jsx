import React from 'react';

const ChatCard = ({ name, userImg, content, timestamp, count }) => {
  return (
    <div className='flex items-center justify-center py-2 group cursor-pointer'>
      <div className='w-[15%]'>
        <img className='h-10 w-10 rounded-full' src={userImg} alt="" />
      </div>
      <div className='pl-1 w-[85%]'>
        <div className='px-2 flex justify-between items-center'>
          <p className='text-lg'>{name}</p>
          <p className='text-sm'>{timestamp || null}</p> 
        </div>
        <div className='px-2 flex justify-between items-center'>
          <p>{content || null}</p>
          <div className='flex space-x-2 items-center'>
            <p className='text-xs py-1 px-2 text-white bg-red-500 rounded-full'>{count||null}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
