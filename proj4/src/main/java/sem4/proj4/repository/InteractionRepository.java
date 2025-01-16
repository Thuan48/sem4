package sem4.proj4.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sem4.proj4.entity.Interaction;

import java.util.List;
import java.util.Optional;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Integer> {
  List<Interaction> findByMessageId(Integer messageId);

  Optional<Interaction> findByMessageIdAndUserId(Integer messageId, Integer userId);
}