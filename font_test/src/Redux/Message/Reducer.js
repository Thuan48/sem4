import { CREATE_NEW_MESSAGE, DELETE_MESSAGE, FETCH_PINNED_MESSAGES_FAILURE, FETCH_PINNED_MESSAGES_SUCCESS, GET_ALL_MESSAGE, GET_UNREAD_COUNT, TOGGLE_PIN_FAILURE, TOGGLE_PIN_SUCCESS } from "./ActionType";

const initialValue = {
  messages: [],
  newMessage: null,
  unreadCount: 0,
  pinnedMessages: {},
  error: null,
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
  else if (type === GET_UNREAD_COUNT) {
    return { ...store, unreadCount: payload }
  }
  else if (type === TOGGLE_PIN_SUCCESS) {
    return { ...store, messages: store.messages.map((message) => message._id === payload ? { ...message, isPinned: !message.isPinned } : message) }
  }
  else if (type === TOGGLE_PIN_FAILURE) {
    return { ...store, error: payload }
  }
  else if (type === FETCH_PINNED_MESSAGES_SUCCESS) {
    const { chatId, messages } = payload; 
    return {
      ...store,
      pinnedMessages: {
        ...store.pinnedMessages,
        [chatId]: messages
      }
    };
  }
  else if (type === FETCH_PINNED_MESSAGES_FAILURE) {
    return { ...store, error: payload }
  }
  return store;
}