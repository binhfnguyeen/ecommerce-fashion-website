package com.heulwen.accountservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception.", HttpStatus.INTERNAL_SERVER_ERROR),
    KEY_INVALID(1001, "Invalid message key.", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "Username already exists.", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least 3 characters.", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1004, "Password must be at least 8 characters.", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User does not exist.", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated.", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission.", HttpStatus.FORBIDDEN),
    INVALID_OTP(1016, "Invalid OTP.", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(1017, "OTP has expired.", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1008, "Email already exists.", HttpStatus.BAD_REQUEST),
    USER_DEACTIVATED(1009, "User account is deactivated.", HttpStatus.FORBIDDEN),
    INVALID_TOKEN(1010, "Refresh token is invalid or expired.", HttpStatus.UNAUTHORIZED),
    OTP_NOT_VERIFIED(1018, "OTP has not been verified yet.", HttpStatus.BAD_REQUEST),
    ;

    private final int errorCode;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int errorCode, String message, HttpStatusCode statusCode) {
        this.errorCode = errorCode;
        this.message = message;
        this.statusCode = statusCode;
    }

    public int getErrorCode() {
        return errorCode;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}
