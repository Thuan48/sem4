import {
    FETCH_BLOGS_REQUEST,
    FETCH_BLOGS_SUCCESS,
    FETCH_BLOGS_FAILURE,
    CREATE_BLOG,
    UPDATE_BLOG,
    DELETE_BLOG
} from './Action';

const initialState = {
    loading: false,
    data: [],
    error: null,
    currentPage: 0,
};

const blogReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_BLOGS_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case FETCH_BLOGS_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload.blogs, // Ensure 'blogs' contains 'images'
                totalPages: action.payload.totalPages,
                currentPage: action.payload.currentPage,
                hasMore: action.payload.hasMore,
                error: null
            };
        case FETCH_BLOGS_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case CREATE_BLOG:
            return {
                ...state,
                data: [action.payload, ...state.data], // 'action.payload' should include 'images'
                loading: false,
                error: null
            };
        case UPDATE_BLOG:
            // ...existing code...
            return state;
        case DELETE_BLOG:
            return {
                ...state,
                data: state.data.filter(blog => blog.id !== action.payload.blogId), // Corrected payload access
                error: action.payload.error || null,
            };
        default:
            return state;
    }
};

export default blogReducer;
