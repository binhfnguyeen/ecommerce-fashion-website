package com.heulwen.mediaservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception.", HttpStatus.INTERNAL_SERVER_ERROR),
    EMPTY_FILE(4001, "Uploaded file is empty.", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(4002, "Uploaded file exceeds the maximum allowed size (5MB).", HttpStatus.BAD_REQUEST),
    INVALID_FILE_FORMAT(4003, "Invalid file format. Allowed types: JPG, JPEG, PNG, WEBP.", HttpStatus.BAD_REQUEST),
    UPLOAD_FAILED(4004, "Failed to upload file.", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED(1007, "You do not have permission.", HttpStatus.FORBIDDEN);

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
