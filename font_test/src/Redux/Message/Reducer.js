import { CREATE_NEW_MESSAGE, DELETE_MESSAGE, GET_ALL_MESSAGE } from "./ActionType";

const initialValue = {
  messages: [],
  newMessage: null,
}
export const messageReducer = (store = initialValue, { type, payload }) => {
  if (type === CREATE_NEW_MESSAGE) {
    return { ...store, newMessage: payload }
  }
  else if (type === GET_ALL_MESSAGE) {
    return { ...store, messages: payload }
  }
  else if (type === DELETE_MESSAGE) {
    return { ...store, messages: store.messages.filter((message) => message._id !== payload) }
  }
  return store;
}