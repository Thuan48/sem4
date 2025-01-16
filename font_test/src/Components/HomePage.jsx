import React, { useEffect, useState, useRef } from 'react';
import { AiOutlineSearch, AiOutlineDelete } from "react-icons/ai"
import { MdGroupAdd, MdOutlinePersonRemoveAlt1 } from "react-icons/md";
import { GrLogout } from "react-icons/gr";
import { IoIosPersonAdd } from "react-icons/io";
import { BsEmojiSmile, BsMicFill, BsStopFill, BsThreeDotsVertical, BsSun, BsMoon, BsArrowUp } from "react-icons/bs"
import { ImAttachment, ImProfile } from "react-icons/im"
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Menu, MenuItem, Snackbar, SnackbarContent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { logout, currenUser, searchUser } from '../Redux/Auth/Action';
import { addUserGroup, blockChatStatus, createChat, deleteChat, getChatMembers, getChats, getUserChatStatus, getUserStatusesInChat, removeUserGroup, unblockChatStatus, updateUserChatStatus } from '../Redux/Chat/Action';
import { createMessage, deleteMessage, fetchPinnedMessages, getAllMessage, markAsRead, searchMessages } from '../Redux/Message/Action';
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
import { UPDATE_USER_PROFILE } from '../Redux/Auth/ActionType';
import { BASE_API_URL } from '../config/api';
import '../index.css';
import { FaSignOutAlt, FaUserFriends, FaBlog, FaSearch, FaBan, FaVolumeMute, FaVolumeUp, FaPoll } from "react-icons/fa";
import PinnedMessages from './MessageCard/PinnedMessages';
import PollsPage from './Poll/PollsPage';
import CreatePollCard from './Poll/CreatePollCard';
import { setDarkMode } from '../Redux/Theme/Action';
import BlockMemberModal from './Group/BlockMemberModal';

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
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [messageKeyword, setMessageKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openBlockMemberModal, setOpenBlockMemberModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth, chat, message, friends } = useSelector(store => store);
  const token = localStorage.getItem("token");
  const messageEndRef = useRef(null);
  const open = Boolean(anchorEl);
  const isAdmin = currentChat?.userAdminIds?.includes(auth.reqUser.id) || false;
  const pageSize = 7;
  const openSecondMenu = Boolean(anchorElSecondMenu);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const pinnedMessagesIntervalRef = useRef(null);
  const { isDarkMode } = useSelector(state => state.theme);
  const currentChatStatusData = useSelector(
    (state) =>
      currentChat &&
      state.chat.userChatStatuses[`${currentChat.id}-${auth.reqUser.id}`]
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioFile = new File([audioBlob], `audio_${Date.now()}.mp3`, { type: 'audio/mp3' });

        dispatch(createMessage({
          userId: auth.reqUser.id,
          chatId: currentChat.id,
          content: '',
          audio: audioFile,
          token: token,
        }));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const handleOpenCreatePollModal = () => {
    setIsCreatePollOpen(true);
    handleCloseSecondMenu();
  };
  const handleCloseCreatePollModal = () => {
    setIsCreatePollOpen(false);
  };
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
    setCurrentChat(item);
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
      stompClient.subscribe('/user/queue/chatList', onChatListReceive);
      stompClient.subscribe("/group/" + item.id.toString(), onMessageRevice);
      stompClient.subscribe("/group/" + item.id.toString() + "/delete", onDeleteMessageReceive);
    }
    dispatch(markAsRead(item.id, auth.reqUser.id, token));
  };
  const handleAddMember = (chatId) => {
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
  const handleOutGroup = (chatId) => {
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
      handleShowSnackbar("Remove chat successsuccess!");
      handleClose();
      setCurrentChat(null);
    }
  };
  const createGroup = () => setIsGroup(true);
  const toggleDarkMode = () => {
    dispatch(setDarkMode(!isDarkMode));
    document.documentElement.classList.toggle('dark', !isDarkMode);
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
      const sock = new SockJS(`${BASE_API_URL}/ws`);
      const temp = over(sock);
      setStompClient(temp);
      const headers = {
        email: auth.reqUser.email,
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
      const chatListSub = stompClient.subscribe('/user/queue/chatList', onChatListReceive);
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
        chatListSub.unsubscribe();
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
        if (b.unreadCount !== a.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
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
  const onChatListReceive = (payload) => {
    const updatedChatList = JSON.parse(payload.body);
    //dispatch(updateChatList(updatedChatList));
  }

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
    const fetchChats = async () => {
      try {
        await dispatch(getChats(token));
      } catch (error) {
        console.error("Failed to fetch chats:", error);
        handleShowSnackbar("Failed to load chats. Please try again later.");
      }
    };
    fetchChats();
    const interval = setInterval(fetchChats, 500);
    return () => clearInterval(interval);
  }, [dispatch, token]);

  useEffect(() => {
    if (currentChat?.id) {
      dispatch(getAllMessage({ chatId: currentChat.id, token, pageSize, pageNumber: 0 }));
      setMessagePage(0);
      setMessages([]);
    }
  }, [currentChat, message.newMessage, dispatch, token]);

  useEffect(() => {
    if (currentChat?.id) {
      pinnedMessagesIntervalRef.current = setInterval(() => {
        dispatch(fetchPinnedMessages(currentChat.id, token));
      }, 1000);
      return () => clearInterval(pinnedMessagesIntervalRef.current);
    }
  }, [currentChat, dispatch, token]);

  const handleLoadMessage = async () => {
    const nextPage = messagePage + 1;
    setMessagePage(nextPage);
    setLoadingMessages(true);
    dispatch(markAsRead(currentChat.id, auth.reqUser.id, token));
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

  const handleSearchMessages = async () => {
    if (currentChat && messageKeyword.trim() !== "") {
      try {
        const pageSize = 10;
        const pageNumber = 0;
        const results = await dispatch(searchMessages(currentChat.id, messageKeyword, token, pageSize, pageNumber));

        if (results && results.length > 0) {
          setSearchResults(results);
          setIsSearchOpen(false);
        } else {
          handleShowSnackbar("No results found.");
        }
      } catch (error) {
        console.error("Search failed:", error);
        const errorMessage = error?.response?.data?.error || "Search failed. Please try again.";
        handleShowSnackbar(errorMessage);
      }
    } else {
      console.log("No current chat or empty keyword");
      handleShowSnackbar("Please select a chat and enter at least 3 characters.");
    }
  };

  const handleKeywordChange = (e) => {
    setMessageKeyword(e.target.value);
  };

  const handleMutedChat = () => {
    if (currentChat && auth.reqUser) {
      dispatch(updateUserChatStatus(currentChat.id, auth.reqUser.id, 'MUTED', token));
      handleShowSnackbar("Chat has been muted.");
    } else {
      handleShowSnackbar("Unable to mute the chat. Please try again.");
    }
  };

  const handleBlockChat = () => {
    if (currentChat && auth.reqUser) {
      dispatch(blockChatStatus(currentChat.id, token));
      handleShowSnackbar("Chat has been blocked.");
    } else {
      handleShowSnackbar("Unable to block the chat. Please try again.");
    }
  }

  const handleUnblockChat = () => {
    if (currentChat && auth.reqUser) {
      dispatch(unblockChatStatus(currentChat.id, token));
      handleShowSnackbar("Chat has been blocked.");
    } else {
      handleShowSnackbar("Unable to block the chat. Please try again.");
    }
  }

  const handleDefaultChat = () => {
    if (currentChat && auth.reqUser) {
      dispatch(updateUserChatStatus(currentChat.id, auth.reqUser.id, 'DEFAULT', token));
      handleShowSnackbar("Chat has been set to default.");
    } else {
      handleShowSnackbar("Unable to set the chat to default. Please try again.");
    }
  }

  useEffect(() => {
    if (currentChat && currentChat.id && auth.reqUser.id && token) {
      const interval = setInterval(() => {
        dispatch(getUserChatStatus(currentChat.id, auth.reqUser.id, token));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentChat, auth.reqUser, token, dispatch]);

  const handleOpenBlockMemberModal = () => {
    setOpenBlockMemberModal(true);
  };

  const handleCloseBlockMemberModal = () => {
    setOpenBlockMemberModal(false);
  };

  useEffect(() => {
    if (currentChat && currentChat.group) {
      const otherUsers = currentChat.users.filter(user => user.id !== auth.reqUser.id);
      setUsersInGroup(otherUsers);
    } else if (currentChat && !currentChat.group) {
      const otherUser = currentChat.users.find(user => user.id !== auth.reqUser.id);
      setUsersInGroup(otherUser ? [otherUser] : []);
    } else {
      setUsersInGroup([]);
    }
  }, [currentChat, auth.reqUser?.id]);

  useEffect(() => {
    if (openBlockMemberModal && currentChat?.id) {
      dispatch(getUserStatusesInChat(currentChat.id, token));
    }
  }, [openBlockMemberModal, currentChat, dispatch, token]);

  const imageUrl = auth.reqUser?.profile_picture
    ? `http://localhost:8080/uploads/profile/${auth.reqUser.profile_picture}`
    : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png";

  return (
    <div className={`relative ${isDarkMode ? 'dark' : ''} scrollbar-custom`}>
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
                  <FaUserFriends
                    className="cursor-pointer hover:text-primary dark:hover:text-teal-400 transition-colors"
                    onClick={() => navigate("/friends")}
                  />
                  <FaBlog
                    className="cursor-pointer hover:text-primary dark:hover:text-teal-400 transition-colors"
                    onClick={() => navigate("/blogs")}
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
                        count={item.unreadCount}
                        isGroup={isGroupChat}
                        isAdmin={item.userAdminIds?.includes(auth.reqUser.id) || false}
                        onAddMember={openAddMember}
                        onRemoveMember={handleOpenRemoveMemberModal}
                        onOutGroup={handleOutGroup}
                        onDeleteChat={handleDeleteGroup}
                        onViewProfile={() => handleOpenUserCard(getOtherUserId())}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {isCreatePollOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-11/12 max-w-md">
                <CreatePollCard chatId={currentChat.id} />
                <Button
                  onClick={handleCloseCreatePollModal}
                  variant="outlined"
                  color="secondary"
                  className="mt-4"
                >
                  Close
                </Button>
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
                    {isSearchOpen ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={messageKeyword}
                          onChange={handleKeywordChange}
                          placeholder="Search messages..."
                          className="text-black border rounded px-4 py-2 focus:outline-none"
                        />
                        <FaSearch
                          onClick={handleSearchMessages}
                          className={`text-2xl cursor-pointer hover:text-teal-200 transition-colors ${messageKeyword.trim().length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ pointerEvents: messageKeyword.trim().length < 3 ? 'none' : 'auto' }} // Disable click if invalid
                        />
                        <button
                          onClick={() => setIsSearchOpen(false)}
                          className="text-xl bg-transparent border-0 cursor-pointer text-gray-300 hover:text-white"
                          aria-label="Close Search"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <FaSearch
                        onClick={() => setIsSearchOpen(true)}
                        className="text-2xl cursor-pointer hover:text-teal-200 transition-colors"
                        aria-label="Open Search"
                      />
                    )}
                    <BsThreeDotsVertical
                      onClick={handleClickSecond}
                      className='text-2xl cursor-pointer hover:text-teal-200 transition-colors' />
                    <Menu
                      anchorEl={anchorElSecondMenu}
                      open={openSecondMenu}
                      onClose={handleCloseSecondMenu}
                      MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                    >
                      {currentChat && !currentChat.group && (
                        <>
                          <MenuItem key="profile" onClick={() => handleOpenUserCard(getOtherUserId())}>
                            <ImProfile style={{ marginRight: '8px' }} />
                            Profile
                          </MenuItem>

                          {currentChatStatusData && currentChatStatusData.status === 'BLOCKED' && currentChatStatusData.blockedByUserId === auth.reqUser.id ? (
                            <MenuItem key="unblock-chat" onClick={handleUnblockChat}>
                              <FaBan style={{ marginRight: '8px' }} />
                              Unblock
                            </MenuItem>
                          ) : (
                            currentChatStatusData && ['DEFAULT', 'MUTED'].includes(currentChatStatusData.status) && (
                              <MenuItem key="block-chat" onClick={handleBlockChat}>
                                <FaBan style={{ marginRight: '8px' }} />
                                Block
                              </MenuItem>
                            )
                          )}

                          <MenuItem key="delete-chat" onClick={handleDeleteGroup}>
                            <AiOutlineDelete style={{ marginRight: '8px' }} />
                            Delete Chat
                          </MenuItem>
                        </>
                      )}

                      {currentChat && currentChat.group && (
                        [
                          <MenuItem key="add-member" onClick={openAddMember}>
                            <IoIosPersonAdd style={{ marginRight: '8px' }} />
                            Add Member
                          </MenuItem>,
                          <MenuItem key="remove-member" onClick={handleOpenRemoveMemberModal}>
                            <MdOutlinePersonRemoveAlt1 style={{ marginRight: '8px' }} />
                            Remove Member
                          </MenuItem>,
                          <MenuItem key="out-group" onClick={handleOutGroup}>
                            <FaSignOutAlt style={{ marginRight: '8px' }} />
                            Out Group
                          </MenuItem>,
                          isAdmin && (
                            <>
                              <MenuItem key="block-member" onClick={handleOpenBlockMemberModal}>
                                <FaBan style={{ marginRight: '8px' }} />
                                Block Member
                              </MenuItem>
                              <MenuItem key="delete-group" onClick={handleDeleteGroup}>
                                <AiOutlineDelete style={{ marginRight: '8px' }} />
                                Delete Chat
                              </MenuItem>
                              <MenuItem key="create-poll" onClick={handleOpenCreatePollModal}>
                                <FaPoll style={{ marginRight: '8px' }} />
                                Create Poll
                              </MenuItem>
                            </>
                          )
                        ]
                      )}

                      {currentChatStatusData && currentChatStatusData.status !== 'BLOCKED' && (
                        currentChatStatusData.status === 'MUTED' ? (
                          <MenuItem key="unmute-chat" onClick={handleDefaultChat}>
                            <FaVolumeUp style={{ marginRight: '8px' }} />
                            Unmute
                          </MenuItem>
                        ) : (
                          ['DEFAULT', 'MUTED'].includes(currentChatStatusData.status) && (
                            <MenuItem key="mute-chat" onClick={handleMutedChat}>
                              <FaVolumeMute style={{ marginRight: '8px' }} />
                              Mute
                            </MenuItem>
                          )
                        )
                      )}
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
                    <BlockMemberModal
                      open={openBlockMemberModal}
                      onClose={handleCloseBlockMemberModal}
                      users={usersInGroup}
                      chatId={currentChat?.id}
                    />
                    <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors">
                      {isDarkMode ? <BsSun className="text-xl" /> : <BsMoon className="text-xl" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100 dark:bg-gray-800" onScroll={handleMessageScroll}>
                {currentChat && currentChat.id && message.pinnedMessages[currentChat.id] && message.pinnedMessages[currentChat.id].length > 0 && (
                  <PinnedMessages
                    messages={message.pinnedMessages[currentChat.id]}
                    currentUserId={auth.reqUser.id}
                    onDelete={handleDeleteMessage}
                  />
                )}
                <PollsPage chatId={currentChat.id} />
                <div className="flex justify-center">
                  <button onClick={handleLoadMessage} className="flex items-center justify-center w-[3.8vw] p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <BsArrowUp className="text-xl text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
                {messages && messages.length > 0 && [...messages].reverse().map((msg) => (
                  <div key={msg.id} className={`flex ${msg.user.id !== auth.reqUser.id ? 'justify-start' : 'justify-end'}`}>
                    <MessageCard
                      isReqUserMessage={msg.user.id !== auth.reqUser.id}
                      message={msg}
                      onDelete={() => handleDeleteMessage(msg.id)}
                      userId={msg.user.id}
                      currentUserId={auth.reqUser.id}
                      isGroup={currentChat.group}
                    />
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
              {currentChatStatusData && currentChatStatusData.status !== 'BLOCKED' && (
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
                    {isRecording ? (
                      <BsStopFill
                        className="text-1xl text-red-500 cursor-pointer mx-3 hover:text-red-600 transition-colors"
                        onClick={stopRecording}
                      />
                    ) : (
                      <BsMicFill
                        className="text-1xl text-gray-500 dark:text-gray-400 mx-3 cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                        onClick={startRecording}
                      />
                    )}
                  </div>
                </div>
              )}
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