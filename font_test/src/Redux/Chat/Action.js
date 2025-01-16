import { BASE_API_URL } from "../../config/api";
import { sendNotification } from "../Notification/Action";
import { ADD_USERS_GROUP, CREATE_CHAT, CREATE_GROUP, DELETE_CHAT, GET_CHAT, GET_CHAT_ERROR, GET_CHAT_MEMBERS, GET_USERS_CHAT, REMOVE_USERS_GROUP, MARK_AS_READ_SUCCESS, GET_USER_CHAT_STATUS, GET_USER_CHAT_STATUS_SUCCESS, GET_USER_CHAT_STATUS_FAILURE, UPDATE_USER_CHAT_STATUS, UPDATE_USER_CHAT_STATUS_SUCCESS, UPDATE_USER_CHAT_STATUS_FAILURE, BLOCK_CHAT_STATUS, BLOCK_CHAT_STATUS_SUCCESS, BLOCK_CHAT_STATUS_FAILURE, UNBLOCK_CHAT_STATUS, UNBLOCK_CHAT_STATUS_SUCCESS, UNBLOCK_CHAT_STATUS_FAILURE, GET_USER_STATUSES_IN_CHAT, GET_USER_STATUSES_IN_CHAT_SUCCESS, GET_USER_STATUSES_IN_CHAT_FAILURE } from "./ActionType";

export const createChat = (chatData) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/single`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chatData.token}`,
      },
      body: JSON.stringify(chatData.resData)
    })

    const resData = await res.json();
    //if (resData.jwt) localStorage.setItem("token", resData.jwt)
    //console.log("creact chat", resData);
    dispatch({ type: CREATE_CHAT, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}
export const createGroup = (chatData) => async (dispatch) => {
  try {
    const formData = new FormData();
    formData.append("chat_name", chatData.resData.chat_name);
    formData.append("chat_image", chatData.resData.chat_image);
    chatData.resData.userIds.forEach((id) => formData.append("userIds", id));

    const res = await fetch(`${BASE_API_URL}/api/chats/group`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chatData.token}`,
      },
      body: formData,
    });

    const resData = await res.json();
    if (resData.jwt) localStorage.setItem("token", resData.jwt);
    dispatch({ type: CREATE_GROUP, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
};


export const getUserChat = (chatData) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chatData.token}`,
      },
    })
    const resData = await res.json();
    console.log("getUserChat", resData);
    dispatch({ type: GET_USERS_CHAT, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const getChats = (token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/getChats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Server Error: ${res.status}`);
    }
    const resData = await res.json();
    if (!Array.isArray(resData)) {
      throw new TypeError("Expected an array of chats");
    }
    const sortedChats = resData.sort((a, b) => {
      if (b.unreadCount > a.unreadCount) return 1;
      if (b.unreadCount < a.unreadCount) return -1;
      return new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp);
    });
    dispatch({ type: GET_CHAT, payload: sortedChats });
  } catch (error) {
    console.error("catch error:", error);
    dispatch({ type: GET_CHAT_ERROR, payload: error.message });
  }
}

export const addUserGroup = ({ chatId, userId, token }) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/${chatId}/add/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const resData = await res.json();
    dispatch({ type: ADD_USERS_GROUP, payload: resData });
    dispatch(sendNotification("User Added", `User with ID ${userId} has been added to the group.`));
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const removeUserGroup = (chatId, userId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/${chatId}/remove/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const resData = await res.json();
    dispatch({ type: REMOVE_USERS_GROUP, payload: resData });
    dispatch(sendNotification("User Removed", `User with ID ${userId} has been removed from the group.`));
    return resData;
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const deleteChat = (chatData) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/delete/${chatData.chatId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chatData.token}`,
      },
    })
    const resData = await res.json();
    dispatch({ type: DELETE_CHAT, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}
export const getChatMembers = (chatId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/${chatId}/members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const resData = await res.json();
    dispatch({ type: GET_CHAT_MEMBERS, payload: resData });
    return resData;
  } catch (error) {
    console.log("catch error:", error);
    throw error;
  }
};

export const getUserChatStatus = (chatId, userId, token) => async (dispatch) => {
  dispatch({ type: GET_USER_CHAT_STATUS });
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/${chatId}/status/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const status = await res.json();
    dispatch({ type: GET_USER_CHAT_STATUS_SUCCESS, payload: { chatId, userId, status } });
  } catch (error) {
    console.error("getUserChatStatus failed:", error);
    dispatch({ type: GET_USER_CHAT_STATUS_FAILURE, payload: error.message });
  }
};

export const updateUserChatStatus = (chatId, userId, status, token) => async (dispatch) => {
  dispatch({ type: UPDATE_USER_CHAT_STATUS });
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/${chatId}/status/${userId}?status=${status}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const updatedStatus = await res.json();
    dispatch({ type: UPDATE_USER_CHAT_STATUS_SUCCESS, payload: { chatId, userId, status: updatedStatus } });
    dispatch(sendNotification("Status Updated", `Your status has been updated to ${status}.`));
  } catch (error) {
    console.error("updateUserChatStatus failed:", error);
    dispatch({ type: UPDATE_USER_CHAT_STATUS_FAILURE, payload: error.message });
  }
};

export const blockChatStatus = (chatId, token) => async (dispatch) => {
  dispatch({ type: BLOCK_CHAT_STATUS });
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/${chatId}/block`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const updatedStatuses = await res.json();
    dispatch({ type: BLOCK_CHAT_STATUS_SUCCESS, payload: updatedStatuses });
  } catch (error) {
    console.error("blockChatStatus failed:", error);
    dispatch({ type: BLOCK_CHAT_STATUS_FAILURE, payload: error.message });
  }
};

export const unblockChatStatus = (chatId, token) => async (dispatch) => {
  dispatch({ type: UNBLOCK_CHAT_STATUS });
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/${chatId}/unblock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const updatedStatuses = await res.json();
    dispatch({ type: UNBLOCK_CHAT_STATUS_SUCCESS, payload: updatedStatuses });
  } catch (error) {
    console.error("unblockChatStatus failed:", error);
    dispatch({ type: UNBLOCK_CHAT_STATUS_FAILURE, payload: error.message });
  }
};

export const getUserStatusesInChat = (chatId, token) => async (dispatch) => {
  dispatch({ type: GET_USER_STATUSES_IN_CHAT });
  try {
    const response = await fetch(`${BASE_API_URL}/api/chats/${chatId}/statuses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user statuses.');
    }
    const data = await response.json();
    dispatch({ type: GET_USER_STATUSES_IN_CHAT_SUCCESS, payload: { chatId: String(chatId), statuses: data } });
  } catch (error) {
    dispatch({ type: GET_USER_STATUSES_IN_CHAT_FAILURE, payload: error.message });
  }
};