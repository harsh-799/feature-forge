package com.featureforge.backend.exception;

import com.featureforge.backend.dto.response.ErrorDetails;
import com.featureforge.backend.dto.response.ValidationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import java.util.List;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.exc.InvalidFormatException;
import tools.jackson.databind.DatabindException;

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

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorDetails> handleBadCredentialsException(BadCredentialsException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message("Invalid credentials")
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDetails> handleAccessDeniedException(AccessDeniedException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(InsufficientPrivilegesException.class)
    public ResponseEntity<ErrorDetails> handleInsufficientPrivilegesException(InsufficientPrivilegesException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(UserAlreadyMemberException.class)
    public ResponseEntity<ErrorDetails> handleUserAlreadyMemberException(UserAlreadyMemberException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(PendingInvitationAlreadyExistsException.class)
    public ResponseEntity<ErrorDetails> handlePendingInvitationAlreadyExistsException(PendingInvitationAlreadyExistsException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(InvalidInviteTokenException.class)
    public ResponseEntity<ErrorDetails> handleInvalidInviteTokenException(InvalidInviteTokenException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(InvalidInvitationStateException.class)
    public ResponseEntity<ErrorDetails> handleInvalidInvitationStateException(InvalidInvitationStateException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(TokenAlreadyExpiredException.class)
    public ResponseEntity<ErrorDetails> handleTokenAlreadyExpiredException(TokenAlreadyExpiredException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(UnauthorizedInvitationAcceptanceException.class)
    public ResponseEntity<ErrorDetails> handleUnauthorizedInvitationAcceptanceException(UnauthorizedInvitationAcceptanceException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorDetails> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        System.out.println(ex.getCause());

        Throwable cause = ex.getCause();

        if (cause instanceof InvalidFormatException invalidFormatException) {

            String name = invalidFormatException.getPath().isEmpty()
                    ? "unknown"
                    : invalidFormatException.getPath().get(0).getPropertyName();

            return ResponseEntity.status(400)
                    .body(
                            ErrorDetails.builder()
                                    .success(false)
                                    .message("Invalid format for field " + name)
                                    .build()
                    );
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorDetails> handleIllegalStateException(IllegalStateException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(FeatureAlreadyExistsException.class)
    public ResponseEntity<ErrorDetails> handleIllegalStateException(FeatureAlreadyExistsException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorDetails> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex) {

        if (ex.getRequiredType() != null && ex.getRequiredType().isEnum()) {

            String message = "Invalid value '" + ex.getValue()
                    + "' for parameter '" + ex.getName() + "'.";

            ErrorDetails errorDetails = ErrorDetails.builder()
                    .success(false)
                    .message(message)
                    .build();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
        }

        ErrorDetails errorDetailsGeneral = ErrorDetails.builder()
                .success(false)
                .message("Invalid request parameter.")
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetailsGeneral);
    }

    @ExceptionHandler(InvalidFlowTransitionException.class)
    public ResponseEntity<ErrorDetails> handleInvalidFlowTransitionException(InvalidFlowTransitionException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(FeatureAlreadyActiveException.class)
    public ResponseEntity<ErrorDetails> handleFeatureAlreadyActiveException(FeatureAlreadyActiveException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(UnchangedRolloutPercentageException.class)
    public ResponseEntity<ErrorDetails> handleUnchangedRolloutPercentageException(UnchangedRolloutPercentageException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(FeatureNotEnabledException.class)
    public ResponseEntity<ErrorDetails> handleFeatureNotEnabledException(FeatureNotEnabledException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(InvalidFeatureStatusException.class)
    public ResponseEntity<ErrorDetails> handleInvalidFeatureStatusException(InvalidFeatureStatusException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(FeatureNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleFeatureNotFoundException(FeatureNotFoundException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(WorkspaceAlreadyExistsException.class)
    public ResponseEntity<ErrorDetails> handleWorkspaceAlreadyExistsException(WorkspaceAlreadyExistsException ex) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }






}
