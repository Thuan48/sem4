import React, { useEffect, useState } from 'react'
import { stories } from './StoryStatus'
import ProcessBar from './ProcessBar';
import { BsArrowLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';


const StatusView = () => {
  const [curentStoryIndex, setCurentStory] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const backStory =()=>{
    navigate(-1);
  }

  const handlerNext = () => {
    if (curentStoryIndex < stories?.length - 1) {
      setCurentStory(curentStoryIndex + 1);
      setActiveIndex(activeIndex + 1);
    }
    else {
      setCurentStory(0);
      setActiveIndex(0);
    }
  }
  useEffect(() => {
    const interval = setInterval(() => {
      handlerNext();
    }, 5000)
    return () => clearInterval(interval);
  }, [curentStoryIndex])
  return (
    <div>
      <div className='relative flex justify-center items-center h-[100vh] bg-slate-900'>
        <div className='relative'>
          <img
            className='max-h[96vh] object-contain'
            src={stories?.[curentStoryIndex].image} alt="" />
          <div className='absolute top-0 flex w-full'>
            {stories.map((iten, index) => <ProcessBar key={index} duration={5000} index={index} activeIndex={activeIndex} />)}
          </div>
        </div>
        <div>
          <BsArrowLeft onClick={backStory} className='text-slate-600 text-6xl cursor-pointer absolute top-10 left-10' />
          <AiOutlineClose onClick={backStory} className='text-slate-600 text-6xl cursor-pointer absolute top-10 right-10'/>
        </div>
      </div>
    </div>
  )
}

export default StatusView