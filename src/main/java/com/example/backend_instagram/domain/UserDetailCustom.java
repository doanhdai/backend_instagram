package com.example.backend_instagram.domain;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.example.backend_instagram.repository.UserRepository;

import java.util.Collections;

@Component("userDetailService")
public class UserDetailCustom implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailCustom(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.userRepository.findByUserEmail(username);
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        return new org.springframework.security.core.userdetails.User(
            user.getUserEmail(), 
            user.getUserPassword(), 
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")) 
        );
    }
}
