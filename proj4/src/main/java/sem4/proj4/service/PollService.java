package sem4.proj4.service;

import java.util.List;
import sem4.proj4.entity.Poll;
import sem4.proj4.entity.PollVote;
import sem4.proj4.exception.PollException;
import sem4.proj4.exception.UserException;

public interface PollService {
  Poll createPoll(Poll poll);

  Poll getPollById(Integer pollId);
  
  List<Poll> getPollsByChatId(Integer chatId);

  Poll updatePoll(Poll poll);
  
  void deletePoll(Integer pollId);

  void voteForOption(Integer pollId, Integer userId, Integer optionIndex) throws UserException, PollException ;
  
  List<Long> getPollResults(Integer pollId);

  PollVote getUserVote(Integer pollId, Integer userId) throws PollException, UserException;
}

