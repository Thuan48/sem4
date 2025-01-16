import React, { useState, useMemo } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Menu, MenuItem } from '@mui/material';
import { togglePinMessage, addInteraction, removeInteraction } from '../../Redux/Message/Action';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegSmile, FaSmile, FaHeart, FaRegHeart } from 'react-icons/fa';

const MessageCard = ({ isReqUserMessage, onDelete, userId, message, currentUserId, isGroup }) => {
  const { id, isPinned, audioUrl, content, imageUrl, userName, timestamp, interactions } = message;
  const safeInteractions = Array.isArray(interactions) ? interactions : [];
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const auth = useSelector(state => state.auth);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete();
    handleClose();
  };

  const handleTogglePin = () => {
    dispatch(togglePinMessage(id, token));
    handleClose();
  };

  const handleToggleReaction = (type) => {
    const existingInteraction = safeInteractions.find(
      (inter) => inter.type === type && inter.user.id === auth.reqUser.id
    );

    if (existingInteraction) {
      dispatch(removeInteraction(existingInteraction.id, token));
    } else {
      dispatch(addInteraction(id, type, token));
    }

    handleClose();
  };

  const getReactionIcon = (type) => {
    const userHasReacted = safeInteractions.some(inter => inter.type === type && inter.user.id === auth.reqUser.id);
    switch (type) {
      case 'like':
        return userHasReacted ? <FaSmile color="blue" /> : <FaRegSmile />;
      case 'love':
        return userHasReacted ? <FaHeart color="red" /> : <FaRegHeart />;
      default:
        return null;
    }
  };

  const splitContent = (text) => {
    if (!text) return '';
    return text.match(/.{1,45}/g)?.join(' ') || '';
  };

  const reactionTypes = ['like', 'love'];

  const interactionCounts = useMemo(() => {
    return reactionTypes.reduce((acc, type) => {
      acc[type] = safeInteractions.filter(inter => inter.type === type).length;
      return acc;
    }, {});
  }, [safeInteractions, reactionTypes]);

  return (
    <div className={`relative inline-block py-1 px-2 rounded-lg ${isReqUserMessage ? "bg-[#d9fdd3] dark:bg-teal-700 shadow-sm" : "bg-white dark:bg-gray-700 shadow-sm"}`}>
      <div className={`flex ${isReqUserMessage ? "justify-end" : "justify-start"} items-center`}>
        {isReqUserMessage ? (
          <>
            <strong className={`text-xs ${isReqUserMessage ? "text-green-800 dark:text-teal-200" : "text-gray-800 dark:text-gray-200"} mr-auto`}>{userName}</strong>
            <BsThreeDotsVertical onClick={handleClick} className="cursor-pointer ml-auto" />
          </>
        ) : (
          <>
            {userId === currentUserId && (
              <BsThreeDotsVertical onClick={handleClick} className="cursor-pointer mr-auto" />
            )}
            <strong className={`text-xs ${isReqUserMessage ? "text-green-800 dark:text-teal-200" : "text-gray-800 dark:text-gray-200"} ml-auto`}>{userName}</strong>
          </>
        )}
      </div>
      {isGroup && (
        <div className="text-left text-sm text-gray-500 dark:text-gray-400">
          {message.user.full_name}
        </div>
      )}
      {isPinned && (
        <div className="mt-1 mb-1">
          <span className="text-xs text-yellow-500 font-semibold">📌 Pinned Message</span>
        </div>
      )}
      <div className={`flex flex-col ${isReqUserMessage ? "items-end" : "items-start"}`}>
        {content && (
          <p className={`mt-0.5 text-sm ${isReqUserMessage ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"} whitespace-pre-wrap break-words`}>
            {splitContent(content)}
          </p>
        )}
        {imageUrl && (
          <img
            src={`http://localhost:8080/uploads/messages/${imageUrl}`}
            alt="image error"
            className="mt-2 max-w-xs rounded-lg"
          />
        )}
        {audioUrl && (
          <audio controls src={`http://localhost:8080${audioUrl}`} className="mt-2" />
        )}
        <span className={`mt-0.5 text-xs ${isReqUserMessage ? "text-gray-600 dark:text-teal-200" : "text-gray-500 dark:text-gray-400"}`}>{formattedTime}</span>
      </div>
      {safeInteractions.length > 0 && (
        <div className="flex space-x-2 mt-1">
          {reactionTypes.map(type => (
            <div key={type} className="flex items-center space-x-1 text-sm">
              {getReactionIcon(type)}
              <span>{interactionCounts[type]}</span>
            </div>
          ))}
        </div>
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        {userId === currentUserId && (
          <>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </>
        )}
        <MenuItem onClick={handleTogglePin}>
          {isPinned ? 'Unpin' : 'Pin'}
        </MenuItem>
        {reactionTypes.map(type => (
          <MenuItem key={type} onClick={() => handleToggleReaction(type)}>
            {getReactionIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default MessageCard;