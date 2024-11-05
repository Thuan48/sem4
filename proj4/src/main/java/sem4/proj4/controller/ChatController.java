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
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.UserException;
import sem4.proj4.request.ChatDto;
import sem4.proj4.request.ChatRequest;
import sem4.proj4.request.GroupChatRequest;
import sem4.proj4.response.ApiResponse;
import sem4.proj4.service.ChatService;
import sem4.proj4.service.UserService;

import java.util.List;

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

    Chat chat = chatService.removeFromGroup(chatId, userId, reqUser);

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
  public List<ChatDto> getChats(@RequestHeader("Authorization") String jwt)throws ChatException,UserException {
    User reqUser = userService.findUserProfile(jwt);

    return chatService.getChatsWithLastMessage(reqUser.getId());
  }

}
