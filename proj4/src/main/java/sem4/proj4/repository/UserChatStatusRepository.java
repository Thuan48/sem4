package sem4.proj4.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.User;
import sem4.proj4.entity.UserChatStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserChatStatusRepository extends JpaRepository<UserChatStatus, Integer> {

  Optional<UserChatStatus> findByUserAndChat(User user, Chat chat);
  
  Optional<UserChatStatus> findByChatAndUser(Chat chat, User user);

  List<UserChatStatus> findAllByChat(Chat chat);
}