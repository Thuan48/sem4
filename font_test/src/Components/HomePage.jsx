import React, { useEffect, useState, useRef } from 'react';
import { TbCircleDashed } from "react-icons/tb"
import { AiOutlineSearch, AiOutlineDelete } from "react-icons/ai"
import { MdGroupAdd, MdOutlinePersonRemoveAlt1 } from "react-icons/md";
import { GrLogout } from "react-icons/gr";
import { IoIosPersonAdd } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";
import { BsEmojiSmile, BsMicFill, BsThreeDotsVertical, BsSun, BsMoon } from "react-icons/bs"
import { ImAttachment, ImProfile } from "react-icons/im"
import { useNavigate } from 'react-router-dom';
import { IconButton, Menu, MenuItem, Snackbar, SnackbarContent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { logout, currenUser, searchUser } from '../Redux/Auth/Action';
import { addUserGroup, createChat, deleteChat, getChats, getUserChat, removeUserGroup } from '../Redux/Chat/Action';
import { createMessage, getAllMessage } from '../Redux/Message/Action';
import SockJS from "sockjs-client/dist/sockjs";
import { over } from "stompjs";
import ChatCard from './ChatCard/ChatCard';
import MessageCard from './MessageCard/MessageCard';
import Profile from './Profile/Profile';
import CreateGroup from './Group/CreateGroup';
import AddMemberModal from './Group/AddMemberModal';
import RemoveMemberModal from './Group/RemoveMemberModal';
import { sendNotification } from '../Redux/Notification/Action';

export const HomePage = () => {
  const [isConnect, setIsConnect] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState();
  const [querys, setQuerys] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [content, setContent] = useState("");
  const [isProfile, setProfile] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messagePage, setMessagePage] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [openRemoveMemberModal, setOpenRemoveMemberModal] = useState(false);
  const [usersInGroup, setUsersInGroup] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [chatList, setChatList] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth, chat, message } = useSelector(store => store);
  const token = localStorage.getItem("token");
  const messageEndRef = useRef(null);
  const open = Boolean(anchorEl);
  const isAdmin = currentChat?.admin?.some(admin => admin.id === auth.reqUser.id);

  const handleShowSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  const openAddMember = () => {
    setOpenAddMemberModal(true);
  };
  const closeAddMember = () => {
    setOpenAddMemberModal(false);
  };
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleMessageScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && !loadingMessages) {
      setLoadingMessages(true);
      const previousPage = messagePage - 1;
      if (previousPage >= 0) {
        dispatch(getAllMessage({ chatId: currentChat.id, token, page: previousPage }))
          .then(() => {
            setMessagePage(previousPage);
            setLoadingMessages(false);
          })
          .catch(() => {
            setLoadingMessages(false);
          });
      } else {
        setLoadingMessages(false);
      }
    }
  };

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
  };
  const handlerSearch = (keyword) => {
    dispatch(searchUser({ keyword, token })).then(() => {
      const results = auth.searchUser.filter(user => user.id !== auth.reqUser.id);
      setFilteredResults(results);
    });
  };
  const handleClickOnChatCard = (userId) => {
    dispatch(createChat({ token, resData: { userId } }));
    setQuerys("");
  };
  const handleCreateNewMessage = () => {
    if (currentChat) {
      dispatch(createMessage({ token, resData: { chatId: currentChat.id, content } }));
      setContent("");
    } else {
      console.error("No current chat selected for sending message");
    }
  };
  const handleNavigate = () => setProfile(true);
  const handleBack = () => {
    dispatch(currenUser(token));
    setProfile(false);
  }
  const handleCurrentChat = (item) => {
    setCurrentChat(item)
    if (stompClient) {
      stompClient.subscribe("/group/" + item.id.toString(), onMessageRevice);
      stompClient.subscribe(`/chatUser/${item.id.toString()}`, onUserUpdateReceive);
    }
  };
  const handleAddMember = () => {
    dispatch(addUserGroup({ chatId: currentChat.id, userId, token }))
      .then(() => {
        setSnackbarMessage(`User ${userId} added to the group.`);
        setSnackbarOpen(true);
        handleClose();
      })
      .catch((error) => {
        console.error("Error adding member:", error);
        setSnackbarMessage(`Error adding user: ${error.message}`);
        setSnackbarOpen(true);
      });
  };
  const handleOutGroup = () => {
    if (currentChat) {
      const confirmed = window.confirm("Are you sure you want to leave this group?");
      if (confirmed) {
        dispatch(removeUserGroup(currentChat.id, auth.reqUser.id, token))
          .then(() => {
            setCurrentChat(null);
          })
          .catch((error) => {
            console.error("Error leaving group:", error);
          });
      }
    }
  };
  const handleOpenRemoveMemberModal = () => {
    if (currentChat) {
      setUsersInGroup(currentChat.users);
      setOpenRemoveMemberModal(true);
    }
  };
  const handleRemoveMember = (userId) => {
    const chatId = currentChat?.id;
    if (typeof chatId !== 'number' && typeof chatId !== 'string') {
      console.error("Invalid Chat ID:", chatId);
      return;
    }

    dispatch(removeUserGroup(chatId, userId, token))
      .then(() => {
        setUsersInGroup((prevUsers) => prevUsers.filter(user => user.id !== userId));
        setSnackbarMessage(`User ${userId} removed from the group.`);
        setSnackbarOpen(true);
        setOpenRemoveMemberModal(false);
      })
      .catch((error) => {
        console.error("Error removing member:", error);
      });
  };
  const handleDeleteGroup = () => {
    const confirmed = window.confirm("Are you sure you want to delete this chat?");
    if (confirmed) {
      dispatch(deleteChat({ chatId: currentChat.id, token }));
      handleClose();
    }
  };
  const createGroup = () => setIsGroup(true);
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const connect = () => {
    const sock = new SockJS("http://localhost:8080/ws");
    const temp = over(sock);
    setStompClient(temp);
    const headers = {
      Authorization: `Bearer ${token}`,
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN")
    }
    temp.connect(headers, onConnect, onError);
  }
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
  const onError = (error) => {
    console.log('WebSocket Error', error);
    setIsConnected(false);
  }
  const onConnect = () => {
    setIsConnect(true);
    if (stompClient && currentChat && currentChat.id && chatList) {
      stompClient.subscribe("/group/" + currentChat.id.toString, onMessageRevice);
      stompClient.subscribe(`/chatUser/${currentChat.id.toString}`, onUserUpdateReceive);
      stompClient.subscribe(`/topic/notifications`, onNotificationReceive);
      console.log("Connected to WebSocket");
      setIsConnected(true);
    } else {
      console.error("stompClient is undefined or currentChat is null");
    }
  };

  useEffect(() => {
    if (isConnect && stompClient && auth.reqUser && currentChat) {
      const subcription = stompClient.subscribe("/group/" + currentChat.id.toString, onMessageRevice);
      const Usersubcription = stompClient.subscribe(`/chatUser/${currentChat.id.toString}`, onUserUpdateReceive)
      return () => {
        subcription.unsubscribe();
        Usersubcription.unsubscribe();
      }
    }
  }, [isConnect, stompClient, auth.reqUser, currentChat]);

  useEffect(() => {
    connect();
  }, []);
  useEffect(() => {
    if (message.newMessage && stompClient) {
      setMessages((prevMessages) => [...prevMessages, message.newMessage])
      stompClient.send("/app/message", {}, JSON.stringify(message.newMessage));
    }
  }, [message.newMessage, stompClient])
  useEffect(() => {
    if (!stompClient || !currentChat || chat.chats) {
      console.log('No stompClient or currentChat');
      return;
    }
    stompClient.send("/app/updateChat",{},JSON.stringify(chat.chats))
  }, [stompClient, currentChat, chat.chats]); 

  const onMessageRevice = (payload) => {
    const reciveMessage = JSON.parse(payload.body);
    const { chat,content, timestamp } = reciveMessage;
    setMessages([...messages, reciveMessage]);
    setChatList((prevChats) => {
      return prevChats.map((chatItem) => {
        if (chatItem.id === chat.id) {
          return {
            ...chatItem,
            lastMessageContent: content,
            lastMessageTimestamp: timestamp,  
            unreadCount: (chatItem.unreadCount || 0) + 1, 
          };
        }
        return chatItem;  
      });
    });
  };
  const onNotificationReceive = (payload) => {
    const notification = JSON.parse(payload.body);
    console.log('Notification received:', notification);
    handleShowSnackbar(notification.message);
    dispatch(sendNotification(notification.title, notification.message));
  };

  useEffect(() => {
    if (isConnected && chat.chats.length > 0 && stompClient) {
      chat.chats.forEach((chat) => {
        stompClient.send("/app/updateUser", {}, JSON.stringify(chat));
      });
    }
  }, [chat.chats, isConnected, stompClient]);

  const onUserUpdateReceive = (payload) => {
    setChatList((prevChats) => {
      const updatedChats = prevChats.map((chatItem) => {
        if (chatItem.id === chat.id) {
          return {
            ...chatItem,
            lastMessageContent: content,
            lastMessageTimestamp: timestamp,
            unreadCount: (chatItem.unreadCount || 0) + 1,
          };
        }
        return chatItem;
      });
      return updatedChats;
    });

  };
  
  useEffect(() => {
    if (chat.chats.length > 0) {
      setChatList(chat.chats);
    }
  }, [chat.chats]);
  useEffect(() => {
    setMessages(message.messages)
  }, [message.messages])
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (token) {
      dispatch(currenUser(token))
    };
  }, [token, dispatch]);
  useEffect(() => {
    if (!auth.reqUser) navigate('/signin');
  }, [auth.reqUser, navigate]);
  useEffect(() => {
    //dispatch(getUserChat({ token }));
    dispatch(getChats({ token }));
  }, [chat.createChat, chat.createGroup, dispatch, token]);
  useEffect(() => {
    const pageSize = 7;
    if (currentChat?.id) {
      const totalMessages = messages.length;
      const lastPage = Math.floor((totalMessages - 1) / pageSize);

      if (totalMessages === 0) {
        dispatch(getAllMessage({ chatId: currentChat.id, token }));
      } else {
        dispatch(getAllMessage({ chatId: currentChat.id, token, pageSize, pageNumber: lastPage }));
      }
    }
  }, [currentChat, message.newMessage, dispatch, token]);

  const imageUrl = auth.reqUser?.profile_picture
    ? `http://localhost:8080/uploads/profile/${auth.reqUser.profile_picture}`
    : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png";

  return (
    <div className={`relative ${isDarkMode ? 'dark' : ''}`}>
      <div className="w-full py-14 bg-primary dark:bg-gray-800"></div>
      <div className="flex bg-background dark:bg-gray-900 h-[90vh] pt-5 absolute top-6 left-6 right-6 rounded-lg shadow-lg overflow-hidden">
        <div className="w-1/3 bg-card dark:bg-gray-800 text-card-foreground dark:text-white h-full border-r border-border dark:border-gray-700">
          {isGroup && <CreateGroup setIsGroup={setIsGroup} />}
          {isProfile && <Profile handleNavigate={handleBack} />}
          {!isProfile && !isGroup && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <img onClick={handleNavigate} className="rounded-full w-10 h-10 cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200"
                    src={imageUrl} alt="" />
                  <p className="font-semibold">{auth.reqUser?.full_name}</p>
                </div>
                <div className="flex space-x-4 text-2xl">
                  <TbCircleDashed
                    className="cursor-pointer hover:text-primary dark:hover:text-teal-400 transition-colors"
                    onClick={() => navigate("/status")}
                  />
                  <ImProfile
                    className="cursor-pointer hover:text-primary dark:hover:text-teal-400 transition-colors"
                    onClick={handleNavigate}
                  />
                  <GrLogout
                    className="cursor-pointer hover:text-primary dark:hover:text-teal-400 transition-colors"
                    onClick={handleLogout}
                  />
                </div>
              </div>
              <div className="relative flex justify-center items-center bg-background dark:bg-gray-900 p-4">
                <div className="relative flex items-center">
                  <input
                    className="w-full py-2 pl-10 pr-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:border-teal-500 dark:focus:border-teal-400"
                    type="text"
                    placeholder="Search..."
                    onChange={(e) => {
                      setQuerys(e.target.value);
                      handlerSearch(e.target.value);
                    }}
                    value={querys || ""}
                  />
                  <AiOutlineSearch className="absolute left-3 text-gray-400 dark:text-gray-500" />
                </div>
                <MdGroupAdd onClick={createGroup}
                  className="ml-7 text-4xl cursor-pointer hover:text-primary dark:hover:text-teal-400 transition-colors" />
              </div>
              <div className="overflow-auto flex-grow py-1 ml-4">
                {querys && filteredResults.map((user) => (
                  <div key={user.id} onClick={() => handleClickOnChatCard(user.id)} className="chat-item">
                    <ChatCard
                      name={user.full_name}
                      userImg={user.profile_picture
                        ? `http://localhost:8080/uploads/profile/${user.profile_picture}`
                        : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"
                      }
                      content={null}
                      timestamp={null}
                    />
                  </div>
                ))}

                {!querys && chatList.length > 0 && chatList.map((item) => {
                  const isGroupChat = item.group;
                  const chatName = isGroupChat ? item.chatName : item.userName;
                  const chatImage = isGroupChat && item.chatImage
                    ? `http://localhost:8080/uploads/groupchat/${item.chatImage}`
                    : `http://localhost:8080/uploads/profile/${item.userImage}`;

                  const lastMessageContent = item.lastMessageContent || '';
                  const lastMessageTimestamp = item.lastMessageTimestamp
                    ? new Date(item.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <div key={item.id} onClick={() => handleCurrentChat(item)} className="chat-item">
                      <ChatCard
                        name={chatName}
                        userImg={chatImage}
                        content={lastMessageContent}
                        timestamp={lastMessageTimestamp}
                        count={item.unreadCount || 0} 
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 bg-background dark:bg-gray-900 flex flex-col">
          {currentChat && (
            <>
              <div className='header sticky top-0 z-10 bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-700 dark:to-teal-800 text-white shadow-md'>
                <div className='flex justify-between items-center px-4 py-3'>
                  <div className='flex items-center space-x-4'>
                    <img
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      src={
                        currentChat.group
                          ? currentChat.chatImage
                            ? `http://localhost:8080/uploads/groupchat/${currentChat.chatImage}`
                            : "https://cdn.pixabay.com/photo/2017/11/10/05/46/group-2935521_1280.png"
                          : currentChat.userImage
                            ? `http://localhost:8080/uploads/profile/${currentChat.userImage}`
                            : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"
                      }
                      alt=""
                    />
                    <p className={`relative text-lg font-semibold truncate ${isDarkMode ? 'dark' : ''}`}>
                      {currentChat.group
                        ? currentChat.chatName || "Unnamed Group"
                        : currentChat.userName || "Unknown User"}
                    </p>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <BsThreeDotsVertical
                      onClick={handleClick}
                      className='text-2xl cursor-pointer hover:text-teal-200 transition-colors' />
                    <Menu
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                    >
                      {currentChat.group ? [
                        <MenuItem key="add-member" onClick={openAddMember}>
                          <IoIosPersonAdd />
                          Add Member
                        </MenuItem>,
                        <MenuItem key="remove-member" onClick={handleOpenRemoveMemberModal}>
                          <MdOutlinePersonRemoveAlt1 />
                          Remove Member
                        </MenuItem>,
                        <MenuItem key="out-group" onClick={handleOutGroup}>
                          <FaSignOutAlt />
                          Out Group
                        </MenuItem>,
                        isAdmin && (
                          <MenuItem key="delete-group" onClick={handleDeleteGroup}>
                            <AiOutlineDelete />
                            Delete Chat
                          </MenuItem>
                        ),] : [
                        <MenuItem key="profile">
                          <ImProfile />
                          Profile
                        </MenuItem>,
                        <MenuItem key="delete-chat" onClick={handleDeleteGroup}>
                          <AiOutlineDelete />
                          Delete Chat
                        </MenuItem>,
                      ]}
                    </Menu>
                    <AddMemberModal
                      openAddMemberModal={openAddMemberModal}
                      closeAddMember={closeAddMember}
                      auth={auth.searchUser}
                      chatId={currentChat.id}
                      handleAddMember={handleAddMember}
                    />
                    <RemoveMemberModal
                      open={openRemoveMemberModal}
                      onClose={() => setOpenRemoveMemberModal(false)}
                      users={usersInGroup}
                      onRemove={handleRemoveMember}
                    />
                    <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors">
                      {isDarkMode ? <BsSun className="text-xl" /> : <BsMoon className="text-xl" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100 dark:bg-gray-800" onScroll={handleMessageScroll}>
                {messages && messages.length > 0 && [...messages].reverse().map((msg) => (
                  <div key={msg.id} className={`flex ${msg.user.id !== auth.reqUser.id ? 'justify-start' : 'justify-end'}`}>
                    <MessageCard
                      isReqUserMessage={msg.user.id !== auth.reqUser.id}
                      content={msg.content}
                      userName={msg.user.full_name}
                      timestamp={msg.timestamp}
                    />
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 shadow-inner">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full shadow-sm">
                  <BsEmojiSmile className="text-gray-500 dark:text-gray-400 mx-3 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors" />
                  <input
                    className="flex-1 py-2 px-4 bg-transparent focus:outline-none text-gray-700 dark:text-gray-200"
                    type="text"
                    placeholder="Type a message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateNewMessage();
                      }
                    }}
                  />
                  <ImAttachment className="text-gray-500 dark:text-gray-400 mx-3 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors" />
                  <BsMicFill className="text-gray-500 dark:text-gray-400 mx-3 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors" />
                </div>
              </div>
            </>
          )}
          {!currentChat && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <img src="https://static6.depositphotos.com/1006463/608/i/450/depositphotos_6088794-stock-photo-3d-bubble-talk-on-white.jpg" alt="" className="w-64 h-64 mb-6" />
              <h1 className="text-4xl font-bold text-primary dark:text-teal-400 mb-4">Start Messaging</h1>
              <p className="text-muted-foreground dark:text-gray-400 max-w-md">
                Send messages as fast as 3G network speed. Helps you send messages to friends and relatives with high security (don't mind admin).
              </p>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          .chat-item {
            transition: background-color 0.3s ease;
          }
          .chat-item:hover {
            background-color: rgba(0, 149, 119, 0.1);
          }
          .dark .chat-item:hover {
            background-color: rgba(0, 149, 119, 0.2);
          }
            .modal {
            display: none;
          }
          .modal.open {
            display: block; 
          }
        `}
      </style>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <SnackbarContent
          sx={{
            backgroundColor: 'success.main', // Hoặc 'error.main' tùy theo loại thông báo
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
          }}
          message={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <BsEmojiSmile style={{ marginRight: 8 }} /> {/* Thêm biểu tượng */}
              {snackbarMessage}
            </span>
          }
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >

            </IconButton>
          }
        />
      </Snackbar>
    </div>
  );
};  