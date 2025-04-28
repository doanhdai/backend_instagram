package com.example.backend_instagram;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // Thêm annotation này để Spring Boot nhận diện Controller
public class Hello {

 @GetMapping("/test")
    public String test() {
        System.out.println("Controller đã chạy lại!");
        return "Xin chào sửa đổi 1233 ";
    }
}
