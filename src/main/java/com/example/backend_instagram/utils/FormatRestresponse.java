package com.example.backend_instagram.utils;



import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import com.example.backend_instagram.dto.user.RestResponse;
import com.example.backend_instagram.utils.constant.ApiMessage;

@RestControllerAdvice
public class FormatRestresponse implements ResponseBodyAdvice<Object> {

  @Override
  public boolean supports(
    MethodParameter returnType,
    Class<? extends HttpMessageConverter<?>> converterType
  ) {
    return true; // Bạn có thể kiểm tra loại converter ở đây nếu cần
  }

  @Override
  public Object beforeBodyWrite(
    Object body,
    MethodParameter returnType,
    MediaType selectedContentType,
    Class<? extends HttpMessageConverter<?>> selectedConverterType,
    ServerHttpRequest request,
    ServerHttpResponse response
  ) {
    HttpServletResponse servletResponse =
      ((ServletServerHttpResponse) response).getServletResponse();
    int status = servletResponse.getStatus();

    // Tạo RestResponse để đóng gói kết quả trả về
    RestResponse<Object> res = new RestResponse<>();
    res.setStatusCode(status);

    if (body instanceof String) {
      return body;
    }

    if (status >= 400) {
      // res.setError("Call API FAILED");
      // res.setMessage("An error occurred during the API call.");
      // res.setData(body);
      return body;
    } else {
      res.setData(body);
      ApiMessage message = returnType.getMethodAnnotation(ApiMessage.class);
      res.setMessage(message != null? message.value() : "CALL API SUCCESS");
    }

    return res;
  }
}
