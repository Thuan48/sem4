const initialNotificationState = {
  notifications: [],
};

export const notificationReducer = (state = initialNotificationState, action) => {
  switch (action.type) {
    case 'SEND_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    
    default:
      return state;
  }
};
