import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./Auth/Reducer";
import { chatReducer } from "./Chat/Reducer";
import { messageReducer } from "./Message/Reducer";
import { notificationReducer } from "./Notification/Reducer"
import { friendsReducer } from "./Friend/Reducer";
import blogReducer from "./Blog/Reducer";
import commentReducer from "./Comment/Reducer";
import { pollReducer } from "./Poll/Reducer";


const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  message: messageReducer,
  friends: friendsReducer,
  notifications: notificationReducer,
  blogs: blogReducer,
  comments: commentReducer,
  poll: pollReducer,
});

export const store = legacy_createStore(rootReducer, applyMiddleware(thunk));
