package com.featureforge.backend.exception;

import com.featureforge.backend.dto.response.ErrorDetails;
import com.featureforge.backend.dto.response.ValidationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorDetails> handleUserAlreadyExistException(UserAlreadyExistsException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorDetails);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDetails> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {

        List<ValidationResponse> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fieldError -> new ValidationResponse(
                        fieldError.getField(),
                        fieldError.getDefaultMessage()
                ))
                .toList();

        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message("Validation failed")
                .errors(errors)
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorDetails);
    }


}
