package sem4.proj4.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;

import sem4.proj4.entity.VerificationCode;
import sem4.proj4.repository.VerificationCodeRepository;

public class VerificationCodeCleanupService {
  @Autowired
    private VerificationCodeRepository codeRepo;

    @Scheduled(fixedRate = 60000)
    public void deleteExpiredVerificationCodes() {
        List<VerificationCode> expiredCodes = codeRepo.findByExpiryTimeBefore(LocalDateTime.now());
        if (!expiredCodes.isEmpty()) {
            codeRepo.deleteAll(expiredCodes);
        }
    }
}
