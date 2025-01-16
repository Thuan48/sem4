package sem4.proj4.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.User;
import sem4.proj4.entity.UserChatStatus;
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.UserException;
import sem4.proj4.request.ChatDto;
import sem4.proj4.request.ChatRequest;
import sem4.proj4.request.GroupChatRequest;
import sem4.proj4.response.ApiResponse;
import sem4.proj4.service.ChatService;
import sem4.proj4.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

  @Autowired
  ChatService chatService;
  @Autowired
  UserService userService;

  @PostMapping("/single")
  public ResponseEntity<Chat> createChatHandler(@RequestBody ChatRequest chatRequest,
      @RequestHeader("Authorization") String jwt) throws UserException {

    User reqUser = userService.findUserProfile(jwt);

    Chat chat = chatService.createChat(reqUser, chatRequest.getUserId(), chatRequest.getChatName(),
        chatRequest.getChatImage());

    return new ResponseEntity<Chat>(chat, HttpStatus.CREATED);
  }

  @PostMapping("/group")
  public ResponseEntity<Chat> createGroupHandler(
      @RequestParam("userIds") List<Integer> userIds,
      @RequestParam("chat_name") String chatName,
      @RequestParam("chat_image") MultipartFile chatImage,
      @RequestHeader("Authorization") String jwt) throws UserException {

    User reqUser = userService.findUserProfile(jwt);
    GroupChatRequest req = new GroupChatRequest(userIds, chatName, chatImage);
    Chat chat = chatService.createGroup(req, reqUser);

    return new ResponseEntity<>(chat, HttpStatus.OK);
  }

  @GetMapping("/{chatId}")
  public ResponseEntity<Chat> findChatById(@PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt) throws ChatException {

    Chat chat = chatService.findChatById(chatId);

    return new ResponseEntity<Chat>(chat, HttpStatus.OK);
  }

  @GetMapping("/user")
  public ResponseEntity<List<Chat>> findAllChatByUser(@RequestHeader("Authorization") String jwt) throws UserException {

    User reqUser = userService.findUserProfile(jwt);

    List<Chat> chats = chatService.findAllChatByUserId(reqUser.getId());

    return new ResponseEntity<List<Chat>>(chats, HttpStatus.OK);
  }

  @PostMapping("/{chatId}/add/{userId}")
  public ResponseEntity<Chat> addUserToGroup(@PathVariable Integer chatId,
      @PathVariable Integer userId, @RequestHeader("Authorization") String jwt) throws ChatException, UserException {

    User reqUser = userService.findUserProfile(jwt);

    Chat chat = chatService.addUserToGroup(userId, chatId, reqUser);

    return new ResponseEntity<Chat>(chat, HttpStatus.OK);
  }

  @PutMapping("/{chatId}/remove/{userId}")
  public ResponseEntity<ApiResponse> removeUserFromGroup(@PathVariable Integer chatId,
      @PathVariable Integer userId, @RequestHeader("Authorization") String jwt) throws ChatException, UserException {

    User reqUser = userService.findUserProfile(jwt);

    chatService.removeFromGroup(chatId, userId, reqUser);

    ApiResponse response = new ApiResponse("User removed successfully", true);
    return new ResponseEntity<>(response, HttpStatus.OK);
  }

  @DeleteMapping("/delete/{chatId}")
  public ResponseEntity<ApiResponse> deleteChatHandler(@PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt) throws ChatException, UserException {

    User reqUser = userService.findUserProfile(jwt);

    chatService.deleteChat(chatId, reqUser.getId());

    ApiResponse res = new ApiResponse("chat delete success", true);

    return new ResponseEntity<>(res, HttpStatus.OK);
  }

  @GetMapping("/getChats")
  public ResponseEntity<List<ChatDto>> getChats(@RequestHeader("Authorization") String jwt)
      throws ChatException, UserException {
    User reqUser = userService.findUserProfile(jwt);
    List<ChatDto> chatDtos = chatService.getChatsWithLastMessage(reqUser.getId());
    return new ResponseEntity<>(chatDtos, HttpStatus.OK);
  }

  @GetMapping("/{chatId}/members")
  public ResponseEntity<List<User>> getChatMembers(@PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt) throws ChatException, UserException {

    userService.findUserProfile(jwt);
    List<User> members = chatService.getChatMembers(chatId);

    return new ResponseEntity<>(members, HttpStatus.OK);
  }

  @PostMapping("/mark-as-read")
  public ResponseEntity<ApiResponse> markAsRead(
      @RequestParam("chatId") Integer chatId,
      @RequestParam("userId") Integer userId,
      @RequestHeader("Authorization") String jwt) {
    try {
      userService.findUserProfile(jwt);
      chatService.markMessagesAsRead(chatId, userId);
      ApiResponse response = new ApiResponse("Unread count reset successfully.", false);
      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (UserException | ChatException e) {
      ApiResponse response = new ApiResponse(e.getMessage(), true);
      return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
  }

  @GetMapping("/unread-count")
  public ResponseEntity<Integer> getUnreadMessagesCount(
      @RequestParam Integer userId,
      @RequestParam Integer chatId,
      @RequestHeader("Authorization") String jwt) {
    try {
      userService.findUserProfile(jwt);
      Integer count = chatService.countUnreadMessages(userId, chatId);
      return new ResponseEntity<>(count, HttpStatus.OK);
    } catch (UserException | ChatException e) {
      return new ResponseEntity<>(0, HttpStatus.BAD_REQUEST);
    }
  }

  @PostMapping("/{chatId}/status/{userId}")
  public ResponseEntity<?> updateUserChatStatus(
      @PathVariable Integer chatId,
      @PathVariable Integer userId,
      @RequestParam UserChatStatus.Status status,
      @RequestHeader("Authorization") String jwt) {
    try {
      User reqUser = userService.findUserProfile(jwt);
      UserChatStatus updatedStatus = chatService.updateUserChatStatus(chatId, userId, reqUser.getId(), status);
      return new ResponseEntity<>(updatedStatus, HttpStatus.OK);
    } catch (UserException | ChatException e) {
      ApiResponse response = new ApiResponse(e.getMessage(), true);
      return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
  }

  @GetMapping("/{chatId}/status/{userId}")
  public ResponseEntity<?> getUserChatStatus(
      @PathVariable Integer chatId,
      @PathVariable Integer userId,
      @RequestHeader("Authorization") String jwt) {
    try {
      userService.findUserProfile(jwt);
      UserChatStatus status = chatService.getUserChatStatus(chatId, userId);
      return new ResponseEntity<>(status, HttpStatus.OK);
    } catch (UserException | ChatException e) {
      ApiResponse response = new ApiResponse(e.getMessage(), true);
      return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
  }

  @PostMapping("/{chatId}/block")
  public ResponseEntity<ApiResponse> blockChatStatus(
      @PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt) {
    try {
      User user = userService.findUserProfile(jwt);

      chatService.blockChatStatus(chatId, user.getId(), UserChatStatus.Status.BLOCKED);

      ApiResponse response = new ApiResponse("Chat block success!.", false);
      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (UserException | ChatException e) {
      ApiResponse response = new ApiResponse(e.getMessage(), true);
      return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
  }

  @PostMapping("/{chatId}/unblock")
  public ResponseEntity<ApiResponse> unblockChatStatus(
      @PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt) {
    try {
      User user = userService.findUserProfile(jwt);

      chatService.unblockChatStatus(chatId, user.getId(), UserChatStatus.Status.DEFAULT);

      ApiResponse response = new ApiResponse("Chat ununblock success!.", false);
      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (UserException | ChatException e) {
      ApiResponse response = new ApiResponse(e.getMessage(), true);
      return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
  }

  @GetMapping("/{chatId}/statuses")
  public ResponseEntity<Map<Integer, UserChatStatus>> getUserStatusesInChat(
      @PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt) throws ChatException, UserException {
    Map<Integer, UserChatStatus> statuses = chatService.getUserStatusesInChat(chatId);
    return new ResponseEntity<>(statuses, HttpStatus.OK);
  }
}
