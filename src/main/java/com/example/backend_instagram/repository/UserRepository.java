package com.example.backend_instagram.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.backend_instagram.domain.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
  User findByUserEmail(String userEmail); 
  boolean existsByUserEmail(String userEmail); 
  boolean existsByUserNickname(String userNickname );
  User findByRefreshTokenAndUserEmail(String refreshToken, String userEmail );
  
}
