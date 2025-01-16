package sem4.proj4.service;

import java.util.List;

import sem4.proj4.entity.Interaction;
import sem4.proj4.entity.Message;
import sem4.proj4.entity.User;
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.MessageException;
import sem4.proj4.exception.UserException;
import sem4.proj4.request.SendMessageRequest;

public interface MessageService {

  public Message sendMessage(SendMessageRequest req) throws UserException ,ChatException; 

  public List<Message> getChatMessages(Integer chatId,User reqUser, int pageSize,
      int pageNumber) throws UserException, ChatException; 

  public Message findMessageById(Integer messageId) throws MessageException;

  public Message deleteMessage(Integer messageId, User reqUser) throws MessageException, UserException;

  void markMessagesAsRead(Integer chatId, Integer userId) throws ChatException, UserException;

  void togglePinMessage(Integer messageId, Integer userId) throws ChatException, UserException;

  Message getLatestPinnedMessage(Integer chatId) throws ChatException, UserException;

  List<Message> searchMessages(Integer chatId, String keyword, int pageSize, int pageNumber)
      throws UserException, ChatException;

  List<Message> getPinnedMessages(Integer chatId) throws ChatException, UserException;

  Interaction addInteraction(Integer messageId, Integer userId, String type) throws MessageException, UserException, ChatException;

  void removeInteraction(Integer interactionId, Integer userId) throws MessageException, UserException, ChatException;

}
