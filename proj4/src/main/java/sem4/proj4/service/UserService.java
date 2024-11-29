package sem4.proj4.service;

import java.util.List;

import sem4.proj4.entity.User;
import sem4.proj4.exception.UserException;
import sem4.proj4.request.UpdateProfileRequest;
import sem4.proj4.request.UpdateUserRequest;

public interface UserService {

  public User findUserById(Integer userId) throws UserException;

  public User findUserProfile(String jwt) throws UserException;

  public User updateUser(Integer userId, UpdateUserRequest req) throws UserException;

  public List<User> searchUser(String query);

  public User save(User user);

  public List<User> findAll();

  public User updateProfile(Integer userId, UpdateProfileRequest req) throws UserException;
}
