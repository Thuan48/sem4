import { SET_DARK_MODE } from './ActionType';

export const setDarkMode = (isDarkMode) => ({
    type: SET_DARK_MODE,
    payload: isDarkMode
});
