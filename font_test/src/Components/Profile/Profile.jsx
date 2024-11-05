import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckSquare, PenSquare } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../Redux/Auth/Action';

const Profile = ({ handleNavigate }) => {
  const dispatch = useDispatch();
  const { auth } = useSelector(store => store);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(auth.reqUser?.full_name || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const token = localStorage.getItem("token");

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    const formData = new FormData();
    formData.append('full_name', username);
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }
    dispatch(updateUser(formData, token)).then(() => {
      setIsEditing(false);
      handleNavigate();
    });
  };

  const handleChange = (e) => {
    setUsername(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    setUsername(auth.reqUser?.full_name || '');
    setImagePreview(auth.reqUser?.profile_picture ? `http://localhost:8080/uploads/profile/${auth.reqUser.profile_picture}` : null);
  }, [auth.reqUser]);

  const imageUrl = imagePreview || (auth.reqUser?.profile_picture
    ? `http://localhost:8080/uploads/profile/${auth.reqUser.profile_picture}`
    : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-center space-x-4 bg-teal-500 text-white px-6 py-4 rounded-t-lg">
          <button
            onClick={handleNavigate}
            className="p-2 hover:bg-teal-600 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-8">
            <label
              htmlFor="imgInput"
              className="relative group cursor-pointer"
            >
              <div className="relative">
                <img
                  className="rounded-full w-32 h-32 object-cover border-4 border-white shadow-lg transition-transform duration-200 group-hover:scale-105"
                  src={imageUrl}
                  alt="Profile"
                />
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <PenSquare className="w-8 h-8 text-white" />
                </div>
              </div>
            </label>
            <input type="file" id="imgInput" className="hidden" onChange={handleFileChange} accept="image/*" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                Your Name
              </label>

              {!isEditing ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-800 dark:text-gray-200">
                    {username || "username"}
                  </span>
                  <button
                    onClick={handleEditClick}
                    className="p-2 text-teal-500 hover:text-teal-600 transition-colors duration-200"
                  >
                    <PenSquare className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    value={username}
                    onChange={handleChange}
                    type="text"
                    className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={handleSaveClick}
                    className="p-2 text-teal-500 hover:text-teal-600 transition-colors duration-200"
                  >
                    <CheckSquare className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNavigate}
              className="px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;