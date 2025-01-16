package sem4.proj4.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import sem4.proj4.entity.Interaction;
import sem4.proj4.entity.Message;
import sem4.proj4.entity.User;
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.MessageException;
import sem4.proj4.exception.UserException;
import sem4.proj4.request.SendMessageRequest;
import sem4.proj4.response.ApiResponse;
import sem4.proj4.service.MessageService;
import sem4.proj4.service.UserService;

import java.util.*;;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
  @Autowired
  MessageService messageService;
  @Autowired
  UserService userService;
  @Autowired
  private SimpMessagingTemplate simpMessagingTemplate;

  @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Message> sendMessageHandler(
      @RequestParam("userId") Integer userId,
      @RequestParam("chatId") Integer chatId,
      @RequestParam("content") String content,
      @RequestPart(value = "image", required = false) MultipartFile image,
      @RequestPart(value = "audio", required = false) MultipartFile audio,
      @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
    userService.findUserProfile(jwt);
    SendMessageRequest req = new SendMessageRequest(userId, chatId, content, image, audio);
    Message message = messageService.sendMessage(req);

    return new ResponseEntity<>(message, HttpStatus.OK);
  }

  @GetMapping("/chat/{chatId}")
  public ResponseEntity<List<Message>> getChatMessage(@PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt,
      @RequestParam int pageSize,
      @RequestParam int pageNumber) throws UserException, ChatException {

    User user = userService.findUserProfile(jwt);
    List<Message> messages = messageService.getChatMessages(chatId, user, pageSize, pageNumber);

    return new ResponseEntity<>(messages, HttpStatus.OK);
  }

  @DeleteMapping("/{messageId}")
  public ResponseEntity<ApiResponse> deleteMessage(@PathVariable Integer messageId,
      @RequestHeader("Authorization") String jwt)
      throws UserException, MessageException, ChatException {

    User user = userService.findUserProfile(jwt);
    Message deletedMessage = messageService.deleteMessage(messageId, user);

    ApiResponse res = new ApiResponse("message delete success", false);

    simpMessagingTemplate.convertAndSend(
        "/group/" + deletedMessage.getChat().getId().toString() + "/delete",
        deletedMessage);

    return new ResponseEntity<>(res, HttpStatus.OK);
  }
  
  @PostMapping("/mark-as-read")
  public ResponseEntity<ApiResponse> markAsRead(
      @RequestParam("chatId") Integer chatId,
      @RequestParam("userId") Integer userId,
      @RequestHeader("Authorization") String jwt) {
    try {
      userService.findUserProfile(jwt);
      messageService.markMessagesAsRead(chatId, userId);
      ApiResponse response = new ApiResponse("Unread count reset successfully.", false);
      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (UserException | ChatException e) {
      ApiResponse response = new ApiResponse(e.getMessage(), true);
      return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
  }

  @PostMapping("/toggle-pin")
  public ResponseEntity<ApiResponse> togglePinMessage(
      @RequestParam("messageId") Integer messageId,
      @RequestHeader("Authorization") String jwt) {
    try {
      User user = userService.findUserProfile(jwt);
      Integer userId = user.getId(); 
      messageService.togglePinMessage(messageId, userId);
      ApiResponse response = new ApiResponse("Message pin status toggled successfully.", false);
      return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (UserException | ChatException e) {
      ApiResponse response = new ApiResponse(e.getMessage(), true);
      return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
  }

  @GetMapping("/chat/{chatId}/latest-pinned")
  public ResponseEntity<Message> getLatestPinnedMessage(
      @PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt) {
    try {
      userService.findUserProfile(jwt);
      Message latestPinned = messageService.getLatestPinnedMessage(chatId);
      if (latestPinned != null) {
        return new ResponseEntity<>(latestPinned, HttpStatus.OK);
      } else {
        return new ResponseEntity<>(null, HttpStatus.NO_CONTENT);
      }
    } catch (UserException | ChatException e) {
      return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }
  }

  @GetMapping("/search")
  public ResponseEntity<List<Message>> searchMessages(
      @RequestParam("chatId") Integer chatId,
      @RequestParam("keyword") String keyword,
      @RequestParam("pageSize") int pageSize,
      @RequestParam("pageNumber") int pageNumber,
      @RequestHeader("Authorization") String jwt) {
    try {
      userService.findUserProfile(jwt);
      List<Message> messages = messageService.searchMessages(chatId, keyword, pageSize, pageNumber);
      return new ResponseEntity<>(messages, HttpStatus.OK);
    } catch (UserException | ChatException e) {
      return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }
  }

  @GetMapping("/pinned")
  public ResponseEntity<List<Message>> getPinnedMessages(
      @RequestParam("chatId") Integer chatId,
      @RequestHeader("Authorization") String jwt) {
    try {
      userService.findUserProfile(jwt);
      List<Message> pinnedMessages = messageService.getPinnedMessages(chatId);
      return new ResponseEntity<>(pinnedMessages, HttpStatus.OK);
    } catch (UserException | ChatException e) {
       new ApiResponse(e.getMessage(), true);
      return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }
  }

  @PostMapping("/{messageId}/interact")
  public ResponseEntity<Interaction> addInteraction(
      @PathVariable Integer messageId,
      @RequestParam("type") String type,
      @RequestHeader("Authorization") String jwt) {
    try {
        User user = userService.findUserProfile(jwt);
        Interaction interaction = messageService.addInteraction(messageId, user.getId(), type);
        return new ResponseEntity<>(interaction, HttpStatus.OK);
    } catch (UserException | ChatException | MessageException e) {
        return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
    }
  }
  
  @DeleteMapping("/interact/{interactionId}")
  public ResponseEntity<ApiResponse> removeInteraction(
      @PathVariable Integer interactionId,
      @RequestHeader("Authorization") String jwt) {
    try {
        User user = userService.findUserProfile(jwt);
        messageService.removeInteraction(interactionId, user.getId());
        ApiResponse response = new ApiResponse("Interaction removed successfully.", false);
        return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (UserException | ChatException | MessageException e) {
        ApiResponse response = new ApiResponse(e.getMessage(), true);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
  }

}
