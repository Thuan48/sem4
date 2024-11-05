import React, { useState } from 'react';
import SelectMember from './SelectMember';
import ChatCard from '../ChatCard/ChatCard';
import { ArrowLeft, ArrowRight, Search, UserPlus } from 'lucide-react';
import NewGroup from './NewGroup';
import { useDispatch, useSelector } from 'react-redux';
import { searchUser } from '../../Redux/Auth/Action';

const CreateGroup = ({ setIsGroup }) => {
  const [newGroup, setNewGroup] = useState(false);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const { auth } = useSelector(store => store);

  const [groupMember, setGroupMember] = useState([]);

  const removeMember = (item) => {
    const updatedGroupMembers = groupMember.filter(member => member.id !== item.id);
    setGroupMember(updatedGroupMembers);
  };

  const handleAddMember = (item) => {
    if (!groupMember.some(member => member.id === item.id)) {
      setGroupMember([...groupMember, item]);
    }
  };

  const handlerSearch = (value) => {
    setQuery(value);
    if (value) {
      dispatch(searchUser({ keyword: value, token }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        {!newGroup ? (
          <div className="flex flex-col h-[80vh]">
            <div className="flex items-center space-x-4 bg-teal-500 text-white px-6 py-4 rounded-t-lg">
              <button
                onClick={() => setIsGroup(false)}
                className="p-2 hover:bg-teal-600 rounded-full transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Add Group Members</h1>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 mb-3">
                {groupMember.map((item) => (
                  <SelectMember
                    key={item.id}
                    removeMember={() => removeMember(item)}
                    member={item}
                  />
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  onChange={(e) => handlerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  placeholder="Search users to add..."
                  value={query}
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {query && auth.searchUser?.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddMember(item)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChatCard
                      userImg={
                        item.profile_picture
                          ? `http://localhost:8080/uploads/profile/${item.profile_picture}`
                          : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"
                      }
                      name={item.full_name}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 flex justify-center border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setNewGroup(true)}
                className="flex items-center justify-center w-12 h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <NewGroup setIsGroup={setIsGroup} groupMember={groupMember} />
        )}
      </div>
    </div>
  );
};

export default CreateGroup;