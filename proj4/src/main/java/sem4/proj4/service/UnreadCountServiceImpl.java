package sem4.proj4.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sem4.proj4.entity.Chat;
import sem4.proj4.entity.UnreadCount;
import sem4.proj4.entity.User;
import sem4.proj4.repository.UnreadCountRepository;

import java.util.Optional;

@Service
public class UnreadCountServiceImpl implements UnreadCountService {

  @Autowired
  private UnreadCountRepository unreadCountRepository;

  @Override
  public void incrementUnreadCount(User user, Chat chat) {
    Optional<UnreadCount> optional = unreadCountRepository.findByUserAndChat(user, chat);
    UnreadCount unreadCount;
    if (optional.isPresent()) {
      unreadCount = optional.get();
      unreadCount.setCount(unreadCount.getCount() + 1);
    } else {
      unreadCount = new UnreadCount();
      unreadCount.setUser(user);
      unreadCount.setChat(chat);
      unreadCount.setCount(1);
    }
    unreadCountRepository.save(unreadCount);
  }

  @Override
  public void resetUnreadCount(User user, Chat chat) {
    Optional<UnreadCount> optional = unreadCountRepository.findByUserAndChat(user, chat);
    if (optional.isPresent()) {
      UnreadCount unreadCount = optional.get();
      unreadCount.setCount(0);
      unreadCountRepository.save(unreadCount);
    }
  }

  @Override
  public Integer getUnreadCount(User user, Chat chat) {
    Optional<UnreadCount> optional = unreadCountRepository.findByUserAndChat(user, chat);
    return optional.map(UnreadCount::getCount).orElse(0);
  }
}