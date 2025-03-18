package com.example.backend_instagram.controller;

import com.example.backend_instagram.domain.User;
import com.example.backend_instagram.domain.dto.ResCreateUserDTO;
import com.example.backend_instagram.service.UserService;
import com.example.backend_instagram.utils.AwsS3Service;
import com.example.backend_instagram.utils.error.IdInvalidException;

import jakarta.validation.Valid;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

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
  private final AwsS3Service awsS3Service;
  public UserController(UserService userService , PasswordEncoder passwordEncoder , AwsS3Service awsS3Service) {
    this.userService = userService;
    this.passwordEncoder= passwordEncoder;
    this.awsS3Service = awsS3Service;
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
    boolean isEmailExist = userService.isEmailExist(postManUser.getUserEmail());
    
    if (isEmailExist) {
        throw new IdInvalidException("Email " + postManUser.getUserEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
    }

    String hashedPassword = passwordEncoder.encode(postManUser.getUserPassword());
    postManUser.setUserPassword(hashedPassword);
    if (postManUser.getUserImage() != null && !postManUser.getUserImage().isEmpty()) {
    String base64Image = postManUser.getUserImage();
    if (base64Image.contains(",")) {
        base64Image = base64Image.split(",")[1];
    }

    try {
        byte[] imageBytes = Base64.getDecoder().decode(base64Image); 
        String fileName = "avatars/" + UUID.randomUUID() + ".png"; 
        String imageUrl = awsS3Service.uploadFile(fileName, imageBytes); 
        postManUser.setUserImage(imageUrl);
    } catch (IllegalArgumentException e) {
        System.err.println("Lỗi giải mã Base64: " + e.getMessage());
    }
}


    // Lưu user vào database
    User newUser = userService.createUser(postManUser);

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(userService.convertToResCreateUserDTO(newUser));
}

}
