package com.heulwen.productservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception.", HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_NOT_FOUND(2001, "Category does not exist.", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND(2002, "Product does not exist.", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_EXISTED(2003, "Category name already exists.", HttpStatus.BAD_REQUEST),
    CATEGORY_HAS_PRODUCTS(2004, "Cannot delete category as it contains active products.", HttpStatus.BAD_REQUEST),
    PRODUCT_HAS_ORDERS(2005, "Cannot delete product as it has order history.", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK(2006, "Product stock is insufficient.", HttpStatus.BAD_REQUEST),
    PRODUCT_INACTIVE(2007, "Product is inactive.", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1007, "You do not have permission.", HttpStatus.FORBIDDEN),
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
