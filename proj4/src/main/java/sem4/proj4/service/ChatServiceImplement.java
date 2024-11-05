package sem4.proj4.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.Message;
import sem4.proj4.entity.User;
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.ChatRepository;
import sem4.proj4.repository.MessageRepository;
import sem4.proj4.request.ChatDto;
import sem4.proj4.request.GroupChatRequest;

@Service
public class ChatServiceImplement implements ChatService {

  @Autowired
  ChatRepository chatRepository;
  @Autowired
  MessageRepository messageRepository;
  @Autowired
  UserService userService;
  @Value("${config-upload-dir}")
  private String uploadDir;

  @Override
  public Chat createChat(User reqUser, Integer toUser, String chatName, String chatImage) throws UserException {
    User user = userService.findUserById(toUser);
    Chat chatExist = chatRepository.findSingleChatByUserIds(user, reqUser);

    if (chatExist != null) {
      return chatExist;
    }

    Chat chat = new Chat();
    chat.setChat_image(chatImage);
    chat.setChat_name(chatName);

    chat.setCreatedBy(reqUser);
    chat.getUsers().add(user);
    chat.getUsers().add(reqUser);
    chat.setGroup(false);

    return chatRepository.save(chat);
  }

  @Override
  public Chat findChatById(Integer chatId) throws ChatException {
    Optional<Chat> chat = chatRepository.findById(chatId);

    if (chat.isPresent()) {
      return chat.get();
    }
    throw new ChatException("chat not found with id" + chatId);
  }

  @Override
  public List<Chat> findAllChatByUserId(Integer userId) throws UserException {
    User user = userService.findUserById(userId);
    List<Chat> chats = chatRepository.findChatByUserid(user.getId());
    return chats;
  }

  @Override
  public Chat createGroup(GroupChatRequest req, User reqUser) throws UserException {
    Chat group = new Chat();
    group.setGroup(true);
    group.setChat_name(req.getChat_name());
    group.setCreatedBy(reqUser);
    group.getAdmin().add(reqUser);

    group.getUsers().add(reqUser);

    try {
      Path path = Paths.get(uploadDir + "/groupchat");
      if (!Files.exists(path)) {
        Files.createDirectories(path);
      }
      String filename = req.getChat_image().getOriginalFilename();
      Path filePath = path.resolve(filename);

      Files.copy(req.getChat_image().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

      group.setChat_image(filename);
    } catch (Exception e) {
      e.printStackTrace();
      throw new UserException("Error while uploading group image: " + e.getMessage());
    }
    for (Integer userId : req.getUserIds()) {
      User user = userService.findUserById(userId);
      group.getUsers().add(user);
    }

    return chatRepository.save(group);
  }

  @Override
  public Chat addUserToGroup(Integer userId, Integer chatId, User reqUser) throws ChatException, UserException {
    Optional<Chat> opt = chatRepository.findById(chatId);

    User user = userService.findUserById(userId);
    if (opt.isPresent()) {
      Chat chat = opt.get();
      if (chat.getAdmin().contains(reqUser)) {
        chat.getUsers().add(user);
        return chatRepository.save(chat);
      } else {
        throw new UserException("You not admin of group");
      }
    }
    throw new ChatException("chat not found with" + chatId);
  }

  @Override
  public Chat renameGroup(Integer chatId, String groupName, User reqUser) throws ChatException, UserException {
    Optional<Chat> opt = chatRepository.findById(chatId);
    if (opt.isPresent()) {
      Chat chat = opt.get();
      if (chat.getUsers().contains(reqUser)) {
        chat.setChat_name(groupName);
        return chatRepository.save(chat);
      } else {
        throw new UserException("You not member of group");
      }
    }
    throw new ChatException("Chat not found with " + chatId);
  }

  @Override
  public Chat removeFromGroup(Integer chatId, Integer userId, User reqUser) throws UserException, ChatException {
    Optional<Chat> opt = chatRepository.findById(chatId);

    if (opt.isPresent()) {
      Chat chat = opt.get();
      User userToRemove = userService.findUserById(userId);

      if (chat.getAdmin().contains(reqUser)) {
        chat.getUsers().remove(userToRemove);
        chatRepository.save(chat);
        return chat;
      }

      if (chat.getUsers().contains(reqUser) && userToRemove.getId().equals(reqUser.getId())) {
        chat.getUsers().remove(userToRemove);
        chatRepository.save(chat);
        return chat;
      }

      throw new UserException("You cannot remove another user");
    }

    throw new ChatException("Chat not found with ID: " + chatId);
  }

  @Override
  public void deleteChat(Integer chatId, Integer userId) throws ChatException {
    Optional<Chat> opt = chatRepository.findById(chatId);

    if (opt.isPresent()) {
      Chat chat = opt.get();
      chatRepository.deleteById(chat.getId());
    }
  }

  @Override
  public List<ChatDto> getChatsWithLastMessage(Integer userId) throws ChatException,UserException {
    List<Chat> chats = chatRepository.findAll();
        List<ChatDto> chatDtos = new ArrayList<>();
        //User user = userService.findUserById(userId);
        
        for (Chat chat : chats) {
            Message lastMessage = messageRepository.findTopByChatOrderByTimestampDesc(chat);
            ChatDto chatDto = new ChatDto();
            chatDto.setId(chat.getId());
            chatDto.setChatName(chat.getChat_name());
            chatDto.setChatImage(chat.getChat_image());
            chatDto.setGroup(chat.isGroup());
            chatDto.setLastMessageContent(lastMessage != null ? lastMessage.getContent() : null);
            chatDto.setLastMessageTimestamp(lastMessage != null ? lastMessage.getTimestamp() : null);
            if (!chat.isGroup()) {
              // Lấy danh sách người dùng trong chat
              Set<User> userSet = chat.getUsers();
              List<User> userList = new ArrayList<>(userSet);// giả sử có phương thức getUsers() trong Chat
              // Lấy thông tin người dùng để đặt tên và ảnh
              for (User users : userList) {
                if (!users.getId().equals(userId)) { // Nếu người dùng không phải là người gọi
                  chatDto.setUserName(users.getFull_name()); // Giả sử có phương thức getFullName()
                  chatDto.setUserImage(users.getProfile_picture()); // Giả sử có phương thức getProfilePicture()
                  break; // Chỉ lấy người đầu tiên không phải người gọi
                }
              }
            }
            chatDtos.add(chatDto);
        }
        return chatDtos;
  }
  
}
