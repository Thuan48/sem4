package sem4.proj4.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sem4.proj4.entity.Poll;
import sem4.proj4.entity.PollVote;
import sem4.proj4.exception.PollException;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.PollRepository;
import sem4.proj4.repository.PollVoteRepository;
import sem4.proj4.entity.User;

@Service
public class PollServiceImplementation implements PollService {

  @Autowired
  private PollRepository pollRepository;
  @Autowired
  private PollVoteRepository pollVoteRepository;
  @Autowired
  private UserService userService;

  @Override
  public Poll createPoll(Poll poll) {
    return pollRepository.save(poll);
  }

  @Override
  public Poll getPollById(Integer pollId) {
    return pollRepository.findById(pollId)
        .orElseThrow(() -> new PollException("Poll not found with id: " + pollId));
  }

  @Override
  public List<Poll> getPollsByChatId(Integer chatId) {
    return pollRepository.findByChatId(chatId);
  }

  @Override
  public Poll updatePoll(Poll poll) {
    Poll existingPoll = getPollById(poll.getId());
    existingPoll.setQuestion(poll.getQuestion());
    existingPoll.setInstructions(poll.getInstructions());
    existingPoll.setOptions(poll.getOptions());
    existingPoll.setAllowMultipleChoices(poll.isAllowMultipleChoices());
    existingPoll.setDeadline(poll.getDeadline());
    return pollRepository.save(existingPoll);
  }

  @Override
  public void deletePoll(Integer pollId) {
    Poll poll = getPollById(pollId);
    pollRepository.delete(poll);
  }

  @Override
  public void voteForOption(Integer pollId, Integer userId, Integer optionIndex) throws UserException, PollException {
    Poll poll = getPollById(pollId);

    if (optionIndex < 0 || optionIndex >= poll.getOptions().size()) {
      throw new PollException("Invalid option index.");
    }

    Optional<PollVote> existingVoteOpt = pollVoteRepository.findByPollIdAndUserId(pollId, userId);

    if (existingVoteOpt.isPresent()) {
      PollVote existingVote = existingVoteOpt.get();

      if (!poll.isAllowMultipleChoices()) {
        throw new PollException("You have already voted on this poll.");
      } else {
        existingVote.setChosenOption(optionIndex);
        pollVoteRepository.save(existingVote);
        return;
      }
    }
    User user = userService.findUserById(userId);
    if (user == null) {
      throw new PollException("User not found with id: " + userId);
    }

    PollVote pollVote = new PollVote();
    pollVote.setPoll(poll);
    pollVote.setUser(user);
    pollVote.setChosenOption(optionIndex);
    pollVoteRepository.save(pollVote);
  }

  @Override
  public List<Long> getPollResults(Integer pollId) {
    Poll poll = getPollById(pollId);
    List<Long> counts = new ArrayList<>();
    for (int i = 0; i < poll.getOptions().size(); i++) {
      counts.add(pollVoteRepository.countByPollIdAndChosenOption(pollId, i));
    }
    return counts;
  }
  
  @Override
  public PollVote getUserVote(Integer pollId, Integer userId) throws PollException, UserException {
    getPollById(pollId);

    Optional<PollVote> voteOpt = pollVoteRepository.findByPollIdAndUserId(pollId, userId);
    if (voteOpt.isPresent()) {
      return voteOpt.get();
    } else {
      return null;
    }
  }

}
