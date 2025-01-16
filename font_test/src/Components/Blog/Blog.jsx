import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, deleteBlog } from '../../Redux/Blog/Action';
import { createComment, fetchComments } from '../../Redux/Comment/Action';
import { currenUser } from '../../Redux/Auth/Action';
import { useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsSun, BsMoon } from 'react-icons/bs';
import { FaRegComment, FaRegHeart, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Navbar from './Navbar';
import CreatePost from './CreateBlog';
import Post from './Post';
import Comment from './Comment';
import { getFriends } from '../../Redux/Friend/Action';
import FriendCard from './FriendCard';
import { setDarkMode } from '../../Redux/Theme/Action';

const Blog = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { auth } = useSelector(store => store);
    const { commentsByBlogId } = useSelector(store => store.comments);
    const { data: storeBlogs, hasMore: storeHasMore } = useSelector(store => store.blogs); // Destructure hasMore
    const { friendsList } = useSelector(store => store.friends);
    const { isDarkMode } = useSelector(state => state.theme);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [expandedComments, setExpandedComments] = useState({});
    const [likedBlogs, setLikedBlogs] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        // Only load blogs if the user is authenticated
        if (auth.reqUser) {
            loadMore();
        }
    }, [auth.reqUser]); // Added auth.reqUser as a dependency

    useEffect(() => {
        if (storeBlogs.length > 0) {
            const token = localStorage.getItem('token');
            // Fetch comments for each blog sequentially to avoid overwhelming the server
            const fetchCommentsForBlogs = async () => {
                for (const blog of storeBlogs) {
                    try {
                        const comments = await dispatch(fetchComments({
                            blogId: blog.id,
                            token
                        }));
                        // Optionally, handle the fetched comments if needed
                    } catch (error) {
                        console.error(`Error fetching comments for blog ${blog.id}:`, error);
                    }
                }
            };
            fetchCommentsForBlogs();
        }
    }, [storeBlogs, dispatch]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!auth.reqUser && token) {
            dispatch(currenUser(token));
        }
    }, [auth.reqUser, dispatch]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            dispatch(getFriends(token));
        }
    }, [dispatch]);

    const loadMore = async () => {
        if (loading || !hasMore) return; // Prevent multiple loads
        try {
            setLoading(true);
            await dispatch(fetchBlogs(page));
            setPage(prev => prev + 1);
            // Update hasMore after fetching blogs
            setHasMore(storeHasMore);
        } catch (error) {
            console.error('Error loading blogs:', error);
            // Handle JSON parsing errors
            if (error instanceof SyntaxError) {
                console.error('Invalid JSON:', error.message);
            }
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (blogId, content, parentCommentId = null) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        try {
            const result = await dispatch(createComment({
                blogId,
                content,
                parentCommentId,
                token
            }));
            
            if (result) {
                // Refresh comments only if comment creation was successful
                dispatch(fetchComments({
                    blogId,
                    token
                }));
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDelete = async (blogId) => {
        const token = auth.token || localStorage.getItem('token');
        if (!token) return;
        try {
            await dispatch(deleteBlog(blogId, token));
        } catch (error) {
            console.error('Error deleting blog:', error);
        }
    };

    const toggleComments = (blogId) => {
        setExpandedComments(prev => ({
            ...prev,
            [blogId]: !prev[blogId]
        }));
    };

    const toggleLike = (blogId) => {
        setLikedBlogs(prev => ({
            ...prev,
            [blogId]: !prev[blogId]
        }));
    };

    const toggleDarkMode = () => {
        dispatch(setDarkMode(!isDarkMode));
        document.documentElement.classList.toggle('dark', !isDarkMode);
    };

    const getFriend = (relation) => {
        if (!auth.reqUser || !relation || !relation.userInitiator || !relation.userRecipient) {
            return null;
        }
        return relation.userInitiator.id === auth.reqUser.id
            ? relation.userRecipient
            : relation.userInitiator;
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className={`w-full md:w-3/4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <CreatePost isDarkMode={isDarkMode} />
                        <div className="mt-8 space-y-6">
                            {storeBlogs.map(blog => (
                                <Post
                                    key={blog.id}
                                    blog={blog}
                                    isDarkMode={isDarkMode}
                                    isLiked={likedBlogs[blog.id]}
                                    toggleLike={() => toggleLike(blog.id)}
                                    toggleComments={() => toggleComments(blog.id)}
                                    showComments={expandedComments[blog.id]}
                                    comments={commentsByBlogId[blog.id] || []}
                                    onAddComment={handleAddComment}
                                    authUserId={auth.reqUser?.id}
                                    onDelete={handleDelete}
                                    onUpdate={(blog) => { }}
                                />
                            ))}
                        </div>
                        {hasMore && (
                            <button
                                onClick={loadMore}
                                className="w-full mt-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                            >
                                Load More
                            </button>
                        )}
                    </div>
                    <div className="w-full md:w-1/4">
                        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>Friends</h2>
                        <div className="space-y-4">
                            {friendsList.map(relation => {
                                const friend = getFriend(relation);
                                if (!friend) return null;
                                return (
                                    <FriendCard
                                        key={friend.id}
                                        friend={friend}
                                        isDarkMode={isDarkMode}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blog;

