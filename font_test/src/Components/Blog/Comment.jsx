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

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const Comment = ({ blogId, comments, onAddComment, parentId = null, userId, isDarkMode }) => { // Added isDarkMode
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [newCommentContent, setNewCommentContent] = useState(''); // Added state for new comment

    const handleReply = (commentId) => {
        setReplyingTo(commentId);
    };

    const submitReply = () => {
        if (replyContent.trim() === '') return;
        onAddComment(blogId, replyContent, replyingTo);
        setReplyContent('');
        setReplyingTo(null);
    };

    const submitNewComment = () => {
        if (newCommentContent.trim() === '') return;
        onAddComment(blogId, newCommentContent, null);
        setNewCommentContent('');
    };

    const nestedComments = comments?.filter(comment => comment.parentCommentId === parentId) || [];

    return (
        <div>
            {parentId === null && ( // Only show new comment input for top-level comments
                <div className="mb-4 flex items-center gap-2">
                    <input
                        type="text"
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        placeholder="Add a comment..."
                        className={`flex-grow p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`} // isDarkMode used
                    />
                    <button 
                        onClick={submitNewComment} 
                        className="bg-teal-600 text-white px-4 py-1 rounded-full hover:bg-teal-700 transition duration-300"
                    >
                        Submit
                    </button>
                </div>
            )}
            {nestedComments.map(comment => (
                <div key={comment.id} className="p-3 flex items-start border-b last:border-none">
                    <img
                        src={comment.user?.profile_picture
                            ? `${BASE_API_URL}/uploads/profile/${comment.user.profile_picture}`
                            : "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_640.png"}
                        alt={comment.user?.full_name}
                        className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
                    />
                    <div className="flex-1">
                        <div className={`bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-left`}> {/* Removed max-w-md and added text-left */}
                            <p className="font-semibold text-sm">{comment.user?.full_name}</p>
                            <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatTimeAgo(comment.createdAt)}</span>
                            <button
                                onClick={() => handleReply(comment.id)}
                                className="text-blue-500 hover:underline"
                            >
                                Reply
                            </button>
                            <button className="text-red-500 hover:underline">❤️</button>
                        </div>
                        {replyingTo === comment.id && (
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                                <button
                                    onClick={submitReply}
                                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 ml-8 border-l-2 border-gray-300 pl-4">
                                <Comment
                                    blogId={blogId}
                                    comments={comment.replies}
                                    onAddComment={onAddComment}
                                    parentId={comment.id}
                                    userId={userId}
                                    isDarkMode={isDarkMode} // Ensure isDarkMode is passed to nested comments
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Comment;

