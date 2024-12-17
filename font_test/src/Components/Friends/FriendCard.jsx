import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFriends,
  getFriendRequests,
  removeFriend,
  addFriend,
  acceptFriendRequest
} from '../../Redux/Friend/Action';
import { searchUser as searchUserAction } from '../../Redux/Auth/Action';
import { Search, Bell, X } from 'lucide-react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import '../../index.css';

const FriendCard = ({ handleNavigate }) => {
  const dispatch = useDispatch();

  const { friendsList, loading, error, pendingFriendRequests } = useSelector(state => state.friends);
  const { searchUser, reqUser } = useSelector(state => state.auth);

  const token = localStorage.getItem('token');
  const [query, setQuery] = useState('');
  const [showRequests, setShowRequests] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

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
    if (showRequests) {
      dispatch(getFriendRequests(token));
    }
  }, [showRequests, dispatch, token]);

  const handleSearch = (e) => {
    const keyword = e.target.value;
    setQuery(keyword);
    if (keyword.trim() === '') {
      dispatch(getFriends(token));
      setShowRequests(false);
    } else {
      dispatch(searchUserAction({ keyword, token }));
      setShowRequests(false);
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
      })
      .catch(err => console.error('Error accepting friend request:', err));
  };

  const handleCloseFriendCard = () => {
    handleNavigate();
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

  const friendsToDisplay = query
    ? searchUser
    : friendsList.map(relation => getFriend(relation)).filter(friend => friend !== null);

  const displayedFriends = showRequests ? pendingFriendRequests : friendsToDisplay;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between bg-teal-500 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCloseFriendCard}
              className="p-2 hover:bg-teal-600 rounded-full transition-colors duration-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">{showRequests ? 'Friend Requests' : 'Friends'}</h1>
          </div>
          <Bell
            className="w-6 h-6 cursor-pointer"
            onClick={() => setShowRequests(true)}
            title="View Friend Requests"
            aria-label="View Friend Requests"
          />
          {pendingFriendRequests.length > 0 && (
            <span
              className="absolute top-5 right-5 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
              aria-label={`${pendingFriendRequests.length} pending friend request${pendingFriendRequests.length > 1 ? 's' : ''}`}
            >
              {pendingFriendRequests.length > 99 ? '99+' : pendingFriendRequests.length}
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between mb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search friends or users..."
                value={query}
                onChange={handleSearch}
                className="text-black w-full pl-12 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Search friends or users"
              />
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                aria-label="Search Icon"
              />
            </div>
          </div>

          {loading && <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          <div className="max-h-80 overflow-y-auto scrollbar-custom">
            <ul className="space-y-4 mt-4">
              {displayedFriends && displayedFriends.length > 0 ? (
                displayedFriends.map(friend => {
                  if (!showRequests) {
                    const friendship = friendsList.find(f =>
                      (f.userInitiator.id === reqUser.id && f.userRecipient.id === friend.id) ||
                      (f.userRecipient.id === reqUser.id && f.userInitiator.id === friend.id)
                    );

                    return (
                      <li key={friend.id} className="flex items-center space-x-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <img
                          src={
                            friend.profile_picture
                              ? `http://localhost:8080/uploads/profile/${friend.profile_picture}`
                              : 'https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png'
                          }
                          alt={friend.fullName || friend.full_name || 'Friend'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-grow">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{friend.fullName || friend.full_name || 'No Name'}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 block">{friendship ? friendship.status : 'Unknown'}</span>
                        </div>
                        {friendship && friendship.status === 'ACCEPTED' ? (
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
                            onClick={() => handleRemoveFriend(friend.id)}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1 bg-teal-500 text-white rounded-full text-sm hover:bg-teal-600 transition-colors"
                            onClick={() => handleAddFriend(friend.id)}
                          >
                            Add
                          </button>
                        )}
                      </li>
                    );
                  } else {
                    return (
                      <li key={friend.id} className="flex items-center space-x-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <img
                          src={
                            friend.userInitiator?.profile_picture
                              ? `http://localhost:8080/uploads/profile/${friend.userInitiator.profile_picture}`
                              : 'https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png'
                          }
                          alt={friend.userInitiator?.fullName || friend.userInitiator?.full_name || 'Friend Request'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-grow">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{friend.userInitiator?.fullName || friend.userInitiator?.full_name || 'No Name'}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 block">sent you a friend request</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition-colors"
                            onClick={() => handleAcceptFriend(friend.userInitiator?.id)}
                          >
                            Accept
                          </button>
                        </div>
                      </li>
                    );
                  }
                })
              ) : (
                !loading && <p className="text-center text-gray-600 dark:text-gray-400">No {showRequests ? 'friend requests' : 'friends'} found.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;