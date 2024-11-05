package sem4.proj4.service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.Message;
import sem4.proj4.entity.User;
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.MessageException;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.MessageRepository;
import sem4.proj4.request.SendMessageRequest;

@Service
public class MessageServiceImplementation implements MessageService {

  @Autowired
  MessageRepository messageRepository;
  @Autowired
  UserService userService;
  @Autowired
  ChatService chatService;

  @Override
  public Message sendMessage(SendMessageRequest req) throws UserException, ChatException {
    User user = userService.findUserById(req.getUserId());
    Chat chat = chatService.findChatById(req.getChatId());

    Message message = new Message();
    message.setChat(chat);
    message.setUser(user);
    message.setContent(req.getContent());
    message.setTimestamp(LocalDateTime.now());

    messageRepository.save(message);

    return message;
  }

  @Override
  public List<Message> getChatMessages(Integer chatId, User reqUser, int pageSize,
      int pageNumber) throws UserException, ChatException {
    Chat chat = chatService.findChatById(chatId);

    if (!chat.getUsers().contains(reqUser)) {
      throw new UserException("you not related chat" + chat.getId());
    }

    List<Message> messages = messageRepository.findByChatId(chat.getId());

    int totalMessages = messages.size();
    int totalPages = (int) Math.ceil((double) totalMessages / pageSize);
    if (pageNumber >= totalPages && totalPages > 0) {
      pageNumber = totalPages - 1;
    }
    int start = pageNumber * pageSize;
    int end = Math.min(start + pageSize, messages.size());

    if (start >= messages.size()) {
      return List.of(); 
    }

    return messages.subList(start, end);
  }

  @Override
  public Message findMessageById(Integer messageId) throws MessageException {
    Optional<Message> opt = messageRepository.findById(messageId);
    if (opt.isPresent()) {
      return opt.get();
    }
    throw new MessageException("Message not found With id:" + messageId);
  }

  @Override
  public void deleteMessage(Integer messageId, User reqUser) throws MessageException, UserException {
    Message message = findMessageById(messageId);
    if (message.getUser().getId().equals(reqUser.getId())) {
      messageRepository.deleteById(messageId);
      }
      throw new UserException("you can delete another message" + reqUser.getFull_name());
  }

}
