import { CONFIRM_EMAIL, GET_USER_PROFILE, LOGIN, REGISTER, REQ_USER, SEARCH_USER, UPDATE_USER, UPDATE_USER_PROFILE } from "./ActionType"

const initialvalue = {
  signup: null,
  signin: null,
  reqUser: null,
  searchUser: [],
  updateUser: null,
  updateProfile: null,
  getUserProfile: null,
  emailConfirmation: null,
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
  return store;
}