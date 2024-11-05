package sem4.proj4.controller;

import org.springframework.beans.factory.annotation.Autowired;
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
import sem4.proj4.service.UserService;

@Controller
public class RealtimeChat {

  private final SimpMessagingTemplate simpMessagingTemplate;
  @Autowired
  private UserService userService;

  public RealtimeChat(SimpMessagingTemplate simpMessagingTemplate) {
    this.simpMessagingTemplate = simpMessagingTemplate;
  }

  @MessageMapping("/message")
  @SendTo("/group/public")
  public Message reciveMessage(@Payload Message message) {
    simpMessagingTemplate.convertAndSend("/group/" + message.getChat().getId().toString(), message);
    return message;
  }

  @MessageMapping("/updateUser")
  public void updateUser(@Payload User user, SimpMessageHeaderAccessor headerAccessor) {
    User updatedUser = userService.save(user);
    simpMessagingTemplate.convertAndSend("/profile/" + updatedUser.getId().toString(), updatedUser);
  }

  @MessageMapping("/updateChat")
  public Chat reciveChat(@Payload Chat chat) {
    simpMessagingTemplate.convertAndSend("/chatUser/" + chat.getId().toString(), chat);
    return chat;
  }

  @MessageMapping("/addUser")
  public void addUserToGroup(@Payload User user, SimpMessageHeaderAccessor headerAccessor) {
    simpMessagingTemplate.convertAndSend("/topic/notifications",
        new Notification("User Added", "User " + user.getFull_name() + " has been added to the group."));
  }

}
