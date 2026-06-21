package com.heulwen.accountservice.service;

import com.heulwen.accountservice.api.response.UserResponse;
import com.heulwen.accountservice.api.request.AdminCreateUserRequest;
import com.heulwen.accountservice.api.request.AdminUpdateUserRequest;
import org.springframework.data.domain.Page;

public interface UserService {
    UserResponse getUserProfile(Long userId);
    void deactivateUser(Long userId);
    void activateUser(Long userId);
    Page<UserResponse> getUsers(String query, int page, int size);
    UserResponse createUser(AdminCreateUserRequest request);
    UserResponse updateUser(Long userId, AdminUpdateUserRequest request);
    void deleteUser(Long userId);
}
