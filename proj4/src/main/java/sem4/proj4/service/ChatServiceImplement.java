package sem4.proj4.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.Message;
import sem4.proj4.entity.User;
import sem4.proj4.entity.UserChatStatus;
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.ChatRepository;
import sem4.proj4.repository.MessageRepository;
import sem4.proj4.repository.UserChatStatusRepository;
import sem4.proj4.request.ChatDto;
import sem4.proj4.request.GroupChatRequest;
import sem4.proj4.request.UserDto;

@Service
public class ChatServiceImplement implements ChatService {

  @Autowired
  ChatRepository chatRepository;
  @Autowired
  MessageRepository messageRepository;
  @Autowired
  UserChatStatusRepository userChatStatusRepository;
  @Autowired
  private SimpMessagingTemplate simpMessagingTemplate;
  @Autowired
  private UnreadCountService unreadCountService;
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

    Chat savedChat = chatRepository.save(chat);
    initializeUserChatStatus(savedChat, chat.getUsers());
    updateChatListForUsers(savedChat);
    return savedChat;
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

    Chat savedChat = chatRepository.save(group);

    initializeUserChatStatus(savedChat, group.getUsers());
    updateChatListForUsers(savedChat);
    return savedChat;
  }

  private void initializeUserChatStatus(Chat chat, Set<User> users) {
    for (User user : users) {
      UserChatStatus status = new UserChatStatus();
      status.setChat(chat);
      status.setUser(user);
      status.setStatus(UserChatStatus.Status.DEFAULT);

      userChatStatusRepository.save(status);
    }
  }

  @Override
  public Chat addUserToGroup(Integer userId, Integer chatId, User reqUser) throws ChatException, UserException {
    Optional<Chat> opt = chatRepository.findById(chatId);

    User user = userService.findUserById(userId);
    if (opt.isPresent()) {
      Chat chat = opt.get();
      if (chat.getAdmin().contains(reqUser)) {
        chat.getUsers().add(user);
        chatRepository.save(chat);

        UserChatStatus status = new UserChatStatus();
        status.setChat(chat);
        status.setUser(user);
        status.setStatus(UserChatStatus.Status.DEFAULT);
        userChatStatusRepository.save(status);

        return chat;
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
      updateChatListForUsers(chat);
    }
  }

  @Override
  public List<ChatDto> getChatsWithLastMessage(Integer userId) throws ChatException, UserException {
    List<Chat> chats = chatRepository.findChatByUserid(userId);
    User userss = userService.findUserById(userId);
    List<ChatDto> chatDtos = new ArrayList<>();
    List<Integer> chatIds = chats.stream().map(Chat::getId).collect(Collectors.toList());

    List<Object[]> unreadCounts = messageRepository.countUnreadMessagesPerChat(userId, chatIds);
    Map<Integer, Integer> unreadCountMap = new HashMap<>();
    for (Object[] obj : unreadCounts) {
      Integer chatId = (Integer) obj[0];
      Long count = (Long) obj[1];
      unreadCountMap.put(chatId, count.intValue());
    }

    for (Chat chat : chats) {
      Message lastMessage = messageRepository.findTopByChatOrderByTimestampDesc(chat);
      ChatDto chatDto = new ChatDto();
      chatDto.setId(chat.getId());
      chatDto.setChatName(chat.getChat_name());
      chatDto.setChatImage(chat.getChat_image());
      chatDto.setGroup(chat.isGroup());
      chatDto.setLastMessageContent(lastMessage != null ? lastMessage.getContent() : null);
      chatDto.setLastMessageTimestamp(lastMessage != null ? lastMessage.getTimestamp() : null);

      List<UserDto> userDtos = chat.getUsers().stream()
          .map(user -> new UserDto(user.getId(), user.getFull_name(), user.getProfile_picture()))
          .collect(Collectors.toList());
      chatDto.setUsers(userDtos);

      if (chat.isGroup()) {
        List<Integer> adminIds = chat.getAdmin().stream()
            .map(User::getId)
            .collect(Collectors.toList());
        chatDto.setUserAdminIds(adminIds);
      } else {
        Set<User> userSet = chat.getUsers();
        List<User> userList = new ArrayList<>(userSet);
        for (User user : userList) {
          if (!user.getId().equals(userId)) {
            chatDto.setUserName(user.getFull_name());
            chatDto.setUserImage(user.getProfile_picture());
            chatDto.setUserId(user.getId());
            break;
          }
        }
        chatDto.setUserAdminIds(null);
      }
      Integer unreadCount = unreadCountService.getUnreadCount(userss, chat);
      chatDto.setUnreadCount(unreadCount);
      chatDtos.add(chatDto);
    }

    return chatDtos;
  }

  @Override
  public List<User> getChatMembers(Integer chatId) throws ChatException {
    Optional<Chat> chatOptional = chatRepository.findById(chatId);
    if (!chatOptional.isPresent()) {
      throw new ChatException("Chat not found with id: " + chatId);
    }
    Chat chat = chatOptional.get();
    Set<User> members = chat.getUsers();
    return new ArrayList<>(members);
  }

  public void updateChatListForUsers(Chat chat) {
    try {
      for (User member : chat.getUsers()) {
        List<ChatDto> updatedChatList = getChatsWithLastMessage(member.getId());
        simpMessagingTemplate.convertAndSendToUser(member.getEmail(), "/queue/chatList", updatedChatList);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  @Override
  public void markMessagesAsRead(Integer chatId, Integer userId) throws ChatException, UserException {
    User user = userService.findUserById(userId);
    Chat chat = chatRepository.findById(chatId)
        .orElseThrow(() -> new ChatException("Chat not found with id " + chatId));

    if (!chat.getUsers().contains(user)) {
      throw new ChatException("User is not a member of the chat.");
    }

    List<Message> unreadMessages = messageRepository.findByChatIdAndIsReadFalse(chatId);

    for (Message message : unreadMessages) {
      if (!message.getUser().getId().equals(userId)) {
        message.setRead(true);
        messageRepository.save(message);
      }
    }

    unreadCountService.resetUnreadCount(user, chat);
  }

  @Override
  public Integer countUnreadMessages(Integer userId, Integer chatId) throws UserException, ChatException {
    User user = userService.findUserById(userId);
    Chat chat = chatRepository.findById(chatId)
        .orElseThrow(() -> new ChatException("Chat not found with id " + chatId));

    if (!chat.getUsers().stream().anyMatch(u -> u.getId().equals(userId))) {
      throw new ChatException("User is not a member of the chat.");
    }

    return unreadCountService.getUnreadCount(user, chat);
  }

  @Override
  public UserChatStatus updateUserChatStatus(Integer chatId, Integer userId, Integer blockerId, UserChatStatus.Status status)
      throws ChatException, UserException {
    User user = userService.findUserById(userId);
    Chat chat = findChatById(chatId);

    if (!chat.getUsers().contains(user)) {
      throw new UserException("User is not a member of this chat.");
    }

    Optional<UserChatStatus> optionalStatus = userChatStatusRepository.findByUserAndChat(user, chat);
    UserChatStatus userChatStatus;

    if (optionalStatus.isPresent()) {
      userChatStatus = optionalStatus.get();
    } else {
      userChatStatus = new UserChatStatus();
      userChatStatus.setUser(user);
      userChatStatus.setChat(chat);
    }

    userChatStatus.setStatus(status);

    if (status == UserChatStatus.Status.BLOCKED) {
      userChatStatus.setBlockedByUserId(blockerId); 
    } else {
      userChatStatus.setBlockedByUserId(null);
    }

    return userChatStatusRepository.save(userChatStatus);
  }

  @Override
  public UserChatStatus getUserChatStatus(Integer chatId, Integer userId) throws ChatException, UserException {
    User user = userService.findUserById(userId);
    Chat chat = findChatById(chatId);

    if (!chat.getUsers().contains(user)) {
      throw new UserException("User is not a member of this chat.");
    }

    return userChatStatusRepository.findByUserAndChat(user, chat)
        .orElse(new UserChatStatus(null, user, chat, UserChatStatus.Status.DEFAULT, null));
  }

  @Override
  public UserChatStatus blockChatStatus(Integer chatId, Integer userId,
      UserChatStatus.Status status) throws ChatException, UserException {
    if (status != UserChatStatus.Status.BLOCKED) {
      throw new ChatException("Invalid status. Only BLOCKED status is allowed for this operation.");
    }

    User blocker = userService.findUserById(userId);
    if (blocker == null) {
      throw new UserException("User not found with ID: " + userId);
    }

    Chat chat = chatRepository.findById(chatId)
        .orElseThrow(() -> new ChatException("Chat not found with ID: " + chatId));

    if (chat.isGroup()) {
      throw new ChatException("Cannot perform bulk block on group chats.");
    }

    Set<User> usersInChat = chat.getUsers();
    if (usersInChat == null || usersInChat.isEmpty()) {
      throw new ChatException("No users found in the chat with ID: " + chatId);
    }

    for (User user : usersInChat) {
      UserChatStatus userChatStatus = userChatStatusRepository.findByChatAndUser(chat, user)
          .orElseThrow(() -> new ChatException("UserChatStatus not found for user ID: " + user.getId()));

      userChatStatus.setStatus(UserChatStatus.Status.BLOCKED);
      userChatStatus.setBlockedByUserId(blocker.getId());

      userChatStatusRepository.save(userChatStatus);
    }
    return null;
  }

  @Override
  public UserChatStatus unblockChatStatus(Integer chatId, Integer userId,
      UserChatStatus.Status status) throws ChatException, UserException {

    if (status != UserChatStatus.Status.DEFAULT) {
      throw new ChatException("Invalid status. Only DEFAULT status is allowed for this operation.");
    }

    User requester = userService.findUserById(userId);
    if (requester == null) {
      throw new UserException("User not found with ID: " + userId);
    }

    Chat chat = chatRepository.findById(chatId)
        .orElseThrow(() -> new ChatException("Chat not found with ID: " + chatId));

    if (!chat.isGroup()) {
      Set<User> usersInChat = chat.getUsers();

      for (User user : usersInChat) {
        UserChatStatus userChatStatus = userChatStatusRepository.findByChatAndUser(chat, user)
            .orElseThrow(() -> new ChatException("UserChatStatus not found for user ID: " + user.getId()));

        userChatStatus.setStatus(UserChatStatus.Status.DEFAULT);
        userChatStatus.setBlockedByUserId(null);

        userChatStatusRepository.save(userChatStatus);
      }
      return null;
    } else {
      UserChatStatus userChatStatus = userChatStatusRepository.findByChatAndUser(chat, requester)
          .orElseThrow(() -> new ChatException("UserChatStatus not found for user ID: " + requester.getId()));

      userChatStatus.setStatus(status);
      userChatStatus.setBlockedByUserId(null);

      return userChatStatusRepository.save(userChatStatus);
    }
  }

  @Override
  public Map<Integer, UserChatStatus> getUserStatusesInChat(Integer chatId) throws ChatException, UserException {
    Chat chat = findChatById(chatId);
    List<UserChatStatus> statuses = userChatStatusRepository.findAllByChat(chat);
    Map<Integer, UserChatStatus> statusMap = new HashMap<>();
    for (UserChatStatus status : statuses) {
      statusMap.put(status.getUser().getId(), status);
    }
    return statusMap;
  }
}
