package sem4.proj4.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import sem4.proj4.entity.VerificationCode;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
  VerificationCode findByUser_Email(String email);
    VerificationCode findByUser_Id(Integer userId);
    List<VerificationCode> findByExpiryTimeBefore(LocalDateTime time);
}
