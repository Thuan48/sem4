export const sendNotification = (title, message) => ({
  type: 'SEND_NOTIFICATION',
  payload: { title, message },
});
