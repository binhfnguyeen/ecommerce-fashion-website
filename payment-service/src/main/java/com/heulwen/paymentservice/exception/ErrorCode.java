package com.heulwen.paymentservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception.", HttpStatus.INTERNAL_SERVER_ERROR),
    ORDER_NOT_FOUND(3001, "Order does not exist.", HttpStatus.NOT_FOUND),
    INVALID_ORDER_STATUS(3002, "Invalid order status workflow transition.", HttpStatus.BAD_REQUEST),
    PAYPAL_CREATION_FAILED(3003, "Failed to create PayPal checkout order.", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYPAL_CAPTURE_FAILED(3004, "Failed to capture PayPal payment.", HttpStatus.BAD_REQUEST),
    PRODUCT_INACTIVE_OR_OUT_OF_STOCK(3005, "One or more products are inactive or out of stock.", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(3006, "Product does not exist.", HttpStatus.NOT_FOUND),
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
