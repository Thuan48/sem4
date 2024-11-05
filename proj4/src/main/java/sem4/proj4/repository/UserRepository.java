package sem4.proj4.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import sem4.proj4.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
  @Query("SELECT u FROM User u WHERE u.email = ?1")
  public User findByEmail(String email);

  @Query("SELECT u FROM User u WHERE " +
      "CONCAT(u.full_name, ' ', u.email) LIKE %:query%")
  public List<User> searchUser(@Param("query") String query);

}
