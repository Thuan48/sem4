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

const initialState = {
  polls: [],
  currentPoll: null,
  pollResults: {},
  userVotes: {},
  error: null,
};

export const pollReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_POLL:
      return { ...state, polls: [...state.polls, action.payload], error: null };
    case GET_POLL:
      return { ...state, currentPoll: action.payload, error: null };
    case GET_POLLS_BY_CHAT:
      return {
        ...state,
        polls: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };
    case UPDATE_POLL:
      return {
        ...state,
        polls: state.polls.map((poll) =>
          poll.id === action.payload.id ? action.payload : poll
        ),
        error: null,
      };
    case DELETE_POLL:
      return {
        ...state,
        polls: state.polls.filter((poll) => poll.id !== action.payload),
        error: null,
      };
    case VOTE_POLL:
      return {
        ...state,
        userVotes: {
          ...state.userVotes,
          [action.payload.pollId]: action.payload.optionIndex,
        },
        error: null,
      };
    case GET_POLL_RESULTS:
      return {
        ...state,
        pollResults: {
          ...state.pollResults,
          [action.payload.pollId]: action.payload.results,
        },
        error: null,
      };
    case GET_USER_VOTE:
      return {
        ...state,
        userVotes: {
          ...state.userVotes,
          [action.payload.pollId]: action.payload.userVote
            ? action.payload.userVote.chosenOption
            : null,
        },
        error: null,
      };
    case POLL_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};