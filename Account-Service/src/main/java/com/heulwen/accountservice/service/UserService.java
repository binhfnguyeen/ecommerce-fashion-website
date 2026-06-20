package com.heulwen.accountservice.service;

import com.heulwen.accountservice.api.response.UserResponse;

public interface UserService {
    UserResponse getUserProfile(Long userId);
    void deactivateUser(Long userId);
    void activateUser(Long userId);
}
