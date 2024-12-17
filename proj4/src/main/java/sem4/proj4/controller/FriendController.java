package sem4.proj4.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sem4.proj4.entity.Friendship;
import sem4.proj4.entity.User;
import sem4.proj4.exception.UserException;
import sem4.proj4.service.FriendService;
import sem4.proj4.service.UserService;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

  @Autowired
  private FriendService friendService;

  @Autowired
  private UserService userService;

  @GetMapping
  public ResponseEntity<List<?>> getFriends(
      @RequestHeader("Authorization") String jwt,
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String email,
      @RequestParam(required = false) String phone) throws UserException {

    User reqUser = userService.findUserProfile(jwt);

    if (name != null || email != null || phone != null) {
      List<User> filteredFriends = friendService.searchFriends(reqUser.getId(), name, email, phone);
      return ResponseEntity.ok(filteredFriends);
    } else {
      List<Friendship> friends = friendService.findFriends(reqUser.getId());
      return ResponseEntity.ok(friends);
    }
  }

  @GetMapping("/search")
  public ResponseEntity<List<User>> searchFriends(
      @RequestHeader("Authorization") String jwt,
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String email,
      @RequestParam(required = false) String phone) throws UserException {

    User reqUser = userService.findUserProfile(jwt);

    if (name != null || email != null || phone != null) {
      List<User> filteredFriends = friendService.searchFriends(reqUser.getId(), name, email, phone);
      return ResponseEntity.ok(filteredFriends);
    } else {
      List<Friendship> friends = friendService.findFriends(reqUser.getId());
      List<User> userFriends = friends.stream()
          .map(f -> f.getUserInitiator().getId().equals(reqUser.getId()) ? f.getUserRecipient() : f.getUserInitiator())
          .collect(Collectors.toList());
      return ResponseEntity.ok(userFriends);
    }
  }

  @PostMapping("/add")
  public ResponseEntity<Friendship> addFriend(
      @RequestHeader("Authorization") String jwt,
      @RequestParam Integer friendId) throws UserException {

    User reqUser = userService.findUserProfile(jwt);

    Friendship friendship = friendService.addFriend(reqUser.getId(), friendId);
    return ResponseEntity.ok(friendship);
  }

  @DeleteMapping("/remove")
  public ResponseEntity<Void> removeFriend(
      @RequestHeader("Authorization") String jwt,
      @RequestParam Integer friendId) throws UserException {

    User reqUser = userService.findUserProfile(jwt);

    friendService.removeFriend(reqUser.getId(), friendId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/accept")
  public ResponseEntity<Friendship> acceptFriendRequest(
      @RequestHeader("Authorization") String jwt,
      @RequestParam Integer friendId) throws UserException {

    User reqUser = userService.findUserProfile(jwt);

    Friendship friendship = friendService.acceptFriendRequest(reqUser.getId(), friendId);
    return ResponseEntity.ok(friendship);
  }

  @GetMapping("/requests")
  public ResponseEntity<List<Friendship>> getIncomingFriendRequests(
      @RequestHeader("Authorization") String jwt) throws UserException {

    User reqUser = userService.findUserProfile(jwt);

    List<Friendship> pendingFriendships = friendService.getIncomingFriendRequests(reqUser.getId());

    return ResponseEntity.ok(pendingFriendships);
  }

  @PostMapping("/reject")
  public ResponseEntity<Void> rejectFriendRequest(
      @RequestHeader("Authorization") String jwt,
      @RequestParam Integer friendId) throws UserException {

    User reqUser = userService.findUserProfile(jwt);

    friendService.rejectFriendRequest(reqUser.getId(), friendId);
    return ResponseEntity.noContent().build();
  }
}