  import React, { useState } from 'react';
  import { searchUser } from '../../Redux/Auth/Action';
  import { useDispatch } from 'react-redux';
  import { Search, UserPlus, X } from 'lucide-react';
  import { addUserGroup } from '../../Redux/Chat/Action';

  const AddMemberModal = ({ openAddMemberModal, closeAddMember, chatId, auth }) => {
    const [query, setQuery] = useState("");
    const token = localStorage.getItem("token");
    const dispatch = useDispatch();

    const handleSearch = () => {
      if (query.trim()) {
        dispatch(searchUser({ keyword: query, token }));
      }
    };
    const addMemberToGroup = (userId) => {
      dispatch(addUserGroup({ chatId, userId, token }));
      closeAddMember();
    };
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${openAddMemberModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add Member</h2>
              <button
                onClick={closeAddMember}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="relative flex items-center mb-6">
              <input
                className="w-full py-2 pl-10 pr-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all"
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Search
                size={20}
                className="absolute left-3 text-gray-400 dark:text-gray-500"
              />
              <button
                onClick={handleSearch}
                className="ml-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Search
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {auth && auth.length > 0 ? (
                auth.map(user => (
                  <div key={user.id} className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-gray-800 dark:text-gray-200">{user.full_name}</span>
                    <button
                      onClick={() => addMemberToGroup(user.id)}
                      className="flex items-center text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 transition-colors focus:outline-none"
                    >
                      <UserPlus size={20} className="mr-1" />
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Not Found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default AddMemberModal;