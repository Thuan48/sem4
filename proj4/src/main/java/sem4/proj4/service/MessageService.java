package sem4.proj4.service;

import java.util.List;

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

  public void deleteMessage(Integer messageId, User reqUser) throws MessageException, UserException;

}
