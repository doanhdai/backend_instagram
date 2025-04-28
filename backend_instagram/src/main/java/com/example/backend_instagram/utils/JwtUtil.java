// package com.example.backend_instagram.utils;

// import io.jsonwebtoken.Claims;
// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.security.Keys;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Component;

// import javax.crypto.SecretKey;
// import java.util.Base64;

// @Component
// public class JwtUtil {
//     @Value("${tenit.jwt.base64-secret}")
//     private String base64Secret;

//     private SecretKey getSigningKey() {
//         byte[] keyBytes = Base64.getDecoder().decode(base64Secret);
//         return Keys.hmacShaKeyFor(keyBytes);
//     }

//     public String getEmailFromToken(String token) {
//         Claims claims = Jwts.parserBuilder()
//                 .setSigningKey(getSigningKey())
//                 .build()
//                 .parseClaimsJws(token)
//                 .getBody();
//         return claims.getSubject();
//     }
// }