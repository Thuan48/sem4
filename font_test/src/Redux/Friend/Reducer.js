import {
  GET_FRIENDS,
  ADD_FRIEND,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST, 
  REMOVE_FRIEND,
  SEARCH_USER,
  FRIENDS_LOADING,
  FRIENDS_ERROR,
  ADD_FRIEND_PENDING,
  ADD_FRIEND_SUCCESS,
  ADD_FRIEND_FAILURE,
  GET_FRIEND_REQUESTS
} from "./ActionType";

const initialState = {
  friendsList: [],
  loading: false,
  error: null,
  searchUser: [],
  pendingFriendRequests: [],
};

export const friendsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FRIENDS_LOADING:
      return { ...state, loading: true, error: null };

    case GET_FRIEND_REQUESTS:
      return { ...state, pendingFriendRequests: action.payload, loading: false };

    case FRIENDS_ERROR:
      return { ...state, loading: false, error: action.payload };

    case GET_FRIENDS:
      return { ...state, friendsList: action.payload, loading: false };

    case SEARCH_USER:
      return { ...state, searchUser: action.payload, loading: false };

    case ADD_FRIEND_PENDING:
      return {
        ...state,
        pendingFriendRequests: [...state.pendingFriendRequests, action.payload],
        loading: true
      };

    case ADD_FRIEND_SUCCESS:
      return {
        ...state,
        friendsList: [...state.friendsList, action.payload],
        pendingFriendRequests: state.pendingFriendRequests.filter(id => id !== action.payload.id),
        loading: false
      };

    case ADD_FRIEND_FAILURE:
      return {
        ...state,
        pendingFriendRequests: state.pendingFriendRequests.filter(id => id !== action.payload.friendId),
        loading: false,
        error: action.payload.error,
      };

    case ACCEPT_FRIEND_REQUEST:
      return {
        ...state,
        friendsList: [...state.friendsList, action.payload],
        loading: false
      };

    case REJECT_FRIEND_REQUEST:
      return {
        ...state,
        friendsList: state.friendsList.filter(friend => friend.id !== action.payload.id),
        loading: false
      };

    case REMOVE_FRIEND:
      return {
        ...state,
        friendsList: state.friendsList.filter(friend => friend.id !== action.payload),
        loading: false,
      };

    default:
      return state;
  }
};