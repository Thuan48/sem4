import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from '../../Redux/Auth/Action';
import { ArrowLeft } from 'lucide-react';

const UserCard = ({ handleNavigate, userId }) => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.auth.getUserProfile);
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    if (token && userId) {
      dispatch(getUserProfile({ id: userId, token }));
    }
  }, [dispatch, token, userId]);

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  const imageUrl = userProfile.profile_picture
    ? `http://localhost:8080/uploads/profile/${userProfile.profile_picture}`
    : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png";

  const maskEmail = (email) => {
    if (!email) return 'No Email Provided';
    const [localPart, domain] = email.split('@');
    if (!domain) return 'Invalid Email';
    const maskedLocalPart = localPart
      .slice(0, Math.ceil(localPart.length / 2))
      .padEnd(localPart.length, '*');
    return `${maskedLocalPart}@${domain}`;
  };

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
          <h1 className="text-xl font-semibold">User Card</h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                className="rounded-full w-32 h-32 object-cover border-4 border-white shadow-lg"
                src={imageUrl}
                alt="Profile"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-gray-600 dark:text-gray-100">{userProfile.full_name}</p>
            <p className="text-gray-600 dark:text-gray-100">{userProfile.bio}</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Email:</span>
                <span className="text-gray-800 dark:text-gray-100">{maskEmail(userProfile.email)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Gender:</span>
                <span className="text-gray-800 dark:text-gray-100">{userProfile.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                <span className="text-gray-800 dark:text-gray-100">{userProfile.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Date of Birth:</span>
                <span className="text-gray-800 dark:text-gray-100">{userProfile.dob}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Address:</span>
                <span className="text-gray-800 dark:text-gray-100">{userProfile.address}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-2">
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

export default UserCard;

