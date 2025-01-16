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
import sem4.proj4.entity.Interaction;
import sem4.proj4.entity.Message;
import sem4.proj4.entity.User;
import sem4.proj4.entity.UserChatStatus;
import sem4.proj4.entity.UserChatStatus.Status;
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.MessageException;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.InteractionRepository;
import sem4.proj4.repository.MessageRepository;
import sem4.proj4.repository.UserChatStatusRepository;
import sem4.proj4.request.SendMessageRequest;

@Service
public class MessageServiceImplementation implements MessageService {

  @Autowired
  MessageRepository messageRepository;
  @Autowired
  InteractionRepository interactionRepository;
  @Autowired
  UserChatStatusRepository userChatStatusRepository;
  @Autowired
  UserService userService;
  @Autowired
  ChatService chatService;
  @Autowired
  UnreadCountService unreadCountService;
  @Value("${config-upload-dir}")
  private String uploadDir;

  @Override
  public Message sendMessage(SendMessageRequest req) throws UserException, ChatException {
    User user = userService.findUserById(req.getUserId());
    Chat chat = chatService.findChatById(req.getChatId());

    if (!chat.getUsers().contains(user)) {
      throw new UserException("You are not a member of this chat.");
    }

    Optional<UserChatStatus> optionalStatus = userChatStatusRepository.findByUserAndChat(user, chat);
        if (optionalStatus.isPresent()) {
            UserChatStatus status = optionalStatus.get();
            if (status.getStatus() == Status.BLOCKED) {
                throw new ChatException("You are blocked from sending messages in this chat.");
            }
        }

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
    if (req.getAudio() != null && !req.getAudio().isEmpty()) {
      try {
        Path path = Paths.get(uploadDir + "/messages/audios");
        if (!Files.exists(path)) {
          Files.createDirectories(path);
        }
        String filename = System.currentTimeMillis() + "_" + req.getAudio().getOriginalFilename();
        Path filePath = path.resolve(filename);

        Files.copy(req.getAudio().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        message.setAudioUrl("/uploads/messages/audios/" + filename); 

      } catch (Exception e) {
        e.printStackTrace();
        throw new ChatException("Error while uploading message audio: " + e.getMessage());
      }
    }
    message.setRead(false);

    messageRepository.save(message);

    for (User member : chat.getUsers()) {
      if (!member.getId().equals(user.getId())) {
        Optional<UserChatStatus> memberStatusOpt = userChatStatusRepository.findByUserAndChat(member, chat);
        if (memberStatusOpt.isPresent()) {
          UserChatStatus memberStatus = memberStatusOpt.get();
          if (memberStatus.getStatus() != Status.MUTED) {
            unreadCountService.incrementUnreadCount(member, chat);
          }
        } else {
          unreadCountService.incrementUnreadCount(member, chat);
        }
      }
    }

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

  @Override
  public void markMessagesAsRead(Integer chatId, Integer userId) throws ChatException, UserException {
    Chat chat = chatService.findChatById(chatId);
    User user = userService.findUserById(userId);

    if (!chat.getUsers().contains(user)) {
      throw new ChatException("User is not a member of this chat.");
    }

    List<Message> unreadMessages = messageRepository.findByChatIdAndUserIdAndIsReadFalse(chatId, userId);
    for (Message message : unreadMessages) {
      message.setRead(true);
      messageRepository.save(message);
    }

    unreadCountService.resetUnreadCount(user, chat);
  }

  @Override
  public void togglePinMessage(Integer messageId, Integer userId) throws ChatException, UserException {
    Message message = messageRepository.findById(messageId)
        .orElseThrow(() -> new ChatException("Message not found with id: " + messageId));

    User user = userService.findUserById(userId);
    Chat chat = message.getChat();

    if (!chat.getUsers().contains(user)) {
      throw new ChatException("User is not a member of this chat.");
    }

    message.setPinned(!message.isPinned());
    messageRepository.save(message);
  }

  @Override
  public Message getLatestPinnedMessage(Integer chatId) throws ChatException, UserException {
    chatService.findChatById(chatId);

    List<Message> pinnedMessages = messageRepository.findByChatIdAndIsPinnedTrue(chatId);
    if (pinnedMessages.isEmpty()) {
      return null;
    }

    pinnedMessages.sort((m1, m2) -> m2.getTimestamp().compareTo(m1.getTimestamp()));
    return pinnedMessages.get(0);
  }

  @Override
  public List<Message> searchMessages(Integer chatId, String keyword, int pageSize, int pageNumber)
      throws UserException, ChatException {
    chatService.findChatById(chatId);

    Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("timestamp").descending());
    Page<Message> messagePage = messageRepository.searchByChatIdAndContentContaining(chatId, keyword, pageable);
    return messagePage.getContent();
  }
  
  @Override
  public List<Message> getPinnedMessages(Integer chatId) throws ChatException, UserException {
    chatService.findChatById(chatId);

    return messageRepository.findByChatIdAndIsPinnedTrue(chatId);
  }

  @Override
  public Interaction addInteraction(Integer messageId, Integer userId, String type) throws MessageException, UserException, ChatException {
      Message message = findMessageById(messageId);
      User user = userService.findUserById(userId);
      
      if (!message.getChat().getUsers().contains(user)) {
          throw new UserException("You are not a member of this chat.");
      }
      
      Interaction interaction = new Interaction();
      interaction.setMessage(message);
      interaction.setUser(user);
      interaction.setType(type);
      
      return interactionRepository.save(interaction);
  }

  @Override
  public void removeInteraction(Integer interactionId, Integer userId) throws MessageException, UserException, ChatException {
      Optional<Interaction> interactionOpt = interactionRepository.findById(interactionId);
      if (interactionOpt.isPresent()) {
          Interaction interaction = interactionOpt.get();
          if (!interaction.getUser().getId().equals(userId)) {
              throw new UserException("You can only remove your own interactions.");
          }
          interactionRepository.delete(interaction);
      } else {
          throw new MessageException("Interaction not found.");
      }
  }
}
