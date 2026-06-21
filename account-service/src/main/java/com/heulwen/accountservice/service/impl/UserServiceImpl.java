package com.heulwen.accountservice.service.impl;

import com.heulwen.accountservice.api.request.AdminCreateUserRequest;
import com.heulwen.accountservice.api.request.AdminUpdateUserRequest;
import com.heulwen.accountservice.api.response.UserResponse;
import com.heulwen.accountservice.domain.models.User;
import com.heulwen.accountservice.exception.AppException;
import com.heulwen.accountservice.exception.ErrorCode;
import com.heulwen.accountservice.mapper.UserMapper;
import com.heulwen.accountservice.repository.UserRepository;
import com.heulwen.accountservice.service.UserService;
import lombok.RequiredArgsConstructor;
import com.heulwen.accountservice.api.request.UpdateProfileRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Update email if changed (check uniqueness)
        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }
        }

        // Change password if requested
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            user.changePassword(passwordEncoder.encode(request.newPassword()));
        }

        // Update fullName and email
        user.updateByAdmin(
                request.fullName() != null ? request.fullName() : user.getFullName(),
                user.getRole(),
                request.email() != null ? request.email() : user.getEmail()
        );

        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.deactivate();
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.activate();
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<User> users;
        if (query != null && !query.trim().isEmpty()) {
            users = userRepository.searchUsers(query.trim(), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(userMapper::toResponse);
    }

    @Override
    @Transactional
    public UserResponse createUser(AdminCreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        User user = User.register(
                request.username(),
                hashedPassword,
                request.email(),
                request.fullName(),
                request.role()
        );

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, AdminUpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }
        }

        user.updateByAdmin(request.fullName(), request.role(), request.email());
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userRepository.delete(user);
    }
}
