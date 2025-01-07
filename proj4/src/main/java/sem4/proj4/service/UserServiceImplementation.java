package sem4.proj4.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import sem4.proj4.config.TokenProvider;
import sem4.proj4.entity.User;
import sem4.proj4.entity.VerificationCode;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.UserRepository;
import sem4.proj4.repository.VerificationCodeRepository;
import sem4.proj4.request.ChangePasswordRequest;
import sem4.proj4.request.UpdateProfileRequest;
import sem4.proj4.request.UpdateUserRequest;

@Service
public class UserServiceImplementation implements UserService {

  @Autowired
  private UserRepository userRepo;
  @Autowired
  private TokenProvider token;
  @Autowired
  private VerificationCodeRepository codeRepo;
  @Autowired
  private EmailService emailService;
  @Autowired
  PasswordEncoder passwordEncoder;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @Value("${config-upload-dir}")
  private String uploadDir;

  @Override
  public User findUserById(Integer userId) throws UserException {
    Optional<User> user = userRepo.findById(userId);
    if (user.isPresent()) {
      return user.get();
    } else {
      throw new UserException("User not found With id:" + userId);
    }

  }

  @Override
  public User findUserProfile(String jwt) throws UserException {
    String email = token.getEmailFromToken(jwt);
    if (email == null) {
      throw new BadCredentialsException("recived invalid token");
    }
    User user = userRepo.findByEmail(email);
    if (user == null) {
      throw new UserException("User not found With email:" + email);
    }
    return user;
  }

  @Override
  public User updateUser(Integer userId, UpdateUserRequest req) throws UserException {
    User user = findUserById(userId);

    if (req.getFull_name() != null) {
      user.setFull_name(req.getFull_name());
    }

    if (req.getProfile_picture() != null && !req.getProfile_picture().isEmpty()) {
      try {
        Path path = Paths.get(uploadDir + "/profile");
        if (!Files.exists(path)) {
          Files.createDirectories(path);
        }

        String filename = req.getProfile_picture().getOriginalFilename();
        Path filePath = path.resolve(filename);
        Files.copy(req.getProfile_picture().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        user.setProfile_picture(filename);
      } catch (Exception e) {
        e.printStackTrace();
        throw new UserException("Error while uploading image: " + e.getMessage());
      }
    }

    User updatedUser = userRepo.save(user);

    messagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/userUpdates", updatedUser);

    return updatedUser;
  }

  @Override
  public List<User> searchUser(String query) {
    List<User> users = userRepo.searchUser(query);
    return users;
  }

  @Override
  public User save(User user) {
    return userRepo.save(user);
  }

  @Override
  public List<User> findAll() {
    return userRepo.findAll();
  }

  @Override
  public User updateProfile(Integer userId, UpdateProfileRequest req) throws UserException {
    User user = findUserById(userId);

    if (req.getBio() != null && !req.getBio().isEmpty()) {
      user.setBio(req.getBio());
    }
    if (req.getGender() != null && !req.getGender().isEmpty()) {
      user.setGender(req.getGender());
    }
    if (req.getPhone() != null && !req.getPhone().isEmpty()) {
      user.setPhone(req.getPhone());
    }
    if (req.getDob() != null) {
      user.setDob(req.getDob());
    }
    if (req.getAddress() != null && !req.getAddress().isEmpty()) {
      user.setAddress(req.getAddress());
    }

    User updatedUser = userRepo.save(user);

    messagingTemplate.convertAndSend("/topic/userUpdates", updatedUser);

    return updatedUser;
  }

  @Override
  public void initiatePasswordReset(String email) throws UserException {
    User user = userRepo.findByEmail(email);
    if (user == null) {
      throw new UserException("User not found with email: " + email);
    }

    String code = String.valueOf(100000 + new Random().nextInt(900000));
    VerificationCode verificationCode = codeRepo.findByUser_Email(email);
    if (verificationCode != null) {
      verificationCode.setCode(code);
      verificationCode.setExpiryTime(LocalDateTime.now().plusMinutes(1));
    } else {
      verificationCode = new VerificationCode(null, user, code, LocalDateTime.now().plusMinutes(1));
    }
    codeRepo.save(verificationCode);

    sendVerificationEmail(email, code);
  }

  private void sendVerificationEmail(String to, String code) {
    String subject = "Password Reset Verification Code";
    String body = "Your password reset code is: " + code + "\nThis code is valid for 1 minute.";
    try {
      emailService.sendConfirmationEmail(to, subject, body);
    } catch (MessagingException e) {
      e.printStackTrace();
      throw new RuntimeException("Failed to send verification email", e);
    }
  }

  @Override
  public void resetPassword(String email, String code, String newPassword) throws UserException {
    VerificationCode verificationCode = codeRepo.findByUser_Email(email);
    if (verificationCode == null) {
      throw new UserException("No verification code found for this email.");
    }

    if (!verificationCode.getCode().equals(code)) {
      throw new UserException("Invalid verification code.");
    }

    if (verificationCode.getExpiryTime().isBefore(LocalDateTime.now())) {
      throw new UserException("Verification code has expired.");
    }

    User user = userRepo.findByEmail(email);
    if (user == null) {
      throw new UserException("User not found with email: " + email);
    }

    user.setPassword(passwordEncoder.encode(newPassword));
    userRepo.save(user);

    codeRepo.delete(verificationCode);
  }

  @Override
  public void changePassword(Integer userId, ChangePasswordRequest request) throws UserException {
    Optional<User> optionalUser = userRepo.findById(userId);
    if (!optionalUser.isPresent()) {
      throw new UserException("User not found with ID: " + userId);
    }

    User user = optionalUser.get();

    if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
      throw new UserException("Old password is incorrect.");
    }

    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepo.save(user);
  }
}
