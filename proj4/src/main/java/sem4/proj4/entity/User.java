package sem4.proj4.entity;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user")
public class User {
  @Id
  @Column
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;
  @Column
  private String full_name;
  @Column
  private String email;
  @Column
  private String profile_picture;
  @Column
  private String address;
  @Column
  private String gender;
  @Column
  private String phone;
  @Column
  @JsonFormat(pattern = "yyyy-MM-dd")
  private LocalDate dob;
  @Column
  private String bio;
  @Column
  private String password;
  @Column
  private boolean isEmailConfirmed;
  @OneToMany(mappedBy = "userInitiator", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Friendship> sentFriendships = new HashSet<>();

  @OneToMany(mappedBy = "userRecipient", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Friendship> receivedFriendships = new HashSet<>();
}
