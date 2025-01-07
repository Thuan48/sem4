import { BASE_API_URL } from "../../config/api";
import {
  CREATE_POLL,
  GET_POLL,
  GET_POLLS_BY_CHAT,
  UPDATE_POLL,
  DELETE_POLL,
  VOTE_POLL,
  GET_POLL_RESULTS,
  POLL_ERROR,
  GET_USER_VOTE,
} from "./ActionType";

export const createPoll = (pollData, chatId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/polls/create/${chatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pollData),
    });
    const data = await res.json();
    dispatch({ type: CREATE_POLL, payload: data });
  } catch (error) {
    dispatch({ type: POLL_ERROR, payload: error.message });
  }
};

export const getPollById = (pollId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/polls/${pollId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    dispatch({ type: GET_POLL, payload: data });
  } catch (error) {
    dispatch({ type: POLL_ERROR, payload: error.message });
  }
};

export const getPollsByChat = (chatId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/polls/chat/${chatId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    dispatch({ type: GET_POLLS_BY_CHAT, payload: data });
  } catch (error) {
    dispatch({ type: POLL_ERROR, payload: error.message });
  }
};

export const updatePoll = (pollId, updatedData, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/polls/update/${pollId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });
    const data = await res.json();
    dispatch({ type: UPDATE_POLL, payload: data });
  } catch (error) {
    dispatch({ type: POLL_ERROR, payload: error.message });
  }
};

export const deletePoll = (pollId, token) => async (dispatch) => {
  try {
    await fetch(`${BASE_API_URL}/api/polls/${pollId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: DELETE_POLL, payload: pollId });
  } catch (error) {
    dispatch({ type: POLL_ERROR, payload: error.message });
  }
};

export const votePoll = (pollId, optionIndex, token) => async (dispatch) => {
  try {
    await fetch(`${BASE_API_URL}/api/polls/${pollId}/vote?optionIndex=${optionIndex}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("pollid and optionindex ", pollId, optionIndex);
    dispatch({type: VOTE_POLL,payload: { pollId, optionIndex }});
  } catch (error) {
    dispatch({ type: POLL_ERROR, payload: error.message });
  }
};

export const getPollResults = (pollId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/polls/${pollId}/results`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    dispatch({ type: GET_POLL_RESULTS, payload: { pollId, results: data } });
  } catch (error) {
    dispatch({ type: POLL_ERROR, payload: error.message });
  }
};

export const getUserVote = (pollId, token) => async (dispatch) => {
  try {
    const res = await fetch(`${BASE_API_URL}/api/polls/${pollId}/user-vote`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 200) {
      const data = await res.json();
      dispatch({ type: GET_USER_VOTE, payload: { pollId, userVote: data } });
    } else {
      dispatch({ type: GET_USER_VOTE, payload: { pollId, userVote: null } });
    }
  } catch (error) {
    dispatch({ type: POLL_ERROR, payload: error.message });
  }
};