import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateBlog, fetchBlogs } from '../../Redux/Blog/Action';
import { BASE_API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const EditBlog = ({ blog, onClose, isDarkMode, onUpdate }) => {
    const [content, setContent] = useState(blog.content);
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingImages, setExistingImages] = useState(blog.image || []);
    const dispatch = useDispatch();
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize existing image previews
        if (blog.image) {
            const urls = blog.image.map(img => `${BASE_API_URL}/uploads/blogs/${img}`);
            setPreviewUrls(urls);
        }
    }, [blog]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prevImages => [...prevImages, ...files]);
        
        // Create preview URLs for new images
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    };

    const removeImage = (index, isExisting = false) => {
        if (isExisting) {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
            setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
        } else {
            const adjustedIndex = index - existingImages.length;
            setImages(prevImages => prevImages.filter((_, i) => i !== adjustedIndex));
            setPreviewUrls(prevUrls => {
                const newUrls = prevUrls.filter((_, i) => i !== index);
                URL.revokeObjectURL(prevUrls[index]);
                return newUrls;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('content', content);
            
            // Only send the filenames of existing images, not the full URLs
            const existingImageFilenames = existingImages.map(img => {
                // Extract filename if it's a full URL
                const parts = img.split('/');
                return parts[parts.length - 1];
            });
            
            formData.append('existingImages', JSON.stringify(existingImageFilenames));
            
            if (images.length > 0) {
                images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            await dispatch(updateBlog(blog.id, formData, token));
            await dispatch(fetchBlogs(0)); // Refresh blogs after update
            if (onUpdate) onUpdate(); // Call the callback function if provided
            onClose();
            navigate(-1); // Navigate back to the previous page
        } catch (error) {
            console.error('Error updating blog:', error);
            alert(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-bold mb-4 text-teal-600">Edit Post</h2>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={`w-full mb-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                        rows={3}
                    />
                    {previewUrls.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index, index < existingImages.length)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-4">
                        <input
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                            id="image-upload-edit"
                            multiple
                        />
                        <label
                            htmlFor="image-upload-edit"
                            className={`cursor-pointer px-4 py-2 rounded-md ${
                                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                            } hover:bg-indigo-500 hover:text-white transition duration-300`}
                        >
                            Add Photo
                        </label>
                        <div className="space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition duration-300"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBlog;
