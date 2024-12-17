package sem4.proj4.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import sem4.proj4.entity.Friendship;
import sem4.proj4.entity.FriendshipStatus;
import sem4.proj4.entity.User;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.FriendRepository;
import sem4.proj4.repository.UserRepository;

@Service
public class FriendServiceImplement implements FriendService {

  @Autowired
  private FriendRepository friendRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @Override
  public List<Friendship> findFriends(Integer userId) {
    List<Friendship> friendships = friendRepository.findByUserInitiatorIdOrUserRecipientId(userId, userId);
    return friendships.stream()
        .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
        .collect(Collectors.toList());
  }

  @Override
  public Friendship addFriend(Integer userInitiatorId, Integer userRecipientId) {
    if (userInitiatorId.equals(userRecipientId)) {
      throw new IllegalArgumentException("Cannot add yourself as a friend.");
    }

    boolean exists = friendRepository.findByUserInitiatorIdAndUserRecipientId(userInitiatorId, userRecipientId)
        .isPresent() ||
        friendRepository.findByUserInitiatorIdAndUserRecipientId(userRecipientId, userInitiatorId)
            .isPresent();

    if (exists) {
      throw new IllegalArgumentException("Friendship already exists.");
    }

    User initiator = userRepository.findById(userInitiatorId)
        .orElseThrow(() -> new IllegalArgumentException("User initiator not found."));
    User recipient = userRepository.findById(userRecipientId)
        .orElseThrow(() -> new IllegalArgumentException("User recipient not found."));

    Friendship friendship = new Friendship();
    friendship.setUserInitiator(initiator);
    friendship.setUserRecipient(recipient);
    friendship.setStatus(FriendshipStatus.PENDING);
    messagingTemplate.convertAndSendToUser(
        recipient.getEmail(),
        "/queue/friendRequest",
        "You have a new friend request from " + initiator.getFull_name());
    return friendRepository.save(friendship);
  }

  @Override
  public void removeFriend(Integer userInitiatorId, Integer userRecipientId)throws UserException {
    Friendship friendship = friendRepository.findByUsers(userInitiatorId, userRecipientId)
        .orElseThrow(() -> new UserException("Friendship does not exist."));

    friendRepository.delete(friendship);
  }

  @Override
  public List<User> searchFriends(Integer userId, String name, String email, String phone) {
    List<Friendship> friendships = friendRepository.findByUserInitiatorIdOrUserRecipientId(userId, userId)
        .stream()
        .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
        .collect(Collectors.toList());

    return friendships.stream()
        .map(f -> f.getUserInitiator().getId().equals(userId) ? f.getUserRecipient() : f.getUserInitiator())
        .filter(u -> (name == null || u.getFull_name().toLowerCase().contains(name.toLowerCase()))
            && (email == null || u.getEmail().toLowerCase().contains(email.toLowerCase()))
            && (phone == null || u.getPhone().contains(phone)))
        .collect(Collectors.toList());
  }

  @Override
  public Friendship acceptFriendRequest(Integer userId, Integer friendId) {
    Optional<Friendship> optionalFriendship = friendRepository.findByUserInitiatorIdAndUserRecipientId(friendId,
        userId);
    if (!optionalFriendship.isPresent()) {
      throw new IllegalArgumentException("Friend request not found.");
    }

    Friendship friendship = optionalFriendship.get();

    if (friendship.getStatus() != FriendshipStatus.PENDING) {
      throw new IllegalArgumentException("Friend request is not pending.");
    }

    friendship.setStatus(FriendshipStatus.ACCEPTED);
    User initiator = friendship.getUserInitiator();
    User recipient = friendship.getUserRecipient();

    messagingTemplate.convertAndSendToUser(
        initiator.getEmail(),
        "/queue/friendAccepted",
        "Your friend request has been accepted by " + recipient.getFull_name());

    updateFriendListForUser(initiator);
    updateFriendListForUser(recipient);
    return friendRepository.save(friendship);
  }
  
  @Override
  public List<Friendship> getIncomingFriendRequests(Integer userId) {
    List<Friendship> pendingFriendships = friendRepository.findByUserRecipientIdAndStatus(userId,
        FriendshipStatus.PENDING);
    return pendingFriendships;
  }

  @Override
  public void rejectFriendRequest(Integer userId, Integer friendId) {
    Friendship friendship = friendRepository.findByUserInitiatorIdAndUserRecipientId(friendId, userId)
        .orElse(
            friendRepository.findByUserInitiatorIdAndUserRecipientId(userId, friendId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found.")));

    if (friendship.getStatus() != FriendshipStatus.PENDING) {
      throw new IllegalArgumentException("Friend request is not pending.");
    }

    friendship.setStatus(FriendshipStatus.REJECTED);
    friendRepository.save(friendship);
  }
  
  private void updateFriendListForUser(User user) {
    List<Friendship> updatedFriends = findFriends(user.getId());
    messagingTemplate.convertAndSendToUser(
        user.getEmail(),
        "/queue/friendList",
        updatedFriends);
  }
}