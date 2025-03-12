package com.example.backend_instagram.domain;


import java.time.Instant;
import java.time.LocalDateTime;
import jakarta.persistence.Column;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String userNickname;

  @Column(nullable = false)
  private String userFullname;
  private String userBday;
  private String userEmail;
  private String userPassword;
  private String userPhone;
  private String userImage;
  private String userGender;
  private String userBio;

  @Column(nullable = false)
  private boolean isOnline;

  private String socketId;
  @Column(columnDefinition = "MEDIUMTEXT")
  private String refreshToken;
  private Instant createdAt;
  private Instant updatedAt;
  private String createdBy;
  private String updatedBy;
}
