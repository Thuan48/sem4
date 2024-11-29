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
      @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
    User user = userService.findUserProfile(jwt);
    SendMessageRequest req = new SendMessageRequest(userId, chatId, content, image);
    Message message = messageService.sendMessage(req);

    return new ResponseEntity<>(message, HttpStatus.OK);
  }

  @GetMapping("/chat/{chatId}")
  public ResponseEntity<List<Message>> getChatMessage(@PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt,
      @RequestParam(defaultValue = "7") int pageSize,
      @RequestParam(defaultValue = "0") int pageNumber) throws UserException, ChatException {

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
}
