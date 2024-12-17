import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./Auth/Reducer";
import { chatReducer } from "./Chat/Reducer";
import { messageReducer } from "./Message/Reducer";
import { notificationReducer } from "./Notification/Reducer"
import { friendsReducer } from "./Friend/Reducer";


const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  message: messageReducer,
  friends: friendsReducer,
  notifications: notificationReducer,
});

export const store = legacy_createStore(rootReducer, applyMiddleware(thunk));
