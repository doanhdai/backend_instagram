package com.example.backend_instagram.controller;

import com.example.backend_instagram.domain.User;
import com.example.backend_instagram.domain.dto.LoginDTO;
import com.example.backend_instagram.domain.dto.RestLogin;
import com.example.backend_instagram.service.UserService;
import com.example.backend_instagram.utils.SecurityUntil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

  private final AuthenticationManagerBuilder authenticationManagerBuilder;
  private final SecurityUntil securityUntil;
  private final UserService userService;

  public AuthController(
    AuthenticationManagerBuilder authenticationManagerBuilder,
    SecurityUntil securityUntil,
    UserService userService
  ) {
    this.authenticationManagerBuilder = authenticationManagerBuilder;
    this.securityUntil = securityUntil;
    this.userService = userService;
  }

  @PostMapping("/auth/login")
  public ResponseEntity<RestLogin> login(
    @Valid @RequestBody LoginDTO loginDTO
  ) {
    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
      loginDTO.getUsername(),
      loginDTO.getPassword()
    );
    Authentication authentication = authenticationManagerBuilder
      .getObject()
      .authenticate(authenticationToken);
   
    SecurityContextHolder.getContext().setAuthentication(authentication);
    RestLogin restLogin = new RestLogin();
    User currentuserDb =
      this.userService.handleGetUserByUserNawm(loginDTO.getUsername());
    if (currentuserDb != null) {
      RestLogin.UserLogin userLogin = new RestLogin.UserLogin(
        currentuserDb.getId(),
        currentuserDb.getUserEmail(),
        currentuserDb.getUserFullname()
      );
      restLogin.setUser(userLogin);
    }

    String accsess_token =
      this.securityUntil.createToken(authentication, restLogin.getUser());

    restLogin.setAccessToken(accsess_token);

    //create refesh- token
    String refresh_token =
      this.securityUntil.refreshToken(loginDTO.getUsername(), restLogin);

    //updateUserupdateUser
    this.userService.updateUserToken(refresh_token, loginDTO.getUsername());

    //set cooke

    ResponseCookie responseCookie = ResponseCookie
      .from("refresh_token", refresh_token)
      .httpOnly(true)
      .secure(true)
      .path("/")
      .maxAge(60)
      .build();
    return ResponseEntity
      .ok()
      .header(
        org.springframework.http.HttpHeaders.SET_COOKIE,
        responseCookie.toString()
      )
      .body(restLogin);
  }
}
