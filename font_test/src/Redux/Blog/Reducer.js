import {
    FETCH_BLOGS_REQUEST,
    FETCH_BLOGS_SUCCESS,
    FETCH_BLOGS_FAILURE,
    CREATE_BLOG,
    UPDATE_BLOG,
    DELETE_BLOG
} from './Action';

const initialState = {
    data: [],
    loading: false,
    error: null,
    blogs: [],
    currentPage: 0,
};

const blogReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_BLOGS_REQUEST:
            return {
                ...state,
                loading: true,
                error: '',
            };
        case FETCH_BLOGS_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload.blogs,  // Add this line
                blogs: action.payload.blogs,
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
                blogs: [action.payload, ...state.blogs],
                loading: false,
                error: null
            };
        case UPDATE_BLOG:
            return {
                ...state,
                blogs: state.blogs.map(blog =>
                    blog.id === action.payload.id ? action.payload : blog
                ),
            };
        case DELETE_BLOG:
            return {
                ...state,
                blogs: state.blogs.filter(blog => blog.id !== action.payload.blogId),
                error: action.payload.error || null,
            };
        default:
            return state;
    }
};

export default blogReducer;
