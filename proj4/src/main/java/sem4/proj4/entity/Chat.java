package sem4.proj4.entity;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "chat")
public class Chat {

  @Id
  @Column
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;
  @Column
  private String chat_name;
  @Column
  private String chat_image;

  @ManyToMany
  private Set<User> admin = new HashSet<>();

  @Column(name = "is_group")
  private boolean isGroup;

  @JoinColumn(name = "created_by")
  @ManyToOne
  private User createdBy;

  @ManyToMany
  private Set<User> users = new HashSet<>();

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Message> messages = new ArrayList<>();
}
