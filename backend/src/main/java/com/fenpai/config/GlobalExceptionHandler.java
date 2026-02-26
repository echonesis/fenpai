package com.fenpai.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Bad request";
        String lower = msg.toLowerCase();
        int status = lower.contains("not found") ? 404
                   : lower.contains("already") ? 409
                   : 400;
        return ResponseEntity.status(status).body(Map.of("message", msg));
    }
}
