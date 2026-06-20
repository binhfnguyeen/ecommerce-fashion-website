package com.heulwen.mediaservice.exception;

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
}
