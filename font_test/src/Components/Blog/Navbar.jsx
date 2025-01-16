import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BsArrowLeft, BsSun, BsMoon } from 'react-icons/bs';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Home, MessageCircle, User } from 'lucide-react';
import { Input } from '@mui/material';
import { searchUser } from '../../Redux/Auth/Action';
import { getToken } from '../../utils/tokenManager';

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [query, setQuery] = useState('');
    const { searchUser: searchResults } = useSelector(state => state.auth);
    const token = localStorage.getItem('token');

    const handleSearch = (e) => {
        const keyword = e.target.value;
        setQuery(keyword);
        
        if (keyword.trim()) {
            dispatch(searchUser({ keyword, token }));
        }
    };

    const handleUserClick = (userId) => {
        const token = getToken();
        if (!token) {
            navigate('/signin');
            return;
        }
        
        setQuery(''); // Clear search
        navigate(`/profile/${userId}`);
    };

    return (
        <nav className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-4 shadow-lg sticky top-0 z-10`}>
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex-none">
                    <h1 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-2xl font-bold`}>
                        Chatter Away
                    </h1>
                </div>

                <div className="flex-1 max-w-xl mx-4 relative">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={query}
                            onChange={handleSearch}
                            className={`w-full pl-10 pr-4 py-2 rounded-full ${
                                isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                            } focus:outline-none`}
                        />
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} size={20} />
                    </div>

                    {/* Search Results Dropdown */}
                    {query && searchResults && searchResults.length > 0 && (
                        <div className={`absolute mt-2 w-full rounded-lg shadow-lg ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } max-h-60 overflow-y-auto z-50`}>
                            {searchResults.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserClick(user.id)}
                                    className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}
                                >
                                    <img
                                        src={user.profile_picture
                                            ? `http://localhost:8080/uploads/profile/${user.profile_picture}`
                                            : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"
                                        }
                                        alt={user.full_name}
                                        className="w-8 h-8 rounded-full mr-3"
                                    />
                                    <span>{user.full_name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation Icons */}
                <div className="flex-none flex items-center space-x-6">
                    <button
                        onClick={() => navigate('/blogs')}
                        className={`p-2 rounded-full hover:bg-opacity-10 ${
                            isDarkMode ? 'hover:bg-white text-white' : 'hover:bg-gray-200 text-gray-900'
                        }`}
                    >
                        <Home className="h-6 w-6" />
                    </button>
                    
                    <button
                        onClick={() => navigate('/')}
                        className={`p-2 rounded-full hover:bg-opacity-10 ${
                            isDarkMode ? 'hover:bg-white text-white' : 'hover:bg-gray-200 text-gray-900'
                        }`}
                    >
                        <MessageCircle className="h-6 w-6" />
                    </button>
                    
                    <button
                        onClick={() => navigate('/profile')}
                        className={`p-2 rounded-full hover:bg-opacity-10 ${
                            isDarkMode ? 'hover:bg-white text-white' : 'hover:bg-gray-200 text-gray-900'
                        }`}
                    >
                        <User className="h-6 w-6" />
                    </button>

                    <button 
                        onClick={toggleDarkMode} 
                        className={`p-2 rounded-full ${
                            isDarkMode ? 'hover:bg-white hover:bg-opacity-10' : 'hover:bg-gray-200'
                        }`}
                    >
                        {isDarkMode ? 
                            <BsSun className="h-6 w-6 text-yellow-500" /> : 
                            <BsMoon className="h-6 w-6 text-gray-900" />
                        }
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

