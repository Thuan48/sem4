import { BASE_API_URL } from "../../config/api";
import { CREATE_CHAT, CREATE_GROUP, GET_USERS_CHAT } from "./ActionType";

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
    const res = await fetch(`${BASE_API_URL}/api/chats/group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chatData.token}`,
      },
      body: JSON.stringify(chatData.resData)
    })
    const resData = await res.json();
    //if (resData.jwt) localStorage.setItem("token", resData.jwt)
    //console.log("creact group", resData);
    dispatch({ type: CREATE_GROUP, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}
export const getUserChat = (chatData) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/chats/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chatData.token}`,
      },
    })
    if (!res.ok) {
      const errorText = await res.text(); // Get the response text for more details
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    const resData = await res.json();
    //if (resData.jwt) localStorage.setItem("token", resData.jwt)
    //console.log("get user chat", resData);
    dispatch({ type: GET_USERS_CHAT, payload: resData });
  } catch (error) {
    console.log("catch error:", error);
  }
}