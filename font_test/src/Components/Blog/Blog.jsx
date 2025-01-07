import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../../Redux/Blog/Action';
import { Modal, Box, Button, Typography, Card, CardContent, Paper, Avatar, TextField, Grid, CircularProgress } from '@mui/material';
import CreateBlog from './CreateBlog';
import InfiniteScroll from 'react-infinite-scroller';
import { createComment, fetchComments } from '../../Redux/Comment/Action';
import Comment from './Comment';
import { useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsSun, BsMoon } from 'react-icons/bs';

const Blog = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const dispatch = useDispatch();
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [allBlogs, setAllBlogs] = useState([]);
    const [open, setOpen] = useState(false);
    const [seenBlogIds, setSeenBlogIds] = useState(new Set());  // Add this line

    const LoadingIndicator = () => (
        <div style={{ 
            width: '100%',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '10px'
        }}>
            <CircularProgress 
                size={50} 
                thickness={4} 
                style={{ 
                    color: '#3f51b5',
                    animation: 'rotate 1s linear infinite'
                }} 
            />
            <Typography 
                variant="body2" 
                style={{ 
                    color: '#666',
                    animation: 'fade 1s ease-in-out infinite'
                }}
            >
                Loading more blogs...
            </Typography>
            <style>
                {`
                    @keyframes rotate {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes fade {
                        0%, 100% { opacity: 0.6; }
                        50% { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );

    const loadMore = async () => {
        if (loading) return;
        
        try {
            setLoading(true);
            // Artificial delay to show loading indicator
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const response = await dispatch(fetchBlogs(page));
            const newBlogs = response.payload.blogs || [];
            const hasMorePages = response.payload.hasMore;
            
            const uniqueNewBlogs = newBlogs.filter(blog => !seenBlogIds.has(blog.id));
            
            if (uniqueNewBlogs.length > 0) {
                uniqueNewBlogs.forEach(blog => seenBlogIds.add(blog.id));
                setAllBlogs(prev => [...prev, ...uniqueNewBlogs]);
                setPage(prev => prev + 1);
                setHasMore(hasMorePages);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading blogs:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const token = localStorage.getItem("token");
    const handleAddComment = async (blogId, content) => {
        try {
            await dispatch(createComment(blogId, content, token));
            // Refresh comments for this blog
            dispatch(fetchComments(blogId));
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    useEffect(() => {
        // Load initial blogs
        loadMore();
    }, []);

    useEffect(() => {
        // Fetch comments whenever new blogs are loaded
        if (allBlogs.length > 0) {
            allBlogs.forEach(blog => {
                dispatch(fetchComments(blog.id));
            });
        }
    }, [allBlogs]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <div className={`relative ${isDarkMode ? 'dark' : ''}`}>
            <div className="w-full py-14 bg-primary dark:bg-gray-800"></div>
            <div className="flex flex-col bg-background dark:bg-gray-900 min-h-[90vh] pt-5 absolute top-6 left-6 right-6 rounded-lg shadow-lg">
                {/* Navigation Bar */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 text-white shadow-md px-6 py-3 mb-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <BsArrowLeft 
                                className="text-2xl cursor-pointer hover:text-teal-200 transition-colors"
                                onClick={() => navigate('/')}
                            />
                            <Typography variant="h6" className="font-semibold">
                                Blogs
                            </Typography>
                        </div>
                        <button 
                            onClick={toggleDarkMode} 
                            className="p-2 rounded-full hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors"
                        >
                            {isDarkMode ? 
                                <BsSun className="text-xl" /> : 
                                <BsMoon className="text-xl" />
                            }
                        </button>
                    </div>
                </div>

                {/* Post Creation Section */}
                <Paper
                    elevation={3}
                    sx={{
                        margin: '0 auto 20px',
                        maxWidth: '600px',
                        padding: '20px',
                        borderRadius: '10px',
                        backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                        color: isDarkMode ? '#f7fafc' : 'inherit',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                            marginRight: '10px', 
                            backgroundColor: isDarkMode ? '#374151' : '#14b8a6'
                        }}>
                            U
                        </Avatar>
                        <TextField
                            placeholder="What's on your mind?"
                            variant="outlined"
                            fullWidth
                            onClick={handleOpen}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: isDarkMode ? '#4b5563' : '#14b8a6',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: isDarkMode ? '#e5e7eb' : 'inherit',
                                },
                            }}
                        />
                    </div>
                </Paper>

                {/* Blog Posts List */}
                <div className="flex-1 px-4 pb-4 overflow-y-auto">
                    <InfiniteScroll
                        pageStart={-1}  // Change this to -1 so first loadMore call will use page 0
                        loadMore={loadMore}
                        hasMore={hasMore && !loading}
                        loader={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '40px 0',
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(5px)'
                            }}>
                                <CircularProgress size={60} thickness={5} style={{ color: '#3f51b5' }} />
                            </div>
                        }
                        threshold={100}
                    >
                        <Grid container spacing={3} justifyContent="center">
                            {loading && allBlogs.length === 0 ? (
                                <LoadingIndicator />
                            ) : (
                                allBlogs.map((blog) => (
                                    <Grid item xs={12} key={blog.id}>
                                        <Card sx={{ 
                                            borderRadius: '10px',
                                            backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                                            color: isDarkMode ? '#f7fafc' : 'inherit',
                                            '& .MuiCardContent-root': {
                                                padding: '20px',
                                            },
                                            '& .MuiTypography-root': {
                                                color: isDarkMode ? '#f7fafc' : 'inherit',
                                            },
                                            '& .MuiTypography-colorTextSecondary': {
                                                color: isDarkMode ? '#cbd5e0' : 'rgba(0, 0, 0, 0.6)',
                                            }
                                        }}>
                                            <CardContent>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <Avatar style={{ marginRight: '10px', backgroundColor: '#3f51b5' }}>
                                                        {blog.user?.full_name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                    <div>
                                                        <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                                                            {blog.user?.full_name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            Posted on: {blog.createTime ? new Date(blog.createTime).toLocaleDateString() : 'Unknown'}
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: '0 0 auto', marginRight: '10px' }}></div>
                                                    <div style={{ flex: '1 1 auto' }}>
                                                        <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                                            {blog.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '10px' }}>
                                                            {blog.content}
                                                        </Typography>
                                                        {blog.image && (
                                                            <img
                                                                src={`http://localhost:8080/uploads/blogs/${blog.image}`}
                                                                alt={blog.title}
                                                                style={{ width: '100%', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <Box sx={{ 
                                                    mt: 2, 
                                                    borderTop: 1, 
                                                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'divider',
                                                    pt: 2 
                                                }}>
                                                    <Comment 
                                                        blogId={blog.id}
                                                        onAddComment={handleAddComment}
                                                        isDarkMode={isDarkMode}
                                                    />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    </InfiniteScroll>
                </div>

                {/* Modal with dark mode support */}
                <Modal 
                    open={open} 
                    onClose={handleClose}
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: isDarkMode ? '#2d3748' : 'background.paper',
                        color: isDarkMode ? '#f7fafc' : 'inherit',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}>
                        <Typography id="modal-modal-title" variant="h6" component="h2" className="mb-4">
                            Create Blog
                        </Typography>
                        <CreateBlog onClose={handleClose} />
                    </Box>
                </Modal>
            </div>
        </div>
    );
};

export default Blog;