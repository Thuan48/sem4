package sem4.proj4.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.Message;
import sem4.proj4.entity.Notification;
import sem4.proj4.entity.User;

@Controller
public class RealtimeChat {

  private final SimpMessagingTemplate simpMessagingTemplate;

  public RealtimeChat(SimpMessagingTemplate simpMessagingTemplate) {
    this.simpMessagingTemplate = simpMessagingTemplate;
  }

  @MessageMapping("/message")
  @SendTo("/group/public")
  public Message reciveMessage(@Payload Message message) {
    simpMessagingTemplate.convertAndSend("/group/" + message.getChat().getId().toString(), message);
    return message;
  }

  @MessageMapping("/addUser")
  public void addUserToGroup(@Payload User user, SimpMessageHeaderAccessor headerAccessor) {
    simpMessagingTemplate.convertAndSend("/topic/notifications",
        new Notification("User Added", "User " + user.getFull_name() + " has been added to the group."));
  }

  @MessageMapping("/chatList")
  public void handleChatList(@Payload List<Chat> chatList) {
    simpMessagingTemplate.convertAndSend("/chatList", chatList);
  }
}
