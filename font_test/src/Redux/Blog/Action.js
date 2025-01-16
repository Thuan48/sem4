import { BASE_API_URL } from "../../config/api";

export const FETCH_BLOGS_REQUEST = 'FETCH_BLOGS_REQUEST';
export const FETCH_BLOGS_SUCCESS = 'FETCH_BLOGS_SUCCESS';
export const FETCH_BLOGS_FAILURE = 'FETCH_BLOGS_FAILURE';
export const CREATE_BLOG = 'CREATE_BLOG';
export const UPDATE_BLOG = 'UPDATE_BLOG';
export const DELETE_BLOG = 'DELETE_BLOG';

export const fetchBlogsRequest = () => ({
    type: FETCH_BLOGS_REQUEST,
});

export const fetchBlogsSuccess = (blogs, page) => ({
    type: FETCH_BLOGS_SUCCESS,
    payload: { blogs, page },
});

export const fetchBlogsFailure = (error) => ({
    type: FETCH_BLOGS_FAILURE,
    payload: error,
});

export const fetchBlogs = (page = 0, size = 10) => {
    return async (dispatch) => {
        dispatch(fetchBlogsRequest());
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch(`${BASE_API_URL}/blogs?page=${page}&size=${size}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                // Handle specific nesting depth error
                if (errorData.error && errorData.error.includes('nesting depth')) {
                    dispatch(fetchBlogsFailure('Server error: JSON nesting depth exceeded.'));
                } else {
                    throw new Error(`Failed to fetch blogs: ${res.statusText}`);
                }
                return;
            }

            const data = await res.json();
            dispatch({
                type: FETCH_BLOGS_SUCCESS,
                payload: {
                    blogs: data.content,
                    totalPages: data.totalPages,
                    currentPage: page,
                    hasMore: data.hasNext
                }
            });
        } catch (error) {
            console.error('Error in fetchBlogs:', error);
            dispatch(fetchBlogsFailure(error.toString()));
        }
    };
};

export const createBlog = (formData, token) => async (dispatch) => {
    try {
        // No need to build a new FormData here; use the one passed from the component.
        const res = await fetch(`${BASE_API_URL}/blogs/create`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Do NOT set "Content-Type" when sending FormData
            },
            body: formData
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`Failed to create blog: ${errorData.message}`);
        }

        const resData = await res.json();
        dispatch({ type: CREATE_BLOG, payload: resData });
        return resData;
    } catch (error) {
        console.error("Error creating blog:", error);
        throw error;
    }
};

export const updateBlog = (blogId, blogData, token) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_API_URL}/blogs/update/${blogId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(blogData),
        });
        const resData = await res.json();
        console.log('Updated blog:', resData);
        dispatch({ type: UPDATE_BLOG, payload: resData });
    } catch (error) {
        console.log("catch error:", error);
    }
};

export const deleteBlog = (blogId, token) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_API_URL}/blogs/delete/${blogId}`, {
            method: "DELETE",
            headers: {
                // Use Bearer token here
                "Authorization": `Bearer ${token}`
            },
        });

        if (!res.ok) {
            // Attempt JSON parse, then fallback to text
            let errorMsg;
            try {
                const errorData = await res.json();
                errorMsg = errorData.message;
            } catch (e) {
                errorMsg = await res.text();
            }
            throw new Error(errorMsg || 'Failed to delete blog');
        }

        // If server returns JSON, parse it; otherwise ignore
        let resData = null;
        try {
            resData = await res.json();
        } catch (e) {
            console.log('No valid JSON response:', e);
        }

        dispatch({
            type: DELETE_BLOG,
            payload: { blogId }
        });

        return resData;
    } catch (error) {
        console.error("Delete error:", error);
        throw error;
    }
};

