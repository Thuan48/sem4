package sem4.proj4.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import sem4.proj4.entity.User;
import sem4.proj4.exception.UserException;
import sem4.proj4.request.UpdateProfileRequest;
import sem4.proj4.request.UpdateUserRequest;
import sem4.proj4.response.ApiResponse;
import sem4.proj4.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

  @Autowired
  UserService userService;

  @GetMapping("/profile")
  public ResponseEntity<User> getUserProfile(@RequestHeader("Authorization") String token) throws UserException {
    User user = userService.findUserProfile(token);
    return new ResponseEntity<User>(user, HttpStatus.OK);
  }

  @GetMapping("/search")
  public ResponseEntity<List<User>> searchUserHandler(@RequestParam("name") String name) {
    List<User> users = userService.searchUser(name);
    return new ResponseEntity<List<User>>(users, HttpStatus.OK);
  }

  @PutMapping("/update")
  public ResponseEntity<ApiResponse> updateUserHandler(@ModelAttribute UpdateUserRequest req,
      @RequestHeader("Authorization") String token) throws UserException {
    User user = userService.findUserProfile(token);
    userService.updateUser(user.getId(), req);

    ApiResponse response = new ApiResponse("user update success", true);
    return new ResponseEntity<ApiResponse>(response, HttpStatus.OK);
  }

  @PutMapping("/updateProfile")
  public ResponseEntity<ApiResponse> updateProfileHandler(@ModelAttribute UpdateProfileRequest req,
      @RequestHeader("Authorization") String token) throws UserException {
    User user = userService.findUserProfile(token);
    userService.updateProfile(user.getId(), req);

    //simpMessagingTemplate.convertAndSend("/topic/profile", updatedUser);
    ApiResponse response = new ApiResponse("profile update success", true);
    return new ResponseEntity<ApiResponse>(response, HttpStatus.OK);
  }
  @GetMapping("/profileUser/{id}")
  public ResponseEntity<User> getUserProfileById(@PathVariable("id") int id) throws UserException {
    User user = userService.findUserById(id);
    return new ResponseEntity<User>(user, HttpStatus.OK);
  }
  
}
