package sem4.proj4.service;

import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
  @Value("${config-upload-dir}")
  private String uploadDir;

  @Override
  public Message sendMessage(SendMessageRequest req) throws UserException, ChatException {
    User user = userService.findUserById(req.getUserId());
    Chat chat = chatService.findChatById(req.getChatId());

    Message message = new Message();
    message.setChat(chat);
    message.setUser(user);
    message.setContent(req.getContent());
    message.setTimestamp(LocalDateTime.now());
    if (req.getImage() != null && !req.getImage().isEmpty()) {
      try {
        Path path = Paths.get(uploadDir + "/messages");
        if (!Files.exists(path)) {
          Files.createDirectories(path);
        }
        String filename = req.getImage().getOriginalFilename();
        Path filePath = path.resolve(filename);

        Files.copy(req.getImage().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        message.setImageUrl(filename);
      } catch (Exception e) {
        e.printStackTrace();
        throw new ChatException("Error while uploading message image: " + e.getMessage());
      }
    }

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
    Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("timestamp").descending());
    Page<Message> messagePage = messageRepository.findByChatId(chat.getId(), pageable);

    return messagePage.getContent();
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
  public Message deleteMessage(Integer messageId, User reqUser) throws MessageException, UserException {
    Message message = findMessageById(messageId);
    if (message.getUser().getId().equals(reqUser.getId())) {
      messageRepository.deleteById(messageId);
      return message;
    } else {
      throw new UserException("You cannot delete another user's message");
    }
  }
  
}
