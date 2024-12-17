package sem4.proj4.service;

import java.util.List;

import sem4.proj4.entity.Friendship;
import sem4.proj4.entity.User;
import sem4.proj4.exception.UserException;

public interface FriendService {
  public List<Friendship> findFriends(Integer userId);

  public Friendship addFriend(Integer userInitiatorId, Integer userRecipientId);

  public void removeFriend(Integer userInitiatorId, Integer userRecipientId) throws UserException;

  List<User> searchFriends(Integer userId, String name, String email, String phone);
  
  Friendship acceptFriendRequest(Integer userId, Integer friendId);
  
  List<Friendship> getIncomingFriendRequests(Integer userId);

  void rejectFriendRequest(Integer userId, Integer friendId);
} 
