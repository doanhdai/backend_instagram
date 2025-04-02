package com.example.backend_instagram.service;

import com.example.backend_instagram.dto.user.ResCreateUserDTO;
import com.example.backend_instagram.dto.user.RestUpdateUser;
import com.example.backend_instagram.entity.User;
import com.example.backend_instagram.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public User createUser(User user) {
    return this.userRepository.save(user);
  }

  public User handleGetUserByUserNawm(String username) {
    return this.userRepository.findByUserEmail(username);
  }

  public List<User> getAllUser() {
    return this.userRepository.findAll();
  }

  public boolean isEmailExist(String email) {
    return this.userRepository.existsByUserEmail(email);
  }

  public boolean isNikNameExsit(String nikname) {
    return this.userRepository.existsByUserNickname(nikname);
  }

  public void updateUserToken(String token, String email) {
    User currentUser = this.handleGetUserByUserNawm(email);
    if (currentUser != null) {
      currentUser.setRefreshToken(token);
      this.userRepository.save(currentUser);
    }
  }

  public User fetchUserById(Long id) {
    Optional<User> userOptional = this.userRepository.findById(id);
    if (userOptional.isPresent()) {
      return userOptional.get();
    }
    return null;
  }

  public User handleUpdateUser(User user) {
    User userUPdate = this.fetchUserById(user.getId());

    if (userUPdate != null) {
      userUPdate.setUserNickname(user.getUserNickname());
      userUPdate.setUserBio(user.getUserBio());
      userUPdate.setUserPhone(user.getUserPhone());
      userUPdate.setUserImage(user.getUserImage());
    }
    return this.userRepository.save(userUPdate);
  }

  public ResCreateUserDTO convertToResCreateUserDTO(User user) {
    ResCreateUserDTO resCreateUserDTO = new ResCreateUserDTO();
    resCreateUserDTO.setId(user.getId());
    resCreateUserDTO.setName(user.getUserFullname());
    resCreateUserDTO.setUserNikName(user.getUserNickname());
    resCreateUserDTO.setEmail(user.getUserEmail());
    resCreateUserDTO.setUserBio(user.getUserBio());
    resCreateUserDTO.setUserBday(user.getUserBday());
    resCreateUserDTO.setCreatedAt(user.getCreatedAt());
    resCreateUserDTO.setGender(user.getUserGender());
    return resCreateUserDTO;
  }

  public RestUpdateUser convertToResUpdateUpdateUserDTO(User user) {
    RestUpdateUser restUpdateUser = new RestUpdateUser();
    restUpdateUser.setId(user.getId());
    restUpdateUser.setName(user.getUserFullname());
    restUpdateUser.setEmail(user.getUserEmail());
    restUpdateUser.setUserBday(user.getUserBday());
    restUpdateUser.setUserGender(user.getUserGender());
    restUpdateUser.setUserImage(user.getUserImage());
    restUpdateUser.setUserNikName(user.getUserNickname());
    restUpdateUser.setUserPhone(user.getUserPhone());

    return restUpdateUser;
  }

  public User getUserByRefreshTokenAndUserEmail(String token, String email) {
    return this.userRepository.findByRefreshTokenAndUserEmail(token, email);
  }

  public boolean deleteUser(String userId) {
    try {
      this.userRepository.deleteById(Long.parseLong(userId));
      return true;
    } catch (Exception e) {
      return false;
    }
  }

}
