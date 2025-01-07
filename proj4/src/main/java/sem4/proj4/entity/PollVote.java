package sem4.proj4.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PollVote {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne
  @JoinColumn(name = "poll_id", nullable = false)
  private Poll poll;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column
  private Integer chosenOption;
}

