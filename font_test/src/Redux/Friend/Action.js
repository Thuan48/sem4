import { BASE_API_URL } from "../../config/api";
import {
  GET_FRIENDS,
  ADD_FRIEND,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
  REMOVE_FRIEND,
  SEARCH_FRIEND,
  FRIENDS_LOADING,
  FRIENDS_ERROR,
  ADD_FRIEND_PENDING,
  ADD_FRIEND_SUCCESS,
  SEARCH_USERS_TO_ADD
} from "./ActionType";

export const getFriendRequests = (token) => async (dispatch) => {
  dispatch({ type: FRIENDS_LOADING });
  try {
    const res = await fetch(`${BASE_API_URL}/api/friends/requests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch friend requests.");
    }
    const resData = await res.json();
    dispatch({ type: "GET_FRIEND_REQUESTS", payload: resData });
  } catch (error) {
    console.error("fetch friend requests error:", error);
    dispatch({ type: FRIENDS_ERROR, payload: error.message });
  }
};

export const rejectFriendRequest = (friendId, token) => async (dispatch) => {
  dispatch({ type: FRIENDS_LOADING });
  try {
    const res = await fetch(`${BASE_API_URL}/api/friends/reject?friendId=${friendId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to reject friend request.");
    }
    const resData = await res.json();
    dispatch({ type: REJECT_FRIEND_REQUEST, payload: resData });
  } catch (error) {
    console.error("reject friend request error:", error);
    dispatch({ type: FRIENDS_ERROR, payload: error.message });
  }
};

// Get Friends
export const getFriends = (token) => async (dispatch) => {
  dispatch({ type: FRIENDS_LOADING });
  try {
    const res = await fetch(`${BASE_API_URL}/api/friends`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch friends.");
    }
    const resData = await res.json();
    dispatch({ type: GET_FRIENDS, payload: resData });
  } catch (error) {
    console.error("fetch friends error:", error);
    dispatch({ type: FRIENDS_ERROR, payload: error.message }); 
  }
};

export const searchFriends = (keyword, token) => async (dispatch) => {
  dispatch({ type: FRIENDS_LOADING }); 
  try {
    const res = await fetch(`${BASE_API_URL}/api/friends/search?name=${encodeURIComponent(keyword)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to search friends.");
    }
    const resData = await res.json();
    dispatch({ type: SEARCH_FRIEND, payload: resData });
  } catch (error) {
    console.error("search friend error:", error);
    dispatch({ type: FRIENDS_ERROR, payload: error.message }); 
  }
};

export const searchUsersAdd = (keyword, token) => async (dispatch) => { 
  dispatch({ type: FRIENDS_LOADING });
  try {
    const response = await fetch(`${BASE_API_URL}/api/users/search?name=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search users.');
    }

    const data = await response.json();
    dispatch({ type: SEARCH_USERS_TO_ADD, payload: data }); 
  } catch (error) {
    dispatch({ type: FRIENDS_ERROR, payload: error.message });
  }
};

export const addFriend = (friendId, token) => async (dispatch) => {
  dispatch({ type: ADD_FRIEND_PENDING, payload: friendId });
  try {
    const res = await fetch(`${BASE_API_URL}/api/friends/add?friendId=${friendId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ friendId }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add friend.");
    }
    const resData = await res.json();
    dispatch({ type: ADD_FRIEND_SUCCESS, payload: resData }); 
  } catch (error) {
    console.error("add friend error:", error);
    dispatch({ type: ADD_FRIEND_FAILURE, payload: { friendId, error: error.message } }); 
  }
};

export const acceptFriendRequest = (friendId, token) => async (dispatch) => {
  dispatch({ type: FRIENDS_LOADING });
  try {
    const res = await fetch(`${BASE_API_URL}/api/friends/accept?friendId=${friendId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to accept friend request.");
    }
    const resData = await res.json();
    dispatch({ type: ACCEPT_FRIEND_REQUEST, payload: resData });
  } catch (error) {
    console.error("accept friend request error:", error);
    dispatch({ type: FRIENDS_ERROR, payload: error.message }); 
  }
};

export const removeFriend = (friendId, token) => async (dispatch) => {
  dispatch({ type: FRIENDS_LOADING });
  try {
    const res = await fetch(`${BASE_API_URL}/api/friends/remove?friendId=${friendId}`, {
      method: "DELETE",
      headers: {
        //"Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
    if (res.ok) {
      dispatch({ type: REMOVE_FRIEND, payload: friendId });
    } else {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to remove friend.");
    }
  } catch (error) {
    console.error("remove friend error:", error);
    dispatch({ type: FRIENDS_ERROR, payload: error.message }); 
  }
};