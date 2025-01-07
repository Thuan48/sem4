import { BASE_API_URL } from "../../config/api";

export const ADD_COMMENT = 'ADD_COMMENT';
export const FETCH_COMMENTS = 'FETCH_COMMENTS';

export const createComment = (blogId, content, token) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_API_URL}/comments/${blogId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        if (!res.ok) throw new Error('Failed to create comment');
        const data = await res.json();
        dispatch({ 
            type: ADD_COMMENT, 
            payload: { ...data, blogId } 
        });
        return data;
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
};

export const fetchComments = (blogId) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_API_URL}/comments/${blogId}`);
        if (!res.ok) throw new Error('Failed to fetch comments');
        const data = await res.json();
        dispatch({ 
            type: FETCH_COMMENTS, 
            payload: { blogId, comments: data } 
        });
        return data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};
