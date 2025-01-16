import { CREATE_COMMENT, FETCH_COMMENTS } from './Action';

const initialState = {
    commentsByBlogId: {},
    loading: false,
    error: null
};

const commentReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_COMMENT:
            const newComment = action.payload;
            if (!newComment || !newComment.blogId) return state;

            let updatedComments;
            if (newComment.parentCommentId) {
                // Handle nested comment
                updatedComments = (state.commentsByBlogId[newComment.blogId] || []).map(comment => {
                    if (comment.id === newComment.parentCommentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newComment]
                        };
                    }
                    return comment;
                });
            } else {
                // Handle top-level comment
                updatedComments = [
                    ...(state.commentsByBlogId[newComment.blogId] || []),
                    newComment
                ];
            }

            return {
                ...state,
                commentsByBlogId: {
                    ...state.commentsByBlogId,
                    [newComment.blogId]: updatedComments
                }
            };

        case FETCH_COMMENTS:
            if (!action.payload || !action.payload.blogId) return state;
            return {
                ...state,
                commentsByBlogId: {
                    ...state.commentsByBlogId,
                    [action.payload.blogId]: action.payload.comments
                }
            };

        default:
            return state;
    }
};

export default commentReducer;
