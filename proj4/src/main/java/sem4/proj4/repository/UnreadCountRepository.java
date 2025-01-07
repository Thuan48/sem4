package sem4.proj4.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sem4.proj4.entity.Chat;
import sem4.proj4.entity.UnreadCount;
import sem4.proj4.entity.User;

import java.util.Optional;

@Repository
public interface UnreadCountRepository extends JpaRepository<UnreadCount, Long> {
  Optional<UnreadCount> findByUserAndChat(User user, Chat chat);
}