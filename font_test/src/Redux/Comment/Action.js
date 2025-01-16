import { BASE_API_URL } from "../../config/api";

export const CREATE_COMMENT = 'CREATE_COMMENT';
export const FETCH_COMMENTS = 'FETCH_COMMENTS';

export const createComment = (commentData) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_API_URL}/comments/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${commentData.token}`,
            },
            body: JSON.stringify({
                blogId: commentData.blogId,
                content: commentData.content,
                parentCommentId: commentData.parentCommentId || null
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to create comment');
        }

        const data = await res.json();
        console.log("Comment created:", data); // Add this for debugging

        dispatch({ type: CREATE_COMMENT, payload: data });
        
        // Refresh comments
        await dispatch(fetchComments({
            blogId: commentData.blogId,
            token: commentData.token
        }));
        
        return data;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
};

export const fetchComments = (commentData) => async (dispatch) => {
    try {
        const res = await fetch(`${BASE_API_URL}/comments/blog/${commentData.blogId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${commentData.token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch comments');
        }

        const data = await res.json();
        
        // Transform the data to include nested structure
        const transformedData = data.map(comment => ({
            ...comment,
            replies: comment.replies || []
        }));

        dispatch({ 
            type: FETCH_COMMENTS, 
            payload: { 
                blogId: commentData.blogId, 
                comments: transformedData 
            } 
        });
        return transformedData;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};
