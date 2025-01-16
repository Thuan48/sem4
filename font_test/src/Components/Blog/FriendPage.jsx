import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { FaBell, FaUserPlus, FaUserMinus, FaArrowLeft, FaComments } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import {
  getFriends,
  getFriendRequests,
  removeFriend,
  addFriend,
  acceptFriendRequest,
  searchFriends,
  rejectFriendRequest,
  searchUsersAdd
} from '../../Redux/Friend/Action';
import SockJS from "sockjs-client/dist/sockjs";
import { over } from "stompjs";
import { BASE_API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { createChat } from '../../Redux/Chat/Action';

const FriendPage = () => {
  const dispatch = useDispatch();
  const { friendsList, loading, error, pendingFriendRequests, searchFriend, searchUsersToAdd } = useSelector(state => state.friends);
  const { reqUser } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const [queryFriend, setQueryFriend] = useState('');
  const [queryUser, setQueryUser] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = over(socket);

    client.connect({ Authorization: token }, () => {
      setStompClient(client);
      client.subscribe('/user/queue/friendRequest', () => {
        dispatch(getFriendRequests(token));
      });

      client.subscribe('/user/queue/friendList', () => {
        dispatch(getFriends(token));
      });
    });

    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, [dispatch, token]);

  useEffect(() => {
    if (token) {
      dispatch(getFriends(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (dialogOpen) {
      dispatch(getFriendRequests(token));
    }
  }, [dialogOpen, dispatch, token]);

  const handleSearchFriend = (e) => {
    const keyword = e.target.value;
    setQueryFriend(keyword);
    if (keyword.trim() === '') {
      dispatch(getFriends(token));
    } else {
      dispatch(searchFriends(keyword, token));
    }
  };

  const handleSearchUser = (e) => {
    const keyword = e.target.value;
    setQueryUser(keyword);
    if (keyword.trim() === '') {
      dispatch(searchUsersAdd('', token));
    } else {
      dispatch(searchUsersAdd(keyword, token));
    }
  };

  const handleRemoveFriend = async (id) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      try {
        await dispatch(removeFriend(id, token));
        dispatch(getFriends(token));
      } catch (error) {
        console.error('Failed to remove friend:', error);
      }
    }
  };

  const handleAddFriend = async (id) => {
    try {
      await dispatch(addFriend(id, token));
      dispatch(getFriends(token));
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  const handleAcceptFriend = (userInitiatorId) => {
    dispatch(acceptFriendRequest(userInitiatorId, token))
      .then(() => {
        dispatch(getFriendRequests(token));
        dispatch(getFriends(token));
      })
      .catch(err => console.error('Error accepting friend request:', err));
  };

  const handleRejectFriend = (friendId) => {
    dispatch(rejectFriendRequest(friendId, token))
      .then(() => {
        dispatch(getFriendRequests(token));
      })
      .catch(err => console.error('Error rejecting friend request:', err));
  };

  const getFriend = (relation) => {
    if (!reqUser) {
      console.warn('Current user (reqUser) is undefined.');
      return null;
    }
    if (!relation || !relation.userInitiator || !relation.userRecipient) {
      console.warn('Invalid friendship relation:', relation);
      return null;
    }
    return relation.userInitiator.id === reqUser.id
      ? relation.userRecipient
      : relation.userInitiator;
  };

  const friendsIds = friendsList.map(friend => {
    return friend.userInitiator.id === reqUser.id ? friend.userRecipient.id : friend.userInitiator.id;
  });

  const friendsToDisplay = queryFriend
    ? searchFriend
    : friendsList.map(relation => getFriend(relation)).filter(friend => friend !== null);

  const usersToDisplay = queryUser
    ? searchUsersToAdd.filter(user => !friendsIds.includes(user.id) && user.id !== reqUser.id)
    : [];

  const handleBellClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleChatClick = async (friendId) => {
    await dispatch(createChat({ token, resData: { userId: friendId } }));
    navigate('/');
  };

  return (
    <div className={`friend-page bg-gray-900 dark:bg-gray-900 text-white min-h-screen p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <IconButton
              color="inherit"
              onClick={() => navigate('/')}
              className="text-teal-400 hover:text-teal-300"
              aria-label="Go back to Home"
            >
              <FaArrowLeft />
            </IconButton>
          </div>
          <h1 className="text-3xl font-bold text-teal-400">Friends</h1>
          <div className="flex items-center space-x-4">
            <IconButton color="inherit" onClick={handleBellClick} className="text-teal-400 hover:text-teal-300">
              <Badge badgeContent={pendingFriendRequests.length} color="secondary">
                <FaBell />
              </Badge>
            </IconButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">Friends List</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search friends..."
                value={queryFriend}
                onChange={handleSearchFriend}
                className="w-full p-3 pl-10 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                aria-label="Search friends"
              />
              <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <ul className="space-y-4">
              {friendsToDisplay && friendsToDisplay.length > 0 ? (
                friendsToDisplay.map(friend => (
                  <li key={friend.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md transition-all hover:shadow-lg hover:bg-gray-700">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          friend?.profile_picture
                            ? `${BASE_API_URL}/uploads/profile/${friend.profile_picture}`
                            : 'https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png'
                        }
                        alt={friend?.fullName || friend?.full_name || 'Friend'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-400 transition-transform hover:scale-110"
                      />
                      <div>
                        <span className="font-medium text-white">{friend?.fullName || friend?.full_name || 'No Name'}</span>
                        <span className="text-sm text-gray-400 block">Friends</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleChatClick(friend.id)}>
                        <FaComments className="text-teal-400" />
                      </button>
                      <button
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        <FaUserMinus />
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                !loading && <p className="text-center text-gray-400">No friends found.</p>
              )}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">Search Users to Add</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users to add..."
                value={queryUser}
                onChange={handleSearchUser}
                className="w-full p-3 pl-10 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                aria-label="Search users to add"
              />
              <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <ul className="space-y-4">
              {usersToDisplay && usersToDisplay.length > 0 ? (
                usersToDisplay.map(user => (
                  <li key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md transition-all hover:shadow-lg hover:bg-gray-700">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          user?.profile_picture
                            ? `${BASE_API_URL}/uploads/profile/${user.profile_picture}`
                            : 'https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png'
                        }
                        alt={user?.fullName || user?.full_name || 'User'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-400 transition-transform hover:scale-110"
                      />
                      <span className="font-medium text-white">{user?.fullName || user?.full_name || 'No Name'}</span>
                    </div>
                    <button
                      className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors transform hover:scale-110"
                      onClick={() => handleAddFriend(user.id)}
                    >
                      <FaUserPlus />
                    </button>
                  </li>
                ))
              ) : (
                !loading && <p className="text-center text-gray-400">No users found.</p>
              )}
            </ul>
          </div>
        </div>

        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          fullWidth
          maxWidth="sm"
          aria-labelledby="friend-requests-dialog-title"
          PaperProps={{
            className: "bg-gray-800 text-white rounded-lg"
          }}
        >
          <DialogTitle id="friend-requests-dialog-title" className="bg-teal-500 text-white font-bold">
            Friend Requests
          </DialogTitle>
          <DialogContent dividers className="space-y-4">
            {pendingFriendRequests.length > 0 ? (
              pendingFriendRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        request.userInitiator?.profile_picture
                          ? `${BASE_API_URL}/uploads/profile/${request.userInitiator.profile_picture}`
                          : 'https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png'
                      }
                      alt={request.userInitiator?.full_name || 'Friend'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-teal-400"
                    />
                    <span className="font-medium text-white">
                      {request.userInitiator?.full_name || 'No Name'}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleAcceptFriend(request.userInitiator?.id)}
                      className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Accept
                    </Button>
                    {/* <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRejectFriend(request.userInitiator?.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors ml-2"
                    >
                      Reject
                    </Button> */}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">No pending friend requests.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary" className="text-teal-400">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {loading && <p className="text-center text-gray-400 mt-8">Loading...</p>}
        {error && <p className="text-center text-red-500 mt-8">{error}</p>}
      </div>
    </div>
  );
};


export default FriendPage;