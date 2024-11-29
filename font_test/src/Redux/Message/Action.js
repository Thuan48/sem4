import { BASE_API_URL } from "../../config/api";
import { CREATE_NEW_MESSAGE, DELETE_MESSAGE, GET_ALL_MESSAGE } from "./ActionType";

export const createMessage = (messageData) => async (dispatch) => {
  try {
    const formData = new FormData();
    formData.append('userId', messageData.userId);
    formData.append('chatId', messageData.chatId);
    formData.append('content', messageData.content||'');
    if (messageData.image) {
      formData.append('image', messageData.image);
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
       method:"GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json();
    //if (resData.jwt) localStorage.setItem("token", resData.jwt)
    //console.log("get all message", data);
    dispatch({ type: GET_ALL_MESSAGE, payload: data });
    return data.messages;
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