package sem4.proj4.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.*;

import sem4.proj4.entity.User;
import sem4.proj4.repository.UserRepository;

@Service
public class CustomUserService implements UserDetailsService {

  @Autowired
  UserRepository userRepositoty;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = userRepositoty.findByEmail(username);
    if (user == null) {
      throw new UsernameNotFoundException("User not fount with Username:" + username);
    }
    List<GrantedAuthority> authorities = new ArrayList<>();
    return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);
  }

}
