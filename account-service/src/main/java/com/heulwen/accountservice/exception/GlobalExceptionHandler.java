package com.heulwen.accountservice.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> handleAppException(AppException ex) {
        ErrorCode code = ex.getErrorCode();

        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("code", code.getErrorCode());
        errorBody.put("message", code.getMessage());
        errorBody.put("timestamp", ZonedDateTime.now());

        return ResponseEntity
                .status(code.getStatusCode())
                .body(errorBody);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("code", 400);
        errorBody.put("message", ex.getMessage());
        errorBody.put("timestamp", ZonedDateTime.now());

        return ResponseEntity
                .badRequest()
                .body(errorBody);
    }
}
