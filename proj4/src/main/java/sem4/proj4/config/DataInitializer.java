package sem4.proj4.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.github.javafaker.Faker;

import sem4.proj4.entity.Blog;
import sem4.proj4.entity.User;
import sem4.proj4.service.FriendService;
import sem4.proj4.repository.BlogRepository;
import sem4.proj4.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

@Configuration
public class DataInitializer implements CommandLineRunner {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private FriendService friendService;

  @Autowired
  private BlogRepository blogRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  private Faker faker = new Faker(new Locale("en US"));

  @Override
  public void run(String... args) throws Exception {
    // for (int i = 1; i <= 100; i++) {
    //   User user = new User();
    //   user.setFull_name(faker.name().fullName());
    //   user.setEmail(faker.internet().emailAddress());
    //   user.setProfile_picture(null);
    //   user.setAddress(faker.address().fullAddress());
    //   user.setGender(faker.options().option("Male", "Female", "Other"));
    //   user.setPhone(faker.phoneNumber().phoneNumber());
    //   user.setDob(faker.date().birthday().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate());
    //   user.setBio(faker.lorem().sentence());
    //   user.setPassword(passwordEncoder.encode("123"));
    //   user.setEmailConfirmed(true);
    //   userRepository.save(user);
    // }

    // int targetUserId = 5;
    // for (int i = 1; i <= 100; i++) {
    //   int initiatorId = i;
    //   int recipientId = targetUserId;
    //   if (initiatorId != recipientId) {
    //     try {
    //       friendService.addFriend(initiatorId, recipientId);
    //       System.out.println("User " + initiatorId + " đã gửi lời kết bạn tới User " + recipientId);
    //     } catch (Exception e) {
    //       System.err.println("Error gửi lời kết bạn từ User " + initiatorId + ": " + e.getMessage());
    //     }
    //   }
    // }

// for (int j = 1; j <= 100; j++) {
//             final int userId = j;
//             User user = userRepository.findById(userId)
//                     .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

//             Blog blog = new Blog();
//             blog.setTitle(faker.book().title());
//             blog.setContent(faker.lorem().paragraph(5)); 
//             blog.setCreateTime(LocalDateTime.now());
//             blog.setUpdateTime(LocalDateTime.now());
//             blog.setUser(user);
//             blog.setImage(null); 

//             blogRepository.save(blog);

//             System.out.println("Created Blog ID: " + blog.getId() + " for User ID: " + user.getId());
//         }
// }
}
}