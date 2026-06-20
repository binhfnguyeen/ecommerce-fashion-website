package com.heulwen.accountservice.mapper;

import com.heulwen.accountservice.api.response.UserResponse;
import com.heulwen.accountservice.domain.models.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getActive()
        );
    }

    public List<UserResponse> toResponseList(List<User> users) {
        if (users == null) {
            return Collections.emptyList();
        }
        return users.stream().map(this::toResponse).toList();
    }
}
