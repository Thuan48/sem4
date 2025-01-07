package sem4.proj4.service;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.User;

public interface UnreadCountService {
  void incrementUnreadCount(User user, Chat chat);

  void resetUnreadCount(User user, Chat chat);

  Integer getUnreadCount(User user, Chat chat);
}