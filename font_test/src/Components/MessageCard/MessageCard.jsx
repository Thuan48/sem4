import React, { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Menu, MenuItem } from '@mui/material';
import { togglePinMessage } from '../../Redux/Message/Action';
import { useDispatch } from 'react-redux';

const MessageCard = ({ isReqUserMessage, onDelete, userId, message, currentUserId }) => {
  const { id, isPinned, audioUrl, content, imageUrl, userName, timestamp } = message;
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

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

  const splitContent = (text) => {
    if (!text) return '';
    return text.match(/.{1,45}/g)?.join(' ') || '';
  };

  return (
    <div className={`relative inline-block py-1 px-2 rounded-lg ${isReqUserMessage ? "bg-[#d9fdd3] dark:bg-teal-700 shadow-sm" : "bg-white dark:bg-gray-700 shadow-sm"}`}>
      <div className={`flex ${isReqUserMessage ? "justify-end" : "justify-start"} items-center`}>
        {isReqUserMessage ? (
          <>
            <strong className={`text-xs ${isReqUserMessage ? "text-green-800 dark:text-teal-200" : "text-gray-800 dark:text-gray-200"} mr-auto`}>{userName}</strong>
            {userId === currentUserId && (
              <BsThreeDotsVertical onClick={handleClick} className="cursor-pointer ml-auto" />
            )}
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
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
        <MenuItem onClick={handleTogglePin}>
          {message.isPinned ? 'Unpin' : 'Pin'}
        </MenuItem>
      </Menu>
    </div>
  );
};

export default MessageCard;