package com.example.backend_instagram.dto.user;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class AnswerData {

  private String to; // ID của người gọi ban đầu
  private JsonNode signal;
}
