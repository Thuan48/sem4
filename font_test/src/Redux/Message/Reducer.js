import { ADD_INTERACTION_FAILURE, ADD_INTERACTION_REQUEST, ADD_INTERACTION_SUCCESS, CREATE_NEW_MESSAGE, DELETE_MESSAGE, FETCH_PINNED_MESSAGES_FAILURE, FETCH_PINNED_MESSAGES_SUCCESS, GET_ALL_MESSAGE, GET_UNREAD_COUNT, REMOVE_INTERACTION_FAILURE, REMOVE_INTERACTION_REQUEST, REMOVE_INTERACTION_SUCCESS, SEARCH_MESSAGES_FAILURE, SEARCH_MESSAGES_SUCCESS, TOGGLE_PIN_FAILURE, TOGGLE_PIN_SUCCESS } from "./ActionType";

const initialValue = {
  messages: [],
  newMessage: null,
  unreadCount: 0,
  pinnedMessages: {},
  interactions: {},
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
  else if (type === SEARCH_MESSAGES_SUCCESS) {
    return {
      ...store,
      messages: payload,
      error: null,
    };
  }
  else if (type === SEARCH_MESSAGES_FAILURE) {
    return { ...store, error: payload }
  }
  else if (type === ADD_INTERACTION_REQUEST) {
    return {
      ...store,
      loading: true,
      error: null,
    };
  }
  else if (type === ADD_INTERACTION_SUCCESS) {
    return {
      ...store,
      loading: false,
      messages: store.messages.map(message =>
        message.id === payload.messageId
          ? { ...message, interactions: [...message.interactions, payload.interaction] }
          : message
      ),
    };
  }
  else if (type === ADD_INTERACTION_FAILURE) {
    return {
      ...store,
      loading: false,
      error: payload,
    };
  }
  else if (type === REMOVE_INTERACTION_REQUEST) {
    return {
      ...store,
      loading: true,
      error: null,
    };
  }
  else if (type === REMOVE_INTERACTION_SUCCESS) {
    return {
      ...store,
      loading: false,
      messages: store.messages.map(message =>
        message.interactions.some(inter => inter.id === payload.interactionId)
          ? {
            ...message,
            interactions: message.interactions.filter(
              interaction => interaction.id !== payload.interactionId
            ),
          }
          : message
      ),
    };
  }
  else if (type === REMOVE_INTERACTION_FAILURE) {
    return {
      ...state,
      loading: false,
      error: action.payload,
    };
  }
  return store;
}