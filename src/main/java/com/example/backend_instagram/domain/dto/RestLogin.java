package com.example.backend_instagram.domain.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public  class RestLogin {

  private String accessToken;
  private UserLogin user;

  @Getter
  @Setter
  @AllArgsConstructor
  @NoArgsConstructor
  public static class UserLogin {

    private Long id;
    private String email;
    private String name;
    private String avatar;
    private String nikName;
  }
  @Getter
  @Setter
  @AllArgsConstructor
  @NoArgsConstructor
  public static class UserGetAccout {

    private UserLogin user;
  }


}
