import React, { useEffect, useState } from 'react';
import { TbCircleDashed } from "react-icons/tb"
import { BiCommentDetail } from "react-icons/bi"
import { AiOutlineSearch } from "react-icons/ai"
import { MdGroupAdd } from "react-icons/md";
import { GrLogout } from "react-icons/gr";
import { BsEmojiSmile, BsFilter, BsMicFill, BsThreeDotsVertical } from "react-icons/bs"
import { ImAttachment, ImProfile } from "react-icons/im"
import ChatCard from './ChatCard/ChatCard';
import MessageCard from './MessageCard/Messagecard';
import Profile from './Profile/Profile';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem } from '@mui/material';
import CreateGroup from './Group/CreateGroup';
import { useDispatch, useSelector } from 'react-redux';
import { logout, currenUser, searchUser } from '../Redux/Auth/Action';
import { createChat, getUserChat } from '../Redux/Chat/Action';
import { createMessage, getAllMessage } from '../Redux/Message/Action';

export const HomePage = () => {
  const [querys, setQuerys] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [content, setContent] = useState("");
  const [isProfile, setProfile] = useState(false);
  const navigate = useNavigate();
  const [isGroup, setIsGroup] = useState(false);
  const dispatch = useDispatch();
  const { auth, chat, message } = useSelector(store => store);
  const token = localStorage.getItem("token");

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    dispatch(logout())
    navigate("/signin")
  }
  const handlerSearch = (keyword) => {
    dispatch(searchUser({ keyword, token }))
  }

  const handlerCreatechat = (userId) => {

  }

  const handleClickOnChatCard = (userId) => {
    dispatch(createChat({ token, resData: { userId } }));
    setQuerys("")
  }

  const handleCreateNewMessage = () => {
    dispatch(createMessage({ token, resData: { chatId: currentChat.id, content: content }, }))
  }

  const handleNavigate = () => { setProfile(true) }

  const handleBack = () => { setProfile(false); }

  const handleCurrentChat = (item) => {
    setCurrentChat(item);
  }

  const createGroup = () => {
    setIsGroup(true)
  }
  useEffect(() => {
    if (token) {
      dispatch(currenUser(token));
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (!auth.reqUser) {
      navigate('/signin')
    }
  }, [auth.reqUser])

  useEffect(() => {
    dispatch(getUserChat({ token }))
  }, [chat.createChat, chat.createGroup]);

  useEffect(() => {
    if (currentChat?.id) dispatch(getAllMessage({ chatId: currentChat.id, token }))
  }, [currentChat,message.newMessage])

  return (
    <div className="relative " >
      <div className="w-full py-14 bg-[#009577]"></div>

      <div className="flex bg-[#f0f2f5] h-[90vh] pt-5 absolute top-6 left-6 w-full">
        <div className="left w-[30%] bg-[#333333] text-white h-full">

          {/* profile */}
          {isGroup && <CreateGroup />}
          {isProfile && <div className='w-full h-full'>
            <Profile handleNavigate={handleBack} />
          </div>}
          {!isProfile && !isGroup && <div className='w-full'>

            {<div className='flex justify-between items-center px-2 py-3'>
              <div className='flex items-center space-pointer px-3 py-1'>
                <img onClick={handleNavigate} className='rounded-full w-10 h-10 cursor-pointer'
                  src={auth.reqUser?.profile_picture
                    || "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"} alt="" />
                <p className='plex items-center px-1 py-3'>
                  {auth.reqUser?.full_name}
                </p>
              </div>
              <div className='space-x-2 text-4xl flex'>
                <TbCircleDashed className='cursor-pointer hover:text-red-300' onClick={() => navigate("/status")} />
                <BiCommentDetail className='hover:text-red-300' />
                <div>
                  <BsThreeDotsVertical id="basic-button"
                    aria-controls={open ? 'menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    className='hover:text-red-300'
                  />
                  <Menu
                    id="menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    <MenuItem onClick={handleClose}><ImProfile className='hover:text-blue-600' /></MenuItem>
                    <MenuItem onClick={createGroup}><MdGroupAdd className='hover:text-red-300' /></MenuItem>
                    <MenuItem onClick={handleLogout}><GrLogout className='hover:text-red-700' /></MenuItem>
                  </Menu>
                </div>

              </div>
            </div>}

            <div className='relative flex justify-center items-center bg-white py-4 px-3'>
              <input
                className='border-none text-black outline-none bg-slate-300 rounded-md w-[95%] pl-6'
                type="text"
                placeholder='Search...'

                onChange={(e) => {
                  setQuerys(e.target.value)
                  handlerSearch(e.target.value)
                }}
                value={querys || ""}
              />

              <AiOutlineSearch className='left-4 top-5 absolute' />
              <div>
                <BsFilter className='ml-3 text-2xl' />
              </div>
            </div>

            {/*list */}
            <div className='overflow-auto h-[70vh] px-3'>
              {querys && auth.searchUser?.map((i) => (
                <div key={i.id} onClick={() => handleClickOnChatCard(i.id)}><hr />
                  <ChatCard
                    name={i.full_name}
                    userImg={
                      i.profile_picture ||
                      "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"
                    }
                  />
                </div>
              ))}
              {chat.chats.length > 0 && !querys && chat.chats?.map((item) => (
                <div key={item.id} onClick={() => handleCurrentChat(item)}>
                  <hr />
                  {item.is_group ? (
                    <ChatCard
                      name={item.chat_name}
                      userImg={
                        item.chat_image ||
                        "https://cdn.pixabay.com/photo/2017/11/10/05/46/group-2935521_1280.png"
                      }
                    />
                  ) : (
                    <ChatCard
                      isChat={true}
                      name={
                        item.users && item.users.length > 1 && auth.reqUser
                          ? auth.reqUser.id !== item.users[0]?.id
                            ? item.users[0].full_name
                            : item.users[1].full_name
                          : "Unknown User"
                      }
                      userImg={
                        item.users && item.users.length > 1 && auth.reqUser
                          ? auth.reqUser.id !== item.users[0]?.id
                            ? item.users[0].profile_picture ||
                            "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"
                            : item.users[1].profile_picture ||
                            "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"
                          : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"
                      }
                    />
                  )}
                </div>
              ))}

            </div>
          </div>}
        </div>

        {/*chat */}
        {!currentChat && <div className='flex-1 bg-[#a0a0a0] w-[70%] flex flex-col items-center justify-center h-full '>
          <div className='max-w-[60%] text-center '>
            <img src="https://static6.depositphotos.com/1006463/608/i/450/depositphotos_6088794-stock-photo-3d-bubble-talk-on-white.jpg" alt="" />
            <h1 className=' text-4xl text-light-600'>Message......</h1>
            <p className='my-1'>Send messages as fast as 3G network speed. Helps you send messages to friends and relatives with high security<br />(don't mind admin).
            </p>
          </div>
        </div>}

        {/* send message*/}
        {currentChat && <div className=' text-white border bg-[#a0a0a0] w-[65%] relative'>
          <div className=' header absolute top-0 h-20 w-full bg-[#333333]'>
            <div className='flex justify-between'>
              <div className='py-3 space-x-5 flex items-center px-4'>
                <img className='w-12 h-12 rounded-full'
                  src={currentChat.is_group ? currentChat.chat_image
                    || "https://cdn.pixabay.com/photo/2017/11/10/05/46/group-2935521_1280.png"
                    : (auth.reqUser.id !== currentChat.users[0]?.id
                      ? currentChat.users[0].profile_picture ||
                      "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"
                      : currentChat.users[1].profile_picture ||
                      "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png")
                  }
                  alt="" />
                <p >
                  {currentChat.is_group ? currentChat.chat_name : (auth.reqUser?.id === currentChat.users[0].id
                    ? currentChat.users[1].full_name : currentChat.users[0].full_name)}
                </p>
              </div>
              <div className='py-3 space-x-5 flex items-center px-3 '>
                <AiOutlineSearch />
                <BsThreeDotsVertical />
              </div>
            </div>
          </div>

          {/* read message */}
          <div className='px-10 h-[80vh] overflow-y-scroll'>
            <div className='text-black space-y-4 flex flex-col justify-center mt-15 py-4'>
              {message.messages.length > 0 && message.messages?.map((msg, i) => (
                <MessageCard
                  key={i}
                  isReqUserMessage={msg.user.id !== auth.reqUser.id}
                  content={msg.content}
                />
              ))}
            </div>
          </div>

          <div className='footer bg-[#f0f2f5] absolute bottom-0 w-full py-3 text-2xl'>
            <div className='flex justify-between items-center px-5 relative'>

              <BsEmojiSmile className='text-black cursor-pointer' />
              <ImAttachment className='text-black' />

              <input className='py-3 outline-none border-none bg-black pl-4 rounded-md w-[80%]'
                type=" text"
                onChange={(e) => setContent(e.target.value)}
                placeholder='message...'
                value={content}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateNewMessage();
                    setContent("");
                  }
                }}
              />
              <BsMicFill className='text-black' />
            </div>
          </div>
        </div>}

      </div>
    </div>

  );
};
