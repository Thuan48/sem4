import { ADD_USERS_GROUP, CREATE_CHAT, CREATE_GROUP, DELETE_CHAT, GET_CHAT, GET_CHAT_MEMBERS, GET_USERS_CHAT, REMOVE_USERS_GROUP, GET_CHAT_ERROR, MARK_AS_READ_SUCCESS, MARK_AS_READ_FAILURE } from "./ActionType";

const initialValue = {
  chats: [],
  createdGroup: null,
  createdChat: null,
  userChats: [],
  chatList: [],
  chatMembers: [],
  error: null,
}

export const chatReducer = (store = initialValue, { type, payload }) => {
  switch (type) {
    case CREATE_CHAT:
      return { ...store, createdChat: payload }
    case CREATE_GROUP:
      return { ...store, createdGroup: payload }
    case GET_USERS_CHAT:
      return { ...store, chats: payload }
    case ADD_USERS_GROUP:
      return { ...store, chats: payload }
    case REMOVE_USERS_GROUP:
      return { ...store, chats: payload }
    case DELETE_CHAT:
      return { ...store, chats: payload }
    case GET_CHAT:
      return { ...store, chats: payload, error: null }
    case GET_CHAT_ERROR:
      return { ...store, error: payload }
    case GET_CHAT_MEMBERS:
      return { ...store, chatMembers: payload }
    case MARK_AS_READ_SUCCESS:
      return {
        ...store,
        chats: store.chats.map((chat) =>
          chat.id === payload ? { ...chat, unreadCount: 0 } : chat
        ),
      };
    case MARK_AS_READ_FAILURE:
      return {
        ...store,
        error: payload,
      };
    default:
      return store;
  }
}