package sem4.proj4.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.User;

public interface ChatRepository extends JpaRepository<Chat, Integer> {

  @Query("select c from Chat c join c.users u where u.id = :userId ")
  List<Chat> findChatByUserid(@Param("userId") Integer userId);

  @Query("SELECT c FROM Chat c WHERE c.isGroup = false AND :user MEMBER OF c.users AND :reqUser MEMBER OF c.users")
  public Chat findSingleChatByUserIds(@Param("user") User user, @Param("reqUser") User reqUser);
}
