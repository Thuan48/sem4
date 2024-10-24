import { BASE_API_URL } from "../../config/api";
import { CREATE_NEW_MESSAGE, GET_ALL_MESSAGE } from "./ActionType";

export const createMessage = (messageData) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/messages/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${messageData.token}`,
      },
      body: JSON.stringify(messageData.resData)
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
    const res = await fetch(`${BASE_API_URL}/api/messages/chat/${reqData.chatId}`, {
      method:"GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reqData.token}`,
      },
      body: JSON.stringify(reqData.data)
    })
    const data = await res.json();
    //if (resData.jwt) localStorage.setItem("token", resData.jwt)
    console.log("get all message", data);
    dispatch({ type: GET_ALL_MESSAGE, payload: data });
  } catch (error) {
    console.log("catch error:", error);
  }
}