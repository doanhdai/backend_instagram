package com.example.backend_instagram.dto.user;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
public class RestUpdateUser {
    
  private long id;
  private String name;
  private String email;
  private String gender;
  private String userPhone;
  private String userImage;
  private String userGender;
  private String userBio;
  private String userBday;
  private String userNikName;
  private Instant updatedAt;
}
