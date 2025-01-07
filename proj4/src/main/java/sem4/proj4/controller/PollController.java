package sem4.proj4.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sem4.proj4.entity.Chat;
import sem4.proj4.entity.Poll;
import sem4.proj4.entity.PollVote;
import sem4.proj4.exception.ChatException;
import sem4.proj4.exception.PollException;
import sem4.proj4.exception.UserException;
import sem4.proj4.service.ChatService;
import sem4.proj4.service.PollService;
import sem4.proj4.service.UserService;
import sem4.proj4.entity.User;

import java.util.List;

@RestController
@RequestMapping("/api/polls")
public class PollController {

  @Autowired
  private PollService pollService;

  @Autowired
  private ChatService chatService;

  @Autowired
  private UserService userService;

  @PostMapping("/create/{chatId}")
  public Poll createPoll(@RequestBody Poll poll, @PathVariable Integer chatId,
      @RequestHeader("Authorization") String jwt) throws ChatException, UserException {
    Chat chat = chatService.findChatById(chatId);

    User user = userService.findUserProfile(jwt);
    if (user == null) {
      throw new UserException("User not found for token: " + jwt);
    }

    poll.setChat(chat);
    poll.setCreatedBy(user);
    return pollService.createPoll(poll);
  }

  @GetMapping("/{pollId}")
  public Poll getPollById(@PathVariable Integer pollId) throws PollException {
    return pollService.getPollById(pollId);
  }

  @GetMapping("/chat/{chatId}")
  public List<Poll> getPollsByChatId(@PathVariable Integer chatId) throws ChatException {
    Chat chat = chatService.findChatById(chatId);
    if (chat == null) {
      throw new ChatException("Chat not found with id: " + chatId);
    }
    return pollService.getPollsByChatId(chatId);
  }

  @PutMapping("/update/{pollId}")
  public Poll updatePoll(@PathVariable Integer pollId, @RequestBody Poll poll) throws PollException {
    poll.setId(pollId);
    return pollService.updatePoll(poll);
  }

  @DeleteMapping("/{pollId}")
  public void deletePoll(@PathVariable Integer pollId) throws PollException {
    pollService.deletePoll(pollId);
  }

  @PostMapping("/{pollId}/vote")
  public void voteForOption(@PathVariable Integer pollId,
      @RequestParam Integer optionIndex,
      @RequestHeader("Authorization") String token) throws PollException, UserException {
    User user = userService.findUserProfile(token);
    pollService.voteForOption(pollId, user.getId(), optionIndex);
  }

  @GetMapping("/{pollId}/results")
  public ResponseEntity<List<Long>> getPollResults(@PathVariable Integer pollId) {
    List<Long> results = pollService.getPollResults(pollId);
    return ResponseEntity.ok(results);
  }

  @GetMapping("/{pollId}/user-vote")
  public PollVote getUserVote(@PathVariable Integer pollId,
                            @RequestHeader("Authorization") String token) throws PollException, UserException {
    User user = userService.findUserProfile(token);
    if (user == null) {
        throw new UserException("User not found for token: " + token);
    }
    PollVote userVote = pollService.getUserVote(pollId, user.getId());
    return userVote;
  }
}
