import { SET_DARK_MODE } from './ActionType';

const initialState = {
    isDarkMode: localStorage.getItem('darkMode') === 'true'
};

const themeReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_DARK_MODE:
            localStorage.setItem('darkMode', action.payload);
            return {
                ...state,
                isDarkMode: action.payload
            };
        default:
            return state;
    }
};

export default themeReducer;
