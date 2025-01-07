import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBlog } from '../../Redux/Blog/Action';
import { TextField, Button, Snackbar, Alert, Box, Typography } from '@mui/material';

const CreateBlog = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const token = localStorage.getItem('token');

    const validateForm = () => {
        const newErrors = {};
        if (!title) newErrors.title = 'Title is required';
        if (!content) newErrors.content = 'Content is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) formData.append('image', image);

        try {
            await dispatch(createBlog(formData, token));
            setSnackbarOpen(true);
            onClose(); // Close the modal after submission
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
            />
            <TextField
                label="Content"
                fullWidth
                multiline
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                error={!!errors.content}
                helperText={errors.content}
            />
            <Button
                variant="contained"
                component="label"
            >
                Upload Image
                <input type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
            </Button>
            <Button type="submit" variant="contained" color="primary">
                Submit
            </Button>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert severity="success">Blog created successfully!</Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateBlog;