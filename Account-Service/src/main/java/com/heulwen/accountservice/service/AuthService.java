package com.heulwen.accountservice.service;

import com.heulwen.accountservice.api.request.*;
import com.heulwen.accountservice.api.response.TokenResponse;
import com.heulwen.accountservice.api.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    TokenResponse login(LoginRequest request);
    TokenResponse refresh(TokenRefreshRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    boolean verifyOtp(VerifyOtpRequest request);
    void resetPassword(ResetPasswordRequest request);
}
