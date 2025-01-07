import { CHANGE_PASSWORD, CONFIRM_EMAIL, FORGOT_PASSWORD, GET_USER_PROFILE, LOGIN, REGISTER, REQ_USER, RESET_PASSWORD, SEARCH_USER, UPDATE_USER, UPDATE_USER_PROFILE } from "./ActionType"

const initialvalue = {
  signup: null,
  signin: null,
  reqUser: null,
  searchUser: [],
  updateUser: null,
  updateProfile: null,
  getUserProfile: null,
  emailConfirmation: null,
  forgotPassword: null,
  resetPassword: null,
  changePassword: null,
}
export const authReducer = (store = initialvalue, { type, payload }) => {
  if (type === REGISTER) {
    return { ...store, signup: payload }
  }
  else if (type === LOGIN) {
    return { ...store, signin: payload }
  }
  else if (type === REQ_USER) {
    return { ...store, reqUser: payload }
  }
  else if (type === SEARCH_USER) {
    return { ...store, searchUser: payload }
  }
  else if (type === UPDATE_USER) {
    return {
      ...store, reqUser: payload };
  }
  else if(type === UPDATE_USER_PROFILE){
    return { ...store, reqUser: payload }
  }
  else if(type === GET_USER_PROFILE){
    return { ...store, getUserProfile: payload }
  }
  else if(type === CONFIRM_EMAIL){
    return { ...store, emailConfirmation: payload }
  }
  else if(type === FORGOT_PASSWORD){
    return { ...store, forgotPassword: payload }
  }
  else if(type === RESET_PASSWORD){
    return { ...store, resetPassword: payload }
  }
  else if(type === CHANGE_PASSWORD){
    return { ...store, changePassword: payload }
  }
  return store;
}