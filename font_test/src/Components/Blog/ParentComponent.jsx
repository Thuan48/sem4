
import React, { useState } from 'react';
import { BASE_API_URL } from "../../config/api";

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

const Comment = ({ blogId, comments, onAddComment, isDarkMode, userId, parentId = null }) => {
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const handleReply = (commentId) => {
        setReplyingTo(commentId);
    };

    const submitReply = () => {
        if (replyContent.trim() === '') return;
        onAddComment(blogId, replyContent, replyingTo);
        setReplyContent('');
        setReplyingTo(null);
    };

    const nestedComments = comments.filter(comment => comment.parentCommentId === parentId);

    return (
        <div>
            {nestedComments.map(comment => (
                <div key={comment.id} className="ml-4 mt-2">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        <div className="flex items-center gap-2">
                            <img
                                src={comment.user?.profile_picture
                                    ? `${BASE_API_URL}/uploads/profile/${comment.user.profile_picture}`
                                    : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"}
                                alt={comment.user?.full_name}
                                className="w-8 h-8 rounded-full"
                            />
                            <div>
                                <p className="font-semibold">{comment.user?.full_name}</p>
                                <p className="text-sm">{comment.content}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTimeAgo(comment.createdAt)}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => handleReply(comment.id)} className="text-blue-500 mt-1">Reply</button>
                        {replyingTo === comment.id && (
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write a reply..."
                                    className={`flex-grow p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                                />
                                <button onClick={submitReply} className="bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition duration-300">
                                    Submit
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Recursively render nested replies */}
                    <Comment
                        blogId={blogId}
                        comments={comments}
                        onAddComment={onAddComment}
                        isDarkMode={isDarkMode}
                        userId={userId} // Added userId prop
                        parentId={comment.id}
                    />
                </div>
            ))}
        </div>
    );
};

export default Comment;