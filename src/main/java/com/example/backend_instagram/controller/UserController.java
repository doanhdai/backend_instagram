package com.example.backend_instagram.controller;

import com.example.backend_instagram.domain.User;
import com.example.backend_instagram.domain.dto.ResCreateUserDTO;
import com.example.backend_instagram.service.UserService;
import com.example.backend_instagram.utils.error.IdInvalidException;

import jakarta.validation.Valid;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class UserController {

  private final UserService userService;
  private final PasswordEncoder passwordEncoder;

  public UserController(UserService userService , PasswordEncoder passwordEncoder) {
    this.userService = userService;
    this.passwordEncoder= passwordEncoder;
  }

  @GetMapping("/user/all")
  public ResponseEntity<List<User>> getUser() {
    return ResponseEntity
      .status(HttpStatus.OK)
      .body(this.userService.getAllUser());
  }

   @PostMapping("/user")
  public ResponseEntity<ResCreateUserDTO> createNewUser(
    @Valid @RequestBody User postManUser
  ) throws IdInvalidException {
    boolean isEmailExist =
      this.userService.isEmailExist(postManUser.getUserEmail());
    if (isEmailExist) {
      throw new IdInvalidException(
        "Email" +
        postManUser.getUserEmail() +
        "đã tồn tại , vui lòng sử dụng email khác"
      );
    }
    String hassPassWord =
      this.passwordEncoder.encode(postManUser.getUserPassword());
    postManUser.setUserPassword(hassPassWord);
    User listUser = this.userService.createUser(postManUser);
    return ResponseEntity
      .status(HttpStatus.CREATED)
      .body(this.userService.convertToResCreateUserDTO(listUser));
  }
}
