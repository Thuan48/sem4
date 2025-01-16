import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { BsCalendarDate, BsGenderAmbiguous, BsTelephone, BsGeoAlt } from 'react-icons/bs';
import { MdEmail } from 'react-icons/md';
import { motion } from 'framer-motion';
import { BASE_API_URL } from '../../config/api';
import { getUserProfile, currenUser, updateProfile, logout } from '../../Redux/Auth/Action';
import { setDarkMode } from '../../Redux/Theme/Action';
import Post from './Post';
import Navbar from './Navbar';
import { getToken } from '../../utils/tokenManager';
import { fetchBlogs } from '../../Redux/Blog/Action'; // Import fetchBlogs
import { FiMoreVertical } from 'react-icons/fi'; // Import FiMoreVertical


const UserProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userId } = useParams();
    const { reqUser, userProfile } = useSelector(state => state.auth);
    const { data: userBlogs } = useSelector(store => store.blogs);
    const { isDarkMode } = useSelector(state => state.theme);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Added state for dropdown
    
    // Initialize formData without the email field
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        dob: '',
        gender: '',
        phone: '',
        address: '',
    });

    const toggleDarkMode = () => {
        dispatch(setDarkMode(!isDarkMode));
        document.documentElement.classList.toggle('dark', !isDarkMode);
    };

    useEffect(() => {
        const initializeProfile = async () => {
            const token = getToken();
            if (!token) {
                navigate('/signin');
                return;
            }

            try {
                setLoading(true);
                // First ensure we have the current user's data
                await dispatch(currenUser(token));
                
                // Then fetch the profile data
                await dispatch(getUserProfile({ 
                    id: userId || reqUser?.id || localStorage.getItem('userId'), 
                    token 
                }));

                // Fetch blogs after user is loaded
                await dispatch(fetchBlogs(0)); // Fetch the first page of blogs
            } catch (error) {
                console.error('Error initializing profile:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeProfile();
    }, [userId, dispatch]);

    // Use this effect to update localStorage when reqUser changes
    useEffect(() => {
        if (reqUser?.id) {
            localStorage.setItem('userId', reqUser.id);
        }
    }, [reqUser]);

    // Define displayUser before using it in useEffect
    const displayUser = userId ? userProfile : reqUser;

    // useEffect to set formData when displayUser is available
    useEffect(() => {
        if (displayUser) {
            setFormData({
                fullName: displayUser.full_name || '',
                bio: displayUser.bio || '',
                dob: displayUser.dob || '',
                gender: displayUser.gender || '',
                phone: displayUser.phone || '',
                address: displayUser.address || '',
                // Add other fields as necessary
            });
        }
    }, [displayUser]);

    // Show loading state
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Use the correct user data based on whether we're viewing own profile or other user's
    const userPosts = userBlogs.filter(blog => blog.user.id === displayUser?.id);

    // Handler to toggle dropdown visibility
    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Handler to open the update profile popup
    const handleUpdateProfileClick = () => {
        setIsDropdownOpen(false);
        navigate('/update-profile'); // Redirect to show UserProfileCard.jsx popup
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/signin");
    };

    // Add this function to handle blog updates
    const handleBlogUpdate = async () => {
        const token = getToken();
        if (token) {
            await dispatch(fetchBlogs(0));
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            {displayUser && (
                <div className="container mx-auto px-4 py-8">
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-lg shadow-lg overflow-hidden ${
                            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                        } mb-8 transition-colors duration-200`}
                    >
                        {/* Cover Photo */}
                        <div className="h-48 bg-gradient-to-r from-teal-500 to-blue-500"></div>

                        {/* Profile Info */}
                        <div className="relative px-6 pb-6">
                            <div className="flex flex-col sm:flex-row items-center">
                                <div className="absolute -top-16">
                                    <LazyLoadImage
                                        src={displayUser?.profile_picture
                                            ? `${BASE_API_URL}/uploads/profile/${displayUser.profile_picture}`
                                            : 'https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png'
                                        }
                                        alt={displayUser?.full_name || 'Profile'}
                                        className="w-32 h-32 rounded-full border-4 border-white object-cover"
                                        effect="blur"
                                    />
                                </div>
                                <div className="mt-20 sm:mt-0 sm:ml-40 text-center sm:text-left relative w-full">
                                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {displayUser?.full_name}
                                    </h1>
                                    <p className="text-gray-500">{displayUser?.bio || 'No bio added yet'}</p>
                                    
                                    {/* 3-Dot Button */}
                                    <div className="absolute top-0 right-0">
                                        <button
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                            aria-label="More options"
                                            onClick={handleDropdownToggle}
                                        >
                                            <FiMoreVertical size={24} />
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                                                <button
                                                    onClick={handleUpdateProfileClick}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                >
                                                    Update Profile
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <MdEmail className="text-teal-500" />
                                    <span>{displayUser?.email}</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <BsCalendarDate className="text-teal-500" />
                                    <span>{displayUser?.dob || 'Not specified'}</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <BsGenderAmbiguous className="text-teal-500" />
                                    <span>{displayUser?.gender || 'Not specified'}</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <BsTelephone className="text-teal-500" />
                                    <span>{displayUser?.phone || 'Not specified'}</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <BsGeoAlt className="text-teal-500" />
                                    <span>{displayUser?.address || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* User's Posts */}
                    <div className="mt-8">
                        <h2 className={`text-2xl font-bold mb-6 transition-colors duration-200 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            My Posts ({userPosts.length})
                        </h2>
                        <div className="space-y-6">
                            {userPosts.map(blog => (
                                <Post
                                    key={blog.id}
                                    blog={blog}
                                    isDarkMode={isDarkMode}
                                    isUserProfile={true}
                                    authUserId={displayUser?.id} // Make sure this is being passed
                                    onBlogUpdate={handleBlogUpdate}
                                />
                            ))}
                            {userPosts.length === 0 && (
                                <p className={`text-center transition-colors duration-200 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    No posts yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
