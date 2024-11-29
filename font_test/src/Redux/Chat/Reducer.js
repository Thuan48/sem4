import { ADD_USERS_GROUP, CREATE_CHAT, CREATE_GROUP, DELETE_CHAT, GET_CHAT, GET_CHAT_MEMBERS, GET_USERS_CHAT, REMOVE_USERS_GROUP } from "./ActionType";

const initialValue = {
  chats: [],
  createdGroup: null,
  createdChat: null,
  userChats: [],
  chatList: [],
  chatMembers: [],
}
export const chatReducer = (store = initialValue, { type, payload }) => {
  if (type === CREATE_CHAT) {
    return { ...store, createdChat: payload }
  }
  else if (type === CREATE_GROUP) {
    return { ...store, createdGroup: payload }
  }
  else if (type === GET_USERS_CHAT) {
    return { ...store, chats: payload }
  }
  else if (type === ADD_USERS_GROUP) {
    return { ...store, chats: payload }
  }
  else if (type === REMOVE_USERS_GROUP) {
    return { ...store, chats: payload }
  }
  else if (type === DELETE_CHAT) {
    return { ...store, chats: payload }
  }
  else if (type === GET_CHAT) {
    return { ...store, chats: payload }
  }
  else if (type === GET_CHAT_MEMBERS) {
    return { ...store, chatMembers: payload }
  }
  return store;
}