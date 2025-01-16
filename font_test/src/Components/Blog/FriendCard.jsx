import React from 'react';
import { BASE_API_URL } from '../../config/api';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const FriendCard = ({ friend, isDarkMode }) => {
    return (
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md transition-all hover:shadow-lg`}>
            <div className="flex items-center space-x-3">
                <LazyLoadImage
                    src={friend?.profile_picture
                        ? `${BASE_API_URL}/uploads/profile/${friend.profile_picture}`
                        : 'https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png'
                    }
                    alt={friend?.fullName || friend?.full_name || 'Friend'}
                    className="w-10 h-10 rounded-full object-cover"
                    effect="blur"
                />
                <div className="flex-1">
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {friend?.fullName || friend?.full_name || 'No Name'}
                    </h3>
                    <p className="text-sm text-gray-500">Online</p>
                </div>
            </div>
        </div>
    );
};

export default FriendCard;
