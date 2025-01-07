import { ADD_COMMENT, FETCH_COMMENTS } from './Action';

const initialState = {
    commentsByBlogId: {},
};

const commentReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_COMMENTS:
            return {
                ...state,
                commentsByBlogId: {
                    ...state.commentsByBlogId,
                    [action.payload.blogId]: action.payload.comments
                }
            };
        case ADD_COMMENT:
            const blogId = action.payload.blog.id;
            return {
                ...state,
                commentsByBlogId: {
                    ...state.commentsByBlogId,
                    [blogId]: [
                        ...state.commentsByBlogId[blogId] || [],
                        action.payload
                    ]
                }
            };
        default:
            return state;
    }
};

export default commentReducer;
