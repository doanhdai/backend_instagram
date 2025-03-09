package com.example.backend_instagram.domain.dto;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResCreateUserDTO {

  private long id;
  private String name;
  private String email;
  private String gender;
  private String userPhone;
  private String userImage;
  private String userGender;
  private String userBio;
  private String userBday;

  private Instant createdAt;
}
