package com.heulwen.accountservice.service.impl;

import com.heulwen.accountservice.api.response.UserResponse;
import com.heulwen.accountservice.domain.models.User;
import com.heulwen.accountservice.exception.AppException;
import com.heulwen.accountservice.exception.ErrorCode;
import com.heulwen.accountservice.mapper.UserMapper;
import com.heulwen.accountservice.repository.UserRepository;
import com.heulwen.accountservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toResponse(user);
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
}
