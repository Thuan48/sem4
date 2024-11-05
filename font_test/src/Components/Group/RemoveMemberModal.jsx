import React, { useState } from 'react'
import { Modal, MenuItem, Button, Checkbox, List } from '@mui/material'
import { X, UserMinus, AlertTriangle } from 'lucide-react'

const RemoveMemberModal = ({ open, onClose, users, onRemove }) => {
  const [selectedUsers, setSelectedUsers] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleRemove = () => {
    setConfirmOpen(true)
  }

  const confirmRemove = () => {
    selectedUsers.forEach(userId => onRemove(userId))
    setSelectedUsers([])
    setConfirmOpen(false)
    onClose()
  }

  const handleClose = () => {
    setSelectedUsers([])
    onClose()
  }

  const handleSingleRemove = (userId) => {
    onRemove(userId)
    setSelectedUsers(prev => prev.filter(id => id !== userId))
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="remove-member-modal-title"
        aria-describedby="remove-member-modal-description"
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all scale-95 hover:scale-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 id="remove-member-modal-title" className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Remove Member
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                >
                  <X size={24} />
                </button>
              </div>
              <List className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                {users.map(user => (
                  <MenuItem key={user.id} className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg mb-2">
                    <div className="flex items-center flex-grow">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="text-teal-500 dark:text-teal-400"
                      />
                      <span className="text-gray-700 dark:text-gray-300 ml-2">{user.full_name}</span>
                    </div>
                    <Button
                      onClick={() => handleSingleRemove(user.id)}
                      variant="outlined"
                      className="text-teal-500 border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900 dark:border-teal-400 dark:text-teal-400 rounded-full px-3 py-1 transition-colors focus:outline-none ml-2"
                      size="small"
                    >
                      <UserMinus size={18} className="mr-1" />
                      Remove
                    </Button>
                  </MenuItem>
                ))}
              </List>
              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  className="text-gray-500 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 rounded-full px-6 py-2 transition-colors focus:outline-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRemove}
                  variant="contained"
                  className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700 rounded-full px-6 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-md hover:shadow-lg"
                  disabled={selectedUsers.length === 0}
                >
                  Remove Selected
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-remove-title"
        aria-describedby="confirm-remove-description"
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 id="confirm-remove-title" className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
              <AlertTriangle className="text-yellow-500 mr-2" size={24} />
              Confirm Removal
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to remove the selected member(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                className="text-gray-500 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 rounded-full px-6 py-2 transition-colors focus:outline-none"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRemove}
                variant="contained"
                className="bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700 rounded-full px-6 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-md hover:shadow-lg"
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default RemoveMemberModal