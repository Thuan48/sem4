import { BASE_API_URL } from "../../config/api";
import React, { useState } from 'react';
import { FaRegComment, FaRegHeart, FaHeart } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Comment from './Comment';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Menu, MenuItem } from '@mui/material';
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Post = ({ blog, isDarkMode, isLiked, toggleLike, toggleComments, showComments, comments, onAddComment, authUserId, onDelete, onUpdate }) => {
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffSec = diffMs / 1000;
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const settings = {
    dots: true,
    infinite: blog?.image?.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: false,
    swipe: true,
    adaptiveHeight: false, // Ensure fixed height
    appendDots: dots => (
      <div>
        <ul className="slick-dots">{dots}</ul>
      </div>
    ),
  };

  const renderImageCarousel = () => {
    if (!blog.image || blog.image.length === 0) return null;

    return (
      <div className="mt-4 pb-6"> {/* Added padding-bottom to accommodate dots */}
        <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
          <Slider {...settings}>
            {blog.image.map((filename, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative cursor-pointer flex items-center justify-center h-full"
                onClick={() => {
                  setLightboxOpen(true);
                  setLightboxImages(blog.image);
                  setCurrentImageIndex(index);
                }}
              >
                <LazyLoadImage
                  src={`${BASE_API_URL}/uploads/blogs/${filename}`}
                  alt={`Blog image ${index + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  effect="blur"
                />
              </motion.div>
            ))}
          </Slider>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="p-4">
        <div className="flex items-center mb-4 justify-between">
          <div className="flex items-center">
            <img
              src={blog.user?.profile_picture
                ? `${BASE_API_URL}/uploads/profile/${blog.user.profile_picture}`
                : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"}
              alt={blog.user?.full_name}
              className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200 dark:border-gray-700"
            />
            <div>
              <h3 className="font-semibold text-lg">{blog.user?.full_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatTimeAgo(blog.createTime)}
              </p>
            </div>
          </div>
          {blog.user?.id === authUserId && (
            <>
              <button
                onClick={handleMenuOpen}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <BsThreeDotsVertical className="w-5 h-5" />
              </button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    onUpdate(blog);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    onDelete(blog.id);
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{blog.content}</p>

        {renderImageCarousel()}
      </div>
      <div className="px-4 py-3 flex justify-between items-center border-t dark:border-gray-700">
        <button
          onClick={toggleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            }`}
        >
          {isLiked ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
          <span>Like</span>
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center space-x-2 px-4 py-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <FaRegComment className="w-5 h-5" />
          <span>Comment</span>
        </button>
      </div>
      {showComments && (
        <div className="p-4 border-t dark:border-gray-700">
          <div className="h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700 p-2 rounded-lg comments-scrollbar">
            <Comment
              blogId={blog.id}
              comments={comments} // Ensure this contains the correct comments
              onAddComment={onAddComment}
              isDarkMode={isDarkMode}
              userId={authUserId} // Added userId prop
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;

