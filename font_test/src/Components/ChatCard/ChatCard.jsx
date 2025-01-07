import React, { useState } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { IoIosPersonAdd } from 'react-icons/io';
import { MdOutlinePersonRemoveAlt1 } from 'react-icons/md';
import { FaSignOutAlt } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import { ImProfile } from 'react-icons/im';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ChatCard = ({
  name,
  userImg,
  content,
  timestamp,
  count,
  isGroup,
  isAdmin,
  onAddMember,
  onRemoveMember,
  onOutGroup,
  onDeleteChat,
  onViewProfile,
  onClick,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation(); 
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddMember = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onAddMember();
  };

  const handleRemoveMember = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onRemoveMember();
  };

  const handleOutGroup = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onOutGroup();
  };

  const handleDeleteChat = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onDeleteChat();
  };

  const handleViewProfile = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onViewProfile();
  };

  return (
    <div
      className='flex items-center justify-between py-2 group cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
      onClick={onClick}
    >
      <div className='flex items-center w-full'>
        <div className='w-[15%]'>
          <img className='h-10 w-10 rounded-full' src={userImg} alt="" />
        </div>
        <div className='pl-1 w-full'>
          <div className='px-2 flex justify-between items-center'>
            <p className='text-lg font-semibold text-gray-800 dark:text-gray-200'>{name}</p>
            <div className='flex items-center space-x-2'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>{timestamp || null}</p>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {isGroup ? (
                  <>
                    <MenuItem onClick={handleAddMember}>
                      <IoIosPersonAdd style={{ marginRight: '8px' }} />
                      Add Member
                    </MenuItem>
                    <MenuItem onClick={handleRemoveMember}>
                      <MdOutlinePersonRemoveAlt1 style={{ marginRight: '8px' }} />
                      Remove Member
                    </MenuItem>
                    <MenuItem onClick={handleOutGroup}>
                      <FaSignOutAlt style={{ marginRight: '8px' }} />
                      Out Group
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem onClick={handleDeleteChat}>
                        <AiOutlineDelete style={{ marginRight: '8px' }} />
                        Delete Chat
                      </MenuItem>
                    )}
                  </>
                ) : (
                  <>
                    <MenuItem onClick={handleViewProfile}>
                      <ImProfile style={{ marginRight: '8px' }} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleDeleteChat}>
                      <AiOutlineDelete style={{ marginRight: '8px' }} />
                      Delete Chat
                    </MenuItem>
                  </>
                )}
              </Menu>
            </div>
          </div>
          <div className='px-2 flex justify-between items-center'>
            <p className='text-gray-600 dark:text-gray-300 truncate'>{content || null}</p>
            {count > 0 && (
              <span className='bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full'>
                {count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;