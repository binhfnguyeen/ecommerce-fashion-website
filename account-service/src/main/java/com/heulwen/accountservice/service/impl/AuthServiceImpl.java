package com.heulwen.accountservice.service.impl;

import com.heulwen.accountservice.api.request.*;
import com.heulwen.accountservice.api.response.TokenResponse;
import com.heulwen.accountservice.api.response.UserResponse;
import com.heulwen.accountservice.domain.enums.UserRole;
import com.heulwen.accountservice.domain.models.PasswordReset;
import com.heulwen.accountservice.domain.models.RefreshToken;
import com.heulwen.accountservice.domain.models.User;
import com.heulwen.accountservice.exception.AppException;
import com.heulwen.accountservice.exception.ErrorCode;
import com.heulwen.accountservice.mapper.UserMapper;
import com.heulwen.accountservice.repository.PasswordResetRepository;
import com.heulwen.accountservice.repository.RefreshTokenRepository;
import com.heulwen.accountservice.repository.UserRepository;
import com.heulwen.accountservice.service.AuthService;
import com.heulwen.accountservice.service.MailService;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final MailService mailService;

    @Value("${spring.jwt.signerkey}")
    private String signerKey;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
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
                UserRole.USER // Default role is USER
        );

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (!user.getActive()) {
            throw new AppException(ErrorCode.USER_DEACTIVATED);
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Generate Access Token and Refresh Token
        String accessToken = generateAccessToken(user);
        String refreshTokenString = UUID.randomUUID().toString();

        // Save Refresh Token
        RefreshToken refreshToken = RefreshToken.create(
                user,
                refreshTokenString,
                OffsetDateTime.now().plusDays(7)
        );
        refreshTokenRepository.save(refreshToken);

        return new TokenResponse(
                accessToken,
                refreshTokenString,
                "Bearer",
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    @Override
    @Transactional
    public TokenResponse refresh(TokenRefreshRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (!token.isValid()) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        User user = token.getUser();
        if (!user.getActive()) {
            throw new AppException(ErrorCode.USER_DEACTIVATED);
        }

        // Generate a new Access Token
        String newAccessToken = generateAccessToken(user);

        return new TokenResponse(
                newAccessToken,
                token.getToken(),
                "Bearer",
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Generate 6-digit numeric OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        String hashedOtp = passwordEncoder.encode(otp);

        // Send OTP via email
        mailService.sendOtpToMail(user.getEmail(), otp);

        // Save OTP (valid for 5 minutes)
        PasswordReset passwordReset = PasswordReset.request(
                user.getEmail(),
                hashedOtp,
                OffsetDateTime.now().plusMinutes(5)
        );
        passwordResetRepository.save(passwordReset);
    }

    @Override
    @Transactional
    public boolean verifyOtp(VerifyOtpRequest request) {
        PasswordReset passwordReset = passwordResetRepository.findFirstByEmailOrderByCreatedAtDesc(request.email())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        boolean verified = passwordReset.verify(request.otpCode(), passwordEncoder::matches);
        passwordResetRepository.save(passwordReset);
        return verified;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordReset passwordReset = passwordResetRepository.findFirstByEmailOrderByCreatedAtDesc(request.email())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        if (!passwordReset.getIsVerified()) {
            throw new AppException(ErrorCode.OTP_NOT_VERIFIED);
        }
        if (passwordReset.isExpired()) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String hashedNewPassword = passwordEncoder.encode(request.newPassword());
        user.changePassword(hashedNewPassword);
        userRepository.save(user);

        passwordResetRepository.delete(passwordReset);
    }

    private String generateAccessToken(User user) {
        try {
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getUsername())
                    .issuer("account-service")
                    .issueTime(new Date())
                    .expirationTime(new Date(System.currentTimeMillis() + 3600000))
                    .claim("userId", user.getId())
                    .claim("email", user.getEmail())
                    .claim("role", user.getRole().name())
                    .build();

            SignedJWT signedJWT = new SignedJWT(header, claimsSet);
            JWSSigner signer = new MACSigner(signerKey.getBytes());
            signedJWT.sign(signer);

            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Error generating access token", e);
        }
    }
}
