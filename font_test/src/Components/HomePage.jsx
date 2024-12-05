import React, { useEffect, useState, useRef } from 'react';
import { AiOutlineSearch, AiOutlineDelete } from "react-icons/ai"
import { MdDynamicFeed, MdGroupAdd, MdOutlinePersonRemoveAlt1 } from "react-icons/md";
import { GrLogout } from "react-icons/gr";
import { IoIosPersonAdd } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";
import { BsEmojiSmile, BsMicFill, BsThreeDotsVertical, BsSun, BsMoon, BsArrowUp } from "react-icons/bs"
import { ImAttachment, ImProfile } from "react-icons/im"
import { useNavigate } from 'react-router-dom';
import { IconButton, Menu, MenuItem, Snackbar, SnackbarContent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { logout, currenUser, searchUser, updateUser, updateProfile } from '../Redux/Auth/Action';
import { addUserGroup, createChat, deleteChat, getChatMembers, getChats, getUserChat, removeUserGroup } from '../Redux/Chat/Action';
import { createMessage, deleteMessage, getAllMessage } from '../Redux/Message/Action';
import SockJS from "sockjs-client/dist/sockjs";
import { over } from "stompjs";
import ChatCard from './ChatCard/ChatCard';
import MessageCard from './MessageCard/MessageCard';
import Profile from './Profile/Profile';
import CreateGroup from './Group/CreateGroup';
import AddMemberModal from './Group/AddMemberModal';
import RemoveMemberModal from './Group/RemoveMemberModal';
import { sendNotification } from '../Redux/Notification/Action';
import EmojiPicker from 'emoji-picker-react';
import UserProfileCard from './Profile/UserProfileCard';
import UserCard from './Profile/UserCard';
import { REQ_USER, UPDATE_USER, UPDATE_USER_PROFILE } from '../Redux/Auth/ActionType';

export const HomePage = () => {
  const [isConnect, setIsConnect] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState();
  const [querys, setQuerys] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [content, setContent] = useState("");
  const [isProfile, setProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(false);
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
  const [image, setImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userCardOpen, setUserCardOpen] = useState(false);
  const [selectedUserCardId, setSelectedUserCardId] = useState(null);
  const [anchorElSecondMenu, setAnchorElSecondMenu] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth, chat, message } = useSelector(store => store);
  const token = localStorage.getItem("token");
  const messageEndRef = useRef(null);
  const open = Boolean(anchorEl);
  const isAdmin = currentChat?.userAdminIds?.includes(auth.reqUser.id) || false;
  const pageSize = 7;
  const openSecondMenu = Boolean(anchorElSecondMenu);

  const handleCloseSecondMenu = () => {
    setAnchorElSecondMenu(null);
  };
  const handleEmojiClick = (emojiObject) => {
    setContent(prevContent => prevContent + emojiObject.emoji);
  };
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
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleMessageScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && !loadingMessages) {
      setLoadingMessages(true);
      const previousPage = messagePage - 1;
      if (previousPage >= 0) {
        dispatch(getAllMessage({ chatId: currentChat.id, token, pageSize, pageNumber: previousPage }))
          .then((newMessages) => {
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
  const handleClickSecond = (event) => setAnchorElSecondMenu(event.currentTarget);
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
  const handleCreateNewMessage = async () => {
    if (currentChat) {
      try {
        if (!content && !image) return;
        const messageData = {
          userId: auth.reqUser.id,
          chatId: currentChat.id,
          content: content,
          image: image,
          token: token,
        };

        dispatch(createMessage(messageData));
        setContent("");
        setImage(null);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error("No current chat selected for sending message");
    }
  };
  const handleNavigate = () => setProfile(true);
  const handleNavigateProfile = () => {
    setUserProfile(true);
    handleClose();
  };
  const handleOpenUserCard = (userId) => {
    setSelectedUserCardId(userId);
    setUserCardOpen(true);
  }
  const handleBack = () => {
    dispatch(currenUser(token));
    setProfile(false);
  }
  const handlebackProfile = () => {
    dispatch(currenUser(token));
    setUserProfile(false);
  }
  const handleCurrentChat = (item) => {
    setCurrentChat(item)
    setChatList((prevChats) => {
      return prevChats.map((chatItem) => {
        if (chatItem.id === item.id) {
          return {
            ...chatItem,
            unreadCount: 0,
          };
        }
        return chatItem;
      });
    });
    if (stompClient) {
      stompClient.subscribe("/group/" + item.id.toString(), onMessageRevice);
      stompClient.subscribe("/group/" + item.id.toString() + "/delete", onDeleteMessageReceive);
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
      dispatch(getChatMembers(currentChat.id, token))
        .then((members) => {
          setUsersInGroup(members);
          setOpenRemoveMemberModal(true);
        })
        .catch((error) => {
          console.error("Error fetching chat members:", error);
        });
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
  const handleDeleteMessage = (messageId) => {
    dispatch(deleteMessage(messageId, token, stompClient, currentChat.id))
      .then(() => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      })
      .catch(error => {
        console.error("Error deleting message:", error);
      });
  };
  const getOtherUserId = () => {
    if (currentChat && !currentChat.group) {
      return currentChat.userId || null;
    }
    return null;
  };
  const connect = async () => {
    try {
      const sock = new SockJS("http://localhost:8080/ws");
      const temp = over(sock);
      setStompClient(temp);
      const headers = {
        Authorization: `Bearer ${token}`,
        "X-XSRF-TOKEN": getCookie("XSRF-TOKEN")
      };

      await temp.connect(headers, onConnect, onError);
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
    }
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
    if (stompClient) {
      stompClient.subscribe('/chatList', onChatListReceive);
      stompClient.subscribe(`/topic/notifications`, onNotificationReceive);
      if (currentChat && currentChat.id) {
        stompClient.subscribe("/group/" + currentChat.id.toString(), onMessageRevice);
        stompClient.subscribe("/group/" + currentChat.id.toString() + "/delete", onDeleteMessageReceive);
      }
      setIsConnected(true);
    } else {
      console.error("stompClient is undefined or currentChat is null");
    }
  };

  useEffect(() => {
    if (stompClient && currentChat) {
      const messsageSub = stompClient.subscribe("/group/" + currentChat.id.toString(), onMessageRevice);
      const deleteMesssageSub = stompClient.subscribe("/group/" + currentChat.id.toString() + "/delete");
      const userUpdateSub = stompClient.subscribe('/topic/userUpdates', (payload) => {
        const updatedUser = JSON.parse(payload.body);
        if (updatedUser.id === auth.reqUser.id) {
          dispatch({ type: UPDATE_USER_PROFILE, payload: updatedUser });
          //dispatch({ type: UPDATE_USER, payload: updatedUser });
        }
      });
      return () => {
        messsageSub.unsubscribe();
        deleteMesssageSub.unsubscribe();
        userUpdateSub.unsubscribe();
      }
    }
  }, [stompClient, currentChat, dispatch]);

  useEffect(() => {
    connect();
  }, []);
  useEffect(() => {
    if (message.newMessage && stompClient) {
      setMessages((prevMessages) => [...prevMessages, message.newMessage])
      stompClient.send("/app/message", {}, JSON.stringify(message.newMessage));
    }
  }, [message.newMessage, stompClient])

  const onChatListReceive = (payload) => {
    const chatList = JSON.parse(payload.body);
    setChatList(chatList);
  };
  const onDeleteMessageReceive = (payload) => {
    const deletedMessage = JSON.parse(payload.body);
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== deletedMessage.id));
  };
  const onMessageRevice = (payload) => {
    const reciveMessage = JSON.parse(payload.body);
    const { chat, content, timestamp } = reciveMessage;
    setChatList((prevChats) => {
      const updatedChatList = prevChats.map((chatItem) => {
        if (chatItem.id === chat.id) {
          return {
            ...chatItem,
            lastMessageContent: content,
            lastMessageTimestamp: timestamp,
            unreadCount: chatItem.id === currentChat?.id ? 0 : (chatItem.unreadCount || 0) + 1,
          };
        }
        return chatItem;
      }).sort((a, b) => {
        if (b.unreadCount > a.unreadCount) return 1;
        if (b.unreadCount < a.unreadCount) return -1;
        return new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp);
      });

      return updatedChatList;
    });
    setMessages((prevMessages) => {
      const messageExists = prevMessages.some(msg => msg.id === reciveMessage.id);
      if (!messageExists) {
        return [reciveMessage, ...prevMessages];
      }
      return prevMessages;
    });
    scrollToBottom();
  };
  const onNotificationReceive = (payload) => {
    const notification = JSON.parse(payload.body);
    console.log('Notification received:', notification);
    handleShowSnackbar(notification.message);
    dispatch(sendNotification(notification.title, notification.message));
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

    if (currentChat?.id) {
      dispatch(getAllMessage({ chatId: currentChat.id, token, pageSize, pageNumber: 0 }));
      setMessagePage(0);
      setMessages([]);
    }
  }, [currentChat, message.newMessage, dispatch, token]);

  const handleLoadMessage = async () => {
    const nextPage = messagePage + 1;
    setMessagePage(nextPage);
    setLoadingMessages(true);
    const newMessages = await dispatch(getAllMessage({
      chatId: currentChat.id,
      token: token,
      pageSize: pageSize,
      pageNumber: nextPage
    }));
    if (newMessages) {
      setMessages(prevMessages => [...newMessages, ...prevMessages]);
    }
    setLoadingMessages(false);
  };

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
          {userProfile && (<UserProfileCard handleNavigate={handlebackProfile} />)}
          {userCardOpen && selectedUserCardId && (
            <UserCard
              userId={selectedUserCardId}
              handleNavigate={() => setUserCardOpen(false)}
            />
          )}
          {!isProfile && !isGroup && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <img onClick={handleNavigate} className="rounded-full w-10 h-10 cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200"
                    src={imageUrl} alt="" />
                  <p className="font-semibold">{auth.reqUser?.full_name}</p>
                </div>
                <div className="flex space-x-4 text-2xl">
                  <MdDynamicFeed
                    className="cursor-pointer hover:text-primary dark:hover:text-teal-400 transition-colors"
                    onClick={() => navigate("/status")}
                  />
                  <BsThreeDotsVertical
                    className="cursor-pointer hover:text-primary dark:hover:text-teal-400 transition-colors"
                    onClick={handleClick}
                  />
                </div>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                >
                  <MenuItem onClick={handleNavigateProfile}>
                    <ImProfile />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <GrLogout />
                    Logout
                  </MenuItem>
                </Menu>
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
                  const truncatedContent = lastMessageContent.length > 15
                    ? lastMessageContent.substring(0, 10) + '...'
                    : lastMessageContent;

                  return (
                    <div key={item.id} onClick={() => handleCurrentChat(item)} className="chat-item">
                      <ChatCard
                        name={chatName}
                        userImg={chatImage}
                        content={truncatedContent}
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
                      onClick={handleClickSecond}
                      className='text-2xl cursor-pointer hover:text-teal-200 transition-colors' />
                    <Menu
                      anchorEl={anchorElSecondMenu}
                      open={openSecondMenu}
                      onClose={handleCloseSecondMenu}
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
                        <MenuItem key="profile" onClick={() => handleOpenUserCard(getOtherUserId())}>
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
                <div className="flex justify-center">
                  <button onClick={handleLoadMessage} className="flex items-center justify-center w-[3.8vw] p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <BsArrowUp className="text-xl text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
                {messages && messages.length > 0 && [...messages].reverse().map((msg) => (
                  <div key={msg.id} className={`flex ${msg.user.id !== auth.reqUser.id ? 'justify-start' : 'justify-end'}`}>
                    <MessageCard
                      isReqUserMessage={msg.user.id !== auth.reqUser.id}
                      content={msg.content}
                      imageUrl={msg.imageUrl}
                      userName={msg.user.full_name}
                      timestamp={msg.timestamp}
                      onDelete={() => handleDeleteMessage(msg.id)}
                      userId={msg.user.id}
                      currentUserId={auth.reqUser.id}
                    />
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 shadow-inner">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full shadow-sm">
                  <BsEmojiSmile
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-500 dark:text-gray-400 mx-3 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors" />
                  {showEmojiPicker && (
                    <EmojiPicker onEmojiClick={handleEmojiClick}
                      style={{ position: 'absolute', bottom: '60px', right: '20px', zIndex: 1000 }}
                    />
                  )}
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
                  <label htmlFor="image-upload" className="mx-3 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors">
                    <ImAttachment className="text-gray-500 dark:text-gray-400" />
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                  <BsMicFill className="text-gray-500 dark:text-gray-400 mx-3 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors" />
                </div>
              </div>
            </>
          )}
          {!currentChat && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <img src="https://cdn.pixabay.com/photo/2012/04/15/21/17/speech-35342_640.png" alt="" className="w-64 h-64 mb-6" />
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
          .chat-item .content {
            white-space: nowrap;        
            overflow: hidden;         
            text-overflow: ellipsis;   
            max-width: 200px;          
          }
          .message-card {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .message-content {
            flex: 1;
          }
          .message-actions {
            margin-left: 10px;
           cursor: pointer;
          }
          .message-timestamp {
            font-size: 0.8em;
            color: gray;
          }
          .req-user-message .message-content {
            text-align: right;
          }
        `}
      </style>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <SnackbarContent
          sx={{
            backgroundColor: 'success.main',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderRadius: '8px',
          }}
          message={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <BsEmojiSmile style={{ marginRight: 8 }} />
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