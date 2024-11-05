package sem4.proj4.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import sem4.proj4.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, String> {


}
