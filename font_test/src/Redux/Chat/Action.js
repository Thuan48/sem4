import { BASE_API_URL } from "../../config/api";
import { sendNotification } from "../Notification/Action";
import { ADD_USERS_GROUP, CREATE_CHAT, CREATE_GROUP, DELETE_CHAT, GET_CHAT, GET_CHAT_ERROR, GET_CHAT_MEMBERS, GET_USERS_CHAT, REMOVE_USERS_GROUP, MARK_AS_READ_SUCCESS } from "./ActionType";

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

