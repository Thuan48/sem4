package sem4.proj4.entity;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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

@Entity
@Table(name = "poll")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Poll {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column
  private String question;

  @ElementCollection
  private List<String> options = new ArrayList<>();

  @ManyToOne
  @JoinColumn(name = "created_by", nullable = false)
  private User createdBy;

  @ManyToOne
  @JoinColumn(name = "chat_id", nullable = false)
  private Chat chat;

  @Column
  private boolean allowMultipleChoices;

  @Column
  private String instructions;

  @Column
  private LocalDateTime deadline;
}

