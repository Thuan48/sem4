package sem4.proj4.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import sem4.proj4.entity.Chat;
import sem4.proj4.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Integer> {

  @Query("select m from Message m join m.chat c where c.id=:chatId order by m.timestamp desc")
  Page<Message> findByChatId(@Param("chatId") Integer chatId, Pageable pageable);

  @Query("SELECT m FROM Message m WHERE m.chat = :chat ORDER BY m.timestamp DESC")
  List<Message> findByChatOrderByTimestampDesc(@Param("chat") Chat chat);
  
  default Message findTopByChatOrderByTimestampDesc(Chat chat) {
    List<Message> messages = findByChatOrderByTimestampDesc(chat);
    return messages.isEmpty() ? null : messages.get(0);
  }

  @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.isRead = false AND m.user.id <> :userId")
  long countUnreadMessagesByChatIdAndUserIdNot(@Param("chatId") Integer chatId, @Param("userId") Integer userId);
  
  List<Message> findByChatIdAndIsReadFalse(Integer chatId);

  List<Message> findByChatIdAndUserIdAndIsReadFalse(Integer chatId, Integer userId);

  Integer countByUserIdAndIsReadFalse(Integer userId);

  @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.isRead = false AND m.user.id <> :userId")
  long countByUserIdAndChatIdAndIsReadFalse(@Param("userId") Integer userId, @Param("chatId") Integer chatId);

  @Query("SELECT m.chat.id, COUNT(m) FROM Message m WHERE m.user.id = :userId AND m.chat.id IN :chatIds AND m.isRead = false GROUP BY m.chat.id")
  List<Object[]> countUnreadMessagesPerChat(@Param("userId") Integer userId, @Param("chatIds") List<Integer> chatIds);

  @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId AND m.isPinned = true ORDER BY m.timestamp DESC")
  List<Message> findByChatIdAndIsPinnedTrue(@Param("chatId") Integer chatId);
}
