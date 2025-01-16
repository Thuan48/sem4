import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBlog } from '../../Redux/Blog/Action';

const CreatePost = ({ isDarkMode }) => {
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const dispatch = useDispatch();
    const token = localStorage.getItem('token');

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prevImages => [...prevImages, ...files]);
        
        // Create preview URLs
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    };

    const removeImage = (index) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
        setPreviewUrls(prevUrls => {
            const newUrls = prevUrls.filter((_, i) => i !== index);
            URL.revokeObjectURL(prevUrls[index]); // Clean up URL
            return newUrls;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && images.length === 0) return;

        const formData = new FormData();
        formData.append('content', content);
        if (images.length > 0) {
            images.forEach((image) => {
                formData.append('images', image);
            });
        }

        try {
            await dispatch(createBlog(formData, token)); // Pass the FormData directly now
            setContent('');
            setImages([]);
            setPreviewUrls(prevUrls => {
                prevUrls.forEach(url => URL.revokeObjectURL(url));
                return [];
            });
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <h2 className="text-2xl font-bold mb-4 text-teal-600">Share Your Thoughts</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
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
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        multiple
                    />
                    <label
                        htmlFor="image-upload"
                        className={`cursor-pointer px-4 py-2 rounded-md ${
                            isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                        } hover:bg-indigo-500 hover:text-white transition duration-300`}
                    >
                        Add Photo
                    </label>
                    <button
                        type="submit"
                        className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
                    >
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;

