import React, { useState } from 'react';
import { TextField, Button, Avatar, Typography, Paper } from '@mui/material';
import { useSelector } from 'react-redux';

const Comment = ({ blogId, onAddComment, isDarkMode }) => {
    const [content, setContent] = useState('');
    const auth = useSelector((state) => state.auth);
    const comments = useSelector((state) => 
        state.comments?.commentsByBlogId?.[blogId] || []
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onAddComment(blogId, content);
        setContent('');
    };

    return (
        <div className="comments-section" style={{ marginTop: '20px' }}>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <Avatar src={auth.reqUser?.profile_picture} />
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: isDarkMode ? '#4a5568' : 'inherit',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#14b8a6',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: isDarkMode ? '#f7fafc' : 'inherit',
                            },
                            backgroundColor: isDarkMode ? '#3c4758' : 'inherit',
                        }}
                    />
                    <Button 
                        variant="contained" 
                        color="primary" 
                        type="submit"
                        disabled={!content.trim()}
                        sx={{
                            backgroundColor: '#14b8a6',
                            '&:hover': {
                                backgroundColor: '#0d9488',
                            },
                        }}
                    >
                        Post
                    </Button>
                </div>
            </form>

            <div className="comments-list">
                {comments?.map((comment) => (
                    <Paper 
                        key={comment.id} 
                        elevation={0} 
                        sx={{ 
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: isDarkMode ? '#3c4758' : 'rgba(0, 0, 0, 0.04)',
                            color: isDarkMode ? '#f7fafc' : 'inherit',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Avatar 
                                src={comment.user?.profile_picture}
                                style={{ width: 32, height: 32 }}
                            />
                            <div>
                                <Typography variant="subtitle2">
                                    {comment.user?.full_name}
                                </Typography>
                                <Typography variant="body2">
                                    {comment.content}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    color="textSecondary"
                                >
                                    {new Date(comment.createdAt).toLocaleString()}
                                </Typography>
                            </div>
                        </div>
                    </Paper>
                ))}
            </div>
        </div>
    );
};

export default Comment;
