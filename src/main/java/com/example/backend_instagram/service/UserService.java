package com.example.backend_instagram.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend_instagram.domain.User;
import com.example.backend_instagram.domain.dto.ResCreateUserDTO;
import com.example.backend_instagram.repository.UserRepository;
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

  public List<User> getAllUser () {
    return  this.userRepository.findAll();
  }

   public boolean isEmailExist(String email) {
    return this.userRepository.existsByUserEmail(email);
  }
  public void updateUserToken(String token, String email) {
    User currentUser = this.handleGetUserByUserNawm(email);
    if (currentUser != null) {
      currentUser.setRefreshToken(token);
      this.userRepository.save(currentUser);
    }
  }
  public ResCreateUserDTO convertToResCreateUserDTO(User user) {
    ResCreateUserDTO resCreateUserDTO = new ResCreateUserDTO();

    resCreateUserDTO.setId(user.getId());
    resCreateUserDTO.setName(user.getUserFullname());
    resCreateUserDTO.setEmail(user.getUserEmail());
    resCreateUserDTO.setUserBio(user.getUserBio());
    resCreateUserDTO.setUserBday(user.getUserBday());
    resCreateUserDTO.setCreatedAt(user.getCreatedAt());
    resCreateUserDTO.setGender(user.getUserGender());

    return resCreateUserDTO;
  }

}
