package com.heulwen.accountservice.service;

import com.heulwen.accountservice.api.response.UserResponse;
import com.heulwen.accountservice.api.request.AdminCreateUserRequest;
import com.heulwen.accountservice.api.request.AdminUpdateUserRequest;
import com.heulwen.accountservice.api.request.UpdateProfileRequest;
import org.springframework.data.domain.Page;

public interface UserService {
    UserResponse getUserProfile(Long userId);
    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
    void deactivateUser(Long userId);
    void activateUser(Long userId);
    Page<UserResponse> getUsers(String query, int page, int size);
    UserResponse createUser(AdminCreateUserRequest request);
    UserResponse updateUser(Long userId, AdminUpdateUserRequest request);
    void deleteUser(Long userId);
}
