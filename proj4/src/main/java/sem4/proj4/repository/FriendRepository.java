package sem4.proj4.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sem4.proj4.entity.Friendship;
import sem4.proj4.entity.FriendshipStatus;
import sem4.proj4.entity.User;

public interface FriendRepository extends JpaRepository<Friendship, Integer> {

        Optional<Friendship> findByUserInitiatorIdAndUserRecipientId(Integer userInitiatorId, Integer userRecipientId);

        List<Friendship> findByUserInitiatorIdOrUserRecipientId(Integer userInitiatorId, Integer userRecipientId);

        void deleteByUserInitiatorIdAndUserRecipientId(Integer userInitiatorId, Integer userRecipientId);

        List<Friendship> findByUserRecipientIdAndStatus(Integer recipientId, FriendshipStatus status);

        @Query("SELECT u FROM User u WHERE u.id IN (" +
                        "SELECT CASE " +
                        "WHEN f.userInitiator.id = :userId THEN f.userRecipient.id " +
                        "ELSE f.userInitiator.id END " +
                        "FROM Friendship f " +
                        "WHERE (f.userInitiator.id = :userId OR f.userRecipient.id = :userId) " +
                        "AND f.status = 'ACCEPTED')" +
                        "AND (:name IS NULL OR LOWER(u.full_name) LIKE LOWER(CONCAT('%', :name, '%')))" +
                        "AND (:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%')))" +
                        "AND (:phone IS NULL OR u.phone LIKE CONCAT('%', :phone, '%'))")
        List<User> searchFriends(
                        @Param("userId") Integer userId,
                        @Param("name") String name,
                        @Param("email") String email,
                        @Param("phone") String phone);

        @Query("SELECT f FROM Friendship f WHERE " +
                        "(f.userInitiator.id = :userId AND f.userRecipient.id = :friendId) OR " +
                        "(f.userInitiator.id = :friendId AND f.userRecipient.id = :userId)")
        Optional<Friendship> findByUsers(@Param("userId") Integer userId, @Param("friendId") Integer friendId);
}