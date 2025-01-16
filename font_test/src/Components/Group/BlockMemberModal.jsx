import React, { useEffect, useState } from 'react';
import { Modal, Button, Checkbox, List, Typography, IconButton } from '@mui/material';
import { X, Ban, AlertTriangle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserStatusesInChat, updateUserChatStatus } from '../../Redux/Chat/Action';

const BlockMemberModal = ({ open, onClose, users, chatId }) => {
  const dispatch = useDispatch();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const token = localStorage.getItem("token");

  const chatIdStr = String(chatId);

  const memberStatuses = useSelector((state) =>
    chatIdStr ? state.chat.memberChatStatuses[chatIdStr] || {} : {}
  );

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  useEffect(() => {
    if (open && chatId) {
      dispatch(getUserStatusesInChat(chatId, token));
      const intervalId = setInterval(() => {
        dispatch(getUserStatusesInChat(chatId, token));
      }, 400);

      return () => clearInterval(intervalId);
    }
  }, [open, chatId, dispatch, token]);

  const handleBlock = () => {
    if (selectedUsers.length > 0) {
      setConfirmOpen(true);
    }
  };

  const confirmBlock = () => {
    selectedUsers.forEach((userId) => {
      const token = localStorage.getItem('token');
      dispatch(updateUserChatStatus(chatId, userId, 'BLOCKED', token));
    });
    setSelectedUsers([]);
    setConfirmOpen(false);
    onClose();
  };

  const handleUnblock = (userId) => {
    dispatch(updateUserChatStatus(chatId, userId, 'DEFAULT', token));
  };

  const handleClose = () => {
    setSelectedUsers([]);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="block-member-modal-title"
        aria-describedby="block-member-modal-description"
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <IconButton
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="close-block-member-modal"
            >
              <X size={24} />
            </IconButton>
            <Typography id="block-member-modal-title" variant="h6" className="text-white mb-4 flex items-center">
              <Ban className="text-red-500 mr-2" size={24} />
              Manage Members
            </Typography>
            <List className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
              {users && users.length > 0 ? (
                users.map((user) => {
                  if (!user || !user.id) {
                    return null;
                  }

                  const statusObj = memberStatuses[user.id];
                  const status = statusObj?.status || 'DEFAULT';

                  return (
                    <div key={user.id} className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="text-red-500 dark:text-red-400"
                          inputProps={{ 'aria-label': `select-${user.fullName}` }}
                        />
                        <span className="text-gray-300 ml-2">{user.fullName}</span>
                      </div>
                      {status === 'BLOCKED' ? (
                        <Button
                          onClick={() => handleUnblock(user.id)}
                          variant="outlined"
                          className="flex items-center text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors focus:outline-none"
                          size="small"
                          startIcon={<Ban size={18} />}
                          aria-label={`unblock-${user.fullName}`}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSelectUser(user.id)}
                          variant="outlined"
                          className="flex items-center text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors focus:outline-none"
                          size="small"
                          startIcon={<Ban size={18} />}
                          aria-label={`block-${user.fullName}`}
                        >
                          Block
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <Typography className="text-gray-300">No members to manage.</Typography>
              )}
            </List>
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                onClick={handleClose}
                variant="outlined"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBlock}
                variant="contained"
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                disabled={selectedUsers.length === 0}
                startIcon={<Ban size={18} />}
              >
                Block Selected
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-block-title"
        aria-describedby="confirm-block-description"
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <Typography id="confirm-block-title" variant="h6" className="text-white flex items-center mb-4">
              <AlertTriangle className="text-yellow-500 mr-2" size={24} />
              Confirm Block
            </Typography>
            <Typography id="confirm-block-description" className="text-gray-300 mb-6">
              Are you sure you want to block the selected member(s)? They will no longer be able to send you messages.
            </Typography>
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmBlock}
                variant="contained"
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-md hover:shadow-lg"
                startIcon={<Ban size={18} />}
              >
                Confirm Block
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BlockMemberModal;