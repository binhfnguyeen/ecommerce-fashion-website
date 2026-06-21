package com.heulwen.aiservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception.", HttpStatus.INTERNAL_SERVER_ERROR),
    GEMINI_API_ERROR(5001, "Google Gemini API error.", HttpStatus.INTERNAL_SERVER_ERROR),
    PRODUCT_SERVICE_ERROR(5002, "Error fetching products for context.", HttpStatus.INTERNAL_SERVER_ERROR),
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
