import { ADD_USERS_GROUP, CREATE_CHAT, CREATE_GROUP, DELETE_CHAT, GET_CHAT, GET_CHAT_MEMBERS, GET_USERS_CHAT, REMOVE_USERS_GROUP, GET_CHAT_ERROR, MARK_AS_READ_SUCCESS, MARK_AS_READ_FAILURE, GET_USER_CHAT_STATUS, GET_USER_CHAT_STATUS_SUCCESS, GET_USER_CHAT_STATUS_FAILURE, UPDATE_USER_CHAT_STATUS, UPDATE_USER_CHAT_STATUS_SUCCESS, UPDATE_USER_CHAT_STATUS_FAILURE, BLOCK_CHAT_STATUS, BLOCK_CHAT_STATUS_SUCCESS, BLOCK_CHAT_STATUS_FAILURE, UNBLOCK_CHAT_STATUS, UNBLOCK_CHAT_STATUS_SUCCESS, UNBLOCK_CHAT_STATUS_FAILURE, GET_USER_STATUSES_IN_CHAT, GET_USER_STATUSES_IN_CHAT_SUCCESS, GET_USER_STATUSES_IN_CHAT_FAILURE } from "./ActionType";

const initialValue = {
  chats: [],
  createdGroup: null,
  createdChat: null,
  userChats: [],
  chatList: [],
  chatMembers: [],
  error: null,
  userChatStatuses: {},
  memberChatStatuses: {},
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
    case GET_USER_CHAT_STATUS:
      return {
        ...store,
      };
    case GET_USER_CHAT_STATUS_SUCCESS:
      const { chatId, userId, status } = payload;
      return {
        ...store,
        userChatStatuses: {
          ...store.userChatStatuses,
          [`${chatId}-${userId}`]: status,
        },
      };
    case GET_USER_CHAT_STATUS_FAILURE:
      return {
        ...store,
        error: payload,
      };
    case UPDATE_USER_CHAT_STATUS:
      return {
        ...store,
      };
    case UPDATE_USER_CHAT_STATUS_SUCCESS:
      const { chatId: updChatId, userId: updUserId, status: updStatus } = payload;
      return {
        ...store,
        userChatStatuses: {
          ...store.userChatStatuses,
          [`${updChatId}-${updUserId}`]: updStatus,
        },
      };
    case UPDATE_USER_CHAT_STATUS_FAILURE:
      return {
        ...store,
        error: payload,
      };
    case BLOCK_CHAT_STATUS:
      return {
        ...store,
      };
    case BLOCK_CHAT_STATUS_SUCCESS:
      const updatedBlockStatuses = payload;
      const blockUpdatedStatuses = { ...store.userChatStatuses };
      updatedBlockStatuses.forEach(({ chatId, userId, status }) => {
        blockUpdatedStatuses[`${chatId}-${userId}`] = status;
      });
      return {
        ...store,
        userChatStatuses: blockUpdatedStatuses,
      };
    case BLOCK_CHAT_STATUS_FAILURE:
      return {
        ...store,
        error: payload,
      };
    case UNBLOCK_CHAT_STATUS:
      return {
        ...store,
      };
    case UNBLOCK_CHAT_STATUS_SUCCESS:
      const updatedUnblockStatuses = payload;
      const unblockUpdatedStatuses = { ...store.userChatStatuses };
      updatedUnblockStatuses.forEach(({ chatId, userId, status }) => {
        unblockUpdatedStatuses[`${chatId}-${userId}`] = status;
      });
      return {
        ...store,
        userChatStatuses: unblockUpdatedStatuses,
      };
    case UNBLOCK_CHAT_STATUS_FAILURE:
      return {
        ...store,
        error: payload,
      };
    case GET_USER_STATUSES_IN_CHAT:
      return {
        ...store,
      };

    case GET_USER_STATUSES_IN_CHAT_SUCCESS:
      const { chatId: statusChatId, statuses } = payload;

      const correctlyMappedStatuses = Object.keys(statuses).reduce((acc, key) => {
        const userId = key;
        const statusObj = statuses[key];
        acc[userId] = {
          status: statusObj.status,
          blockedByUserId: statusObj.blockedByUserId,
        };
        return acc;
      }, {});

      return {
        ...store,
        memberChatStatuses: {
          ...store.memberChatStatuses,
          [String(statusChatId)]: {
            ...store.memberChatStatuses[String(statusChatId)],
            ...correctlyMappedStatuses,
          },
        },
      };

    case GET_USER_STATUSES_IN_CHAT_FAILURE:
      return {
        ...store,
        error: payload,
      };
    default:
      return store;
  }
}