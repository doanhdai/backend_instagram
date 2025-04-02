package com.example.backend_instagram.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class RegisterDTO {
    
    @NotBlank(message = "Email is required")
    private String email;
    private String fullName;
    @NotBlank(message = "Password is required")
    private String password;
    private String userName;
    
}
