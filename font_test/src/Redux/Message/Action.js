import { BASE_API_URL } from "../../config/api";
import { MARK_AS_READ_SUCCESS } from "../Chat/ActionType";
import { ADD_INTERACTION_FAILURE, ADD_INTERACTION_REQUEST, ADD_INTERACTION_SUCCESS, CREATE_NEW_MESSAGE, DELETE_MESSAGE, FETCH_PINNED_MESSAGES_FAILURE, FETCH_PINNED_MESSAGES_SUCCESS, GET_ALL_MESSAGE, GET_UNREAD_COUNT, REMOVE_INTERACTION_FAILURE, REMOVE_INTERACTION_REQUEST, REMOVE_INTERACTION_SUCCESS, SEARCH_MESSAGES_FAILURE, SEARCH_MESSAGES_SUCCESS, TOGGLE_PIN_FAILURE, TOGGLE_PIN_SUCCESS } from "./ActionType";

export const createMessage = (messageData) => async (dispatch) => {
  try {
    const formData = new FormData();
    formData.append('userId', messageData.userId);
    formData.append('chatId', messageData.chatId);
    formData.append('content', messageData.content || '');
    if (messageData.image) {
      formData.append('image', messageData.image);
    }
    if (messageData.audio) {
      formData.append('audio', messageData.audio);
    }
    const res = await fetch(`${BASE_API_URL}/api/messages/create`, {
      method: "POST",
      headers: {
        //"Content-Type": "application/json",
        Authorization: `Bearer ${messageData.token}`,
      },
      body: formData,
    })
    const resData = await res.json();
    //if (resData.jwt) localStorage.setItem("token", resData.jwt)
    //console.log("creact message", resData);
    dispatch({ type: CREATE_NEW_MESSAGE, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const getAllMessage = (reqData) => async (dispatch) => {
  try {
    const { chatId, token, pageSize = 7, pageNumber = 0 } = reqData;
    const res = await fetch(`${BASE_API_URL}/api/messages/chat/${chatId}?pageSize=${pageSize}&pageNumber=${pageNumber}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json();
    dispatch({ type: GET_ALL_MESSAGE, payload: data });
    return data;
  } catch (error) {
    console.log("catch error:", error);
  }
}

export const deleteMessage = (messageId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      dispatch({ type: DELETE_MESSAGE, payload: messageId });
    } else {
      console.log("Error deleting message:", data);
    }
  } catch (error) {
    console.log("catch error:", error);
  }
};

export const getUnreadCount = (userId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/messages/unread-count?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const count = await res.json();
    dispatch({ type: GET_UNREAD_COUNT, payload: count });
  } catch (error) {
    console.log("Error fetching unread messages count:", error);
  }
};

export const markAsRead = (chatId, userId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/messages/mark-as-read?chatId=${chatId}&userId=${userId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.message || "Failed to mark as read.");
    }

    dispatch({ type: MARK_AS_READ_SUCCESS, payload: chatId });
  } catch (error) {
    console.error("Failed to mark as read:", error);
  }
};

export const togglePinMessage = (messageId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/messages/toggle-pin?messageId=${messageId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      dispatch({ type: TOGGLE_PIN_SUCCESS, payload: messageId });
    } else {
      const errorData = await res.json();
      dispatch({ type: TOGGLE_PIN_FAILURE, payload: errorData.message });
    }
  } catch (error) {
    dispatch({ type: TOGGLE_PIN_FAILURE, payload: error.message });
  }
};

export const fetchPinnedMessages = (chatId, token) => async (dispatch) => {
  try {
    const response = await fetch(`${BASE_API_URL}/api/messages/chat/${chatId}/latest-pinned`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const pinnedMessages = Array.isArray(data) ? data : [data];
      dispatch({ type: FETCH_PINNED_MESSAGES_SUCCESS, payload: { chatId, messages: pinnedMessages } });
    } else {
      const errorData = await response.json();
      dispatch({ type: FETCH_PINNED_MESSAGES_FAILURE, payload: errorData.message });
    }
  } catch (error) {
    dispatch({ type: FETCH_PINNED_MESSAGES_FAILURE, payload: error.message });
  }
};

export const searchMessages = (chatId, keyword, token, pageSize = 10, pageNumber = 0) => async (dispatch) => {
  try {
    const encodedKeyword = encodeURIComponent(keyword.trim());
    const response = await fetch(`${BASE_API_URL}/api/messages/search?chatId=${chatId}&keyword=${encodedKeyword}&pageSize=${pageSize}&pageNumber=${pageNumber}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      dispatch({ type: SEARCH_MESSAGES_SUCCESS, payload: data });
      return data;
    } else {
      const errorData = await response.json();
      dispatch({ type: SEARCH_MESSAGES_FAILURE, payload: errorData.message });
      return null;
    }
  } catch (error) {
    dispatch({ type: SEARCH_MESSAGES_FAILURE, payload: errorData.message || "Search failed. Please try again." });
    return null;
  }
};

export const addInteraction = (messageId, type, token) => async (dispatch) => {
  dispatch({ type: ADD_INTERACTION_REQUEST, payload: { messageId, type } });
  try {
    const res = await fetch(`${BASE_API_URL}/api/messages/${messageId}/interact?type=${type}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      dispatch({ type: ADD_INTERACTION_SUCCESS, payload: { messageId, interaction: data } });
    } else {
      dispatch({ type: ADD_INTERACTION_FAILURE, payload: data.message || 'Failed to add interaction.' });
    }
  } catch (error) {
    dispatch({ type: ADD_INTERACTION_FAILURE, payload: error.message });
  }
};

export const removeInteraction = (interactionId, token) => async (dispatch) => {
  dispatch({ type: REMOVE_INTERACTION_REQUEST, payload: { interactionId } });
  try {
    const res = await fetch(`${BASE_API_URL}/api/messages/interact/${interactionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      dispatch({ type: REMOVE_INTERACTION_SUCCESS, payload: { interactionId } });
    } else {
      const data = await res.json();
      dispatch({ type: REMOVE_INTERACTION_FAILURE, payload: data.message || 'Failed to remove interaction.' });
    }
  } catch (error) {
    dispatch({ type: REMOVE_INTERACTION_FAILURE, payload: error.message });
  }
};