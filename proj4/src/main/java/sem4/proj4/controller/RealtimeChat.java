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
import sem4.proj4.request.ChatDto;
import sem4.proj4.service.ChatService;

@Controller
public class RealtimeChat {

  private final SimpMessagingTemplate simpMessagingTemplate;
  private final ChatService chatService;

  public RealtimeChat(SimpMessagingTemplate simpMessagingTemplate, ChatService chatService) {
    this.simpMessagingTemplate = simpMessagingTemplate;
    this.chatService = chatService;
  }

  @MessageMapping("/message")
  @SendTo("/group/public")
  public Message reciveMessage(@Payload Message message) {
    simpMessagingTemplate.convertAndSend("/group/" + message.getChat().getId().toString(), message);
    updateChatListForUsers(message.getChat());
    return message;
  }

  @MessageMapping("/profileUpdate")
  public void profileUpdate(@Payload User updatedUser) {
    simpMessagingTemplate.convertAndSend("/topic/profile", updatedUser);
  }

  @MessageMapping("/addUser")
  public void addUserToGroup(@Payload User user, SimpMessageHeaderAccessor headerAccessor) {
    if (user != null && user.getFull_name() != null) {
      Notification notification = new Notification("User Added",
          "User " + user.getFull_name() + " has been added to the group.");
      simpMessagingTemplate.convertAndSend("/topic/notifications", notification);
      updateChatListForUser(user);
    }
  }

  private void updateChatListForUsers(Chat chat) {
    try {
      List<User> members = chatService.getChatMembers(chat.getId());

      for (User member : members) {
        List<ChatDto> updatedChatList = chatService.getChatsWithLastMessage(member.getId());
        simpMessagingTemplate.convertAndSendToUser(member.getEmail(), "/queue/chatList", updatedChatList);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private void updateChatListForUser(User user) {
    try {
      List<ChatDto> updatedChatList = chatService.getChatsWithLastMessage(user.getId());
      simpMessagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/chatList", updatedChatList);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
