package sem4.proj4.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "message")
public class Message {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column
  private Integer id;
  @Column
  private String content;
  @Column
  private String imageUrl;
  @Column
  private String audioUrl;
  @Column
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime timestamp;
  @Column(nullable = false)
  private boolean isRead;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne
  @JoinColumn(name = "chat_id")
  private Chat chat;

  @Column
  private boolean isPinned;

  @ManyToOne
  @JoinColumn(name = "poll_id")
  private Poll poll;

  public Message(String content, String imageUrl, String audioUrl, User user, Chat chat) {
    this.content = content;
    this.imageUrl = imageUrl;
    this.audioUrl = audioUrl;
    this.user = user;
    this.chat = chat;
    this.timestamp = LocalDateTime.now();
    this.isRead = false;
    this.isPinned = false;
  }

  public Message(String content, String imageUrl, String audioUrl, User user, Chat chat, Poll poll) {
    this.content = content;
    this.imageUrl = imageUrl;
    this.audioUrl = audioUrl;
    this.user = user;
    this.chat = chat;
    this.poll = poll;
    this.timestamp = LocalDateTime.now();
    this.isRead = false;
    this.isPinned = false;
  }
}
