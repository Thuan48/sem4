import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createGroup } from '../../Redux/Chat/Action';
import { ArrowLeft, Check, ImagePlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewGroup = ({ groupMember, setIsGroup }) => {
  const [isImageLoad, setIsImageLoad] = useState(false);
  const [groupName, setGroupname] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  const handleCreateGroup = async () => {
    setLoading(true);
    const userIds = Array.from(groupMember).map(user => user.id);

    const group = {
      userIds,
      chat_name: groupName,
      chat_image: profilePicture,
    };

    const data = {
      resData: group,
      token,
    };

    await dispatch(createGroup(data));
    setIsGroup(false);
    navigate("/");
  };

  const imageUrl = profilePicture ? URL.createObjectURL(profilePicture) :
    "https://cdn.pixabay.com/photo/2024/09/05/08/52/watzmann-9024268_640.jpg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-center space-x-4 bg-teal-500 text-white px-6 py-4 rounded-t-lg">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-teal-600 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">New Group</h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <label
              htmlFor="ImgInput"
              className="relative group cursor-pointer"
            >
              <div className="relative">
                <img
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-200 group-hover:scale-105"
                  src={imageUrl}
                  alt="Group profile"
                />
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-white" />
                </div>
                {isImageLoad && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            </label>
            <input
              type="file"
              id="ImgInput"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />

            <div className="w-full">
              <input
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                placeholder="Group Name"
                value={groupName}
                type="text"
                onChange={(e) => setGroupname(e.target.value)}
              />
            </div>

            {groupName && (
              <button
                onClick={handleCreateGroup}
                disabled={loading}
                className="flex items-center justify-center w-12 h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Check className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewGroup;