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
        case 'FETCH_BLOGS_SUCCESS':
            return {
                ...state,
                loading: false,
                data: action.payload.blogs,  // Don't append, just store current page data
                totalPages: action.payload.totalPages,
                currentPage: action.payload.currentPage,
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
                data: [...state.data, action.payload]
            };
        case UPDATE_BLOG:
            return {
                ...state,
                data: state.data.map(blog =>
                    blog.id === action.payload.id ? action.payload : blog
                )
            };
        case DELETE_BLOG:
            return {
                ...state,
                data: state.data.filter(blog => blog.id !== action.payload.id)
            };
        default:
            return state;
    }
};

export default blogReducer;
