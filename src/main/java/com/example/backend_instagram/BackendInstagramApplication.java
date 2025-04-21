package com.example.backend_instagram;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendInstagramApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendInstagramApplication.class, args);
	}

}
