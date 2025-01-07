package sem4.proj4.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import sem4.proj4.entity.PollVote;

public interface PollVoteRepository extends JpaRepository<PollVote, Integer> {
  Optional<PollVote> findByPollIdAndUserId(Integer pollId, Integer userId);

  Long countByPollIdAndChosenOption(Integer pollId, Integer chosenOption);
}


