package com.example.ktbapi.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "로그인 요청")
public class LoginRequest {

    @Email(message = "invalid email format")
    @NotBlank(message = "email is required")
    public String email;

    @NotBlank(message = "password is required")
    public String password;

    @Schema(description = "로그인 유지 여부", example = "false")
    public boolean remember_me;
}
