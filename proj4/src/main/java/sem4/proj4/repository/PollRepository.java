package sem4.proj4.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import sem4.proj4.entity.Poll;

public interface PollRepository extends JpaRepository<Poll, Integer> {
  List<Poll> findByChatId(Integer chatId);

  List<Poll> findByChatIdAndDeadlineAfter(Integer chatId, LocalDateTime currentTime);

  List<Poll> findByChatIdAndDeadlineBefore(Integer chatId, LocalDateTime currentTime);

  List<Poll> findByDeadlineBefore(LocalDateTime currentTime);
}
