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
}
