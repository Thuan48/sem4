package sem4.proj4.service;

import java.util.List;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.User;
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.UserException;
import sem4.proj4.request.ChatDto;
import sem4.proj4.request.GroupChatRequest;

public interface ChatService {

  public Chat createChat(User reqUser, Integer toUser, String chatName, String chatImage) throws UserException;

  public Chat findChatById(Integer chatId) throws ChatException;

  public List<Chat> findAllChatByUserId(Integer userId) throws UserException;

  public Chat createGroup(GroupChatRequest req, User reqUser) throws UserException;

  public Chat addUserToGroup(Integer userId, Integer chatId, User reqUser) throws ChatException, UserException;

  public Chat renameGroup(Integer chatId, String groupName, User reqUser) throws ChatException, UserException;

  public Chat removeFromGroup(Integer chatId, Integer userId, User reqUser) throws UserException, ChatException;

  public void deleteChat(Integer chatId, Integer userId) throws ChatException;
  
  public List<ChatDto> getChatsWithLastMessage(Integer userId) throws ChatException,UserException;

  public List<User> getChatMembers(Integer chatId) throws ChatException;

  public void updateChatListForUsers(Chat chat);
  
  void markMessagesAsRead(Integer chatId, Integer userId) throws UserException, ChatException;

  Integer countUnreadMessages(Integer userId, Integer chatId) throws UserException, ChatException;
}
