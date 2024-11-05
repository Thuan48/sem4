package sem4.proj4.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sem4.proj4.config.TokenProvider;
import sem4.proj4.entity.User;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.UserRepository;
import sem4.proj4.request.LoginRequest;
import sem4.proj4.response.AuthResponse;
import sem4.proj4.service.CustomUserService;
import sem4.proj4.service.EmailService;

@RestController
@RequestMapping("/auth")
public class AuthController {

  @Autowired
  UserRepository userRepositoty;
  @Autowired
  PasswordEncoder passwordEncoder;
  @Autowired
  TokenProvider token;
  @Autowired
  CustomUserService customUserService;
  @Autowired
  EmailService emailService;

  @PostMapping("/signup")
  public ResponseEntity<AuthResponse> createUser(@RequestBody User user) throws UserException {
    String email = user.getEmail();
    String fullname = user.getFull_name();
    String password = user.getPassword();

    User isUser = userRepositoty.findByEmail(email);
    if (isUser != null) {
      throw new UserException("Email is user with another account" + email);
    }
    User create = new User();
    create.setEmail(email);
    create.setFull_name(fullname);
    create.setPassword(passwordEncoder.encode(password));
    create.setEmailConfirmed(false);

    userRepositoty.save(create);

    String subject = "Email Confirmation";
    String body = "Hello " + fullname + ",\n\n" +
        "Thank you for signing up! Please confirm your email by clicking the link :\n" +
        "Best regards,\nYour Team";
    try {
      emailService.sendConfirmationEmail(email, subject, body);
    } catch (Exception e) {
      throw new UserException("Failed to send confirmation email: " + e.getMessage());
    }

    Authentication authentication = new UsernamePasswordAuthenticationToken(email, password);
    SecurityContextHolder.getContext().setAuthentication(authentication);

    String jwt = token.generateToken(authentication);
    AuthResponse res = new AuthResponse(jwt, true);

    return new ResponseEntity<AuthResponse>(res, HttpStatus.ACCEPTED);
  }

  // @PostMapping("/confirm")
  // public ResponseEntity<String> confirmUser(@RequestParam String email,
  // @RequestParam String code) {
  // User user = userRepositoty.findByEmail(email);
  // if (user != null && user.getConfirmationCode().equals(code)) {
  // user.setEmailConfirmed(true); // Đánh dấu là đã xác nhận
  // userRepositoty.save(user); // Lưu thay đổi
  // return ResponseEntity.ok("User confirmed successfully.");
  // } else {
  // return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid
  // confirmation code.");
  // }
  // }

  @PostMapping("/signin")
  public ResponseEntity<AuthResponse> Login(@RequestBody LoginRequest req) {

    String email = req.getEmail();
    String password = req.getPassword();

    // User user = userRepositoty.findByEmail(email);
    // if (user == null) {
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new
    // AuthResponse("Invalid credentials.", false));
    // }

    // if (!passwordEncoder.matches(password, user.getPassword())) {
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new
    // AuthResponse("Invalid credentials.", false));
    // }

    // if (!user.isEmailConfirmed()) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new
    // AuthResponse("Account not confirmed.", false));
    // }

    Authentication authentication = authentication(email, password);
    SecurityContextHolder.getContext().setAuthentication(authentication);

    String jwt = token.generateToken(authentication);
    AuthResponse res = new AuthResponse(jwt, true);
    return new ResponseEntity<AuthResponse>(res, HttpStatus.ACCEPTED);
  }

  public Authentication authentication(String Username, String password) {
    UserDetails userDetails = customUserService.loadUserByUsername(Username);

    if (userDetails == null) {
      throw new BadCredentialsException(password);
    }
    if (!passwordEncoder.matches(password, userDetails.getPassword())) {
      throw new BadCredentialsException("invalid password or username");
    }
    return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
  }
}
