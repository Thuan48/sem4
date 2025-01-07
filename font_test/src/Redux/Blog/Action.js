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
        console.log('Fetching page:', page); // Debug log

        try {
            const res = await fetch(`${BASE_API_URL}/blogs?page=${page}&size=${size}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch blogs: ${res.statusText}`);
            }

            const data = await res.json();
            return dispatch({
                type: 'FETCH_BLOGS_SUCCESS',
                payload: {
                    blogs: data.content,
                    totalPages: data.totalPages,
                    currentPage: page,
                    hasMore: data.hasNext
                }
            });
        } catch (error) {
            dispatch(fetchBlogsFailure(error.toString()));
            throw error;
        }
    };
};

export const createBlog = (blogData, token) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_API_URL}/blogs/create`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: blogData,
        });
        const resData = await res.json();
        console.log('Created blog:', resData);
        dispatch({ type: CREATE_BLOG, payload: resData });
    } catch (error) {
        console.log("catch error:", error);
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
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const resData = await res.json();
        console.log('Deleted blog:', resData);
        dispatch({ type: DELETE_BLOG, payload: resData });
    } catch (error) {
        console.log("catch error:", error);
    }
};
