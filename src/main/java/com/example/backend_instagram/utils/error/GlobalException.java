package com.example.backend_instagram.utils.error;


import jakarta.persistence.NoResultException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend_instagram.domain.dto.RestResponse;

@RestControllerAdvice
public class GlobalException {

  @ExceptionHandler(
    value = {
      UsernameNotFoundException.class,
      BadCredentialsException.class,
      IdInvalidException.class,
    }
  )
  public ResponseEntity<RestResponse<Object>> handleIdException(Exception e) {
    RestResponse<Object> res = new RestResponse<>();
    res.setStatusCode(HttpStatus.BAD_REQUEST.value());
    res.setError(e.getMessage());
    res.setMessage("An error occurred during the API call.");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
  }

  @ExceptionHandler(value = { NoResultException.class })
  public ResponseEntity<RestResponse<Object>> handleNotFoundException(
    Exception ex
  ) {
    RestResponse<Object> res = new RestResponse<>();
    res.setStatusCode(HttpStatus.NOT_FOUND.value());
    res.setError(ex.getMessage());
    res.setMessage("404 Not Found. URL may not exist...");

    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<RestResponse<Object>> validationError(
    MethodArgumentNotValidException e
  ) {
    BindingResult result = e.getBindingResult();
    List<FieldError> fieldErrors = result.getFieldErrors();

    RestResponse<Object> res = new RestResponse<>();
    res.setStatusCode(HttpStatus.BAD_REQUEST.value());
    res.setError("Validation failed");

    // Lấy danh sách thông báo lỗi
    List<String> errors = fieldErrors
      .stream()
      .map(FieldError::getDefaultMessage)
      .toList();

    // Gán thông báo lỗi vào response
    if (!errors.isEmpty()) {
      res.setMessage(errors.size() > 1 ? errors.toString() : errors.get(0));
    } else {
      res.setMessage("Invalid request");
    }

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
  }
}
