package sem4.proj4.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_chat_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserChatStatus {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne
  @JoinColumn(name = "chat_id", nullable = false)
  @JsonBackReference
  private Chat chat;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private Status status = Status.DEFAULT;

  @Column(name = "blocked_by_user_id")
  private Integer blockedByUserId;

  public enum Status {
    DEFAULT,
    BLOCKED,
    MUTED
  }
}