package com.featureforge.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.featureforge.backend.enums.Role;
import com.featureforge.backend.exception.EmailSendingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;


import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api-key}")
    private String apiKey;

    @Value("${brevo.sender-email}")
    private String senderEmail;

    @Value("${brevo.sender-name}")
    private String senderName;

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);
        return headers;
    }

    private String createEmailBody(
            String toEmail,
            String subject,
            String htmlContent
    ) throws JsonProcessingException {
        return """
                {
                  "sender": {
                    "name": "%s",
                    "email": "%s"
                  },
                  "to": [
                    {
                      "email": "%s"
                    }
                  ],
                  "subject": %s,
                  "htmlContent": %s
                }
                """.formatted(
                senderName,
                senderEmail,
                toEmail,
                objectMapper.writeValueAsString(subject),
                objectMapper.writeValueAsString(htmlContent)
        );
    }

    public void sendWorkspaceInvitation(
            String email,
            String workspaceName,
            String role,
            String inviteLink,
            String name) {

        try {

            ClassPathResource resource = new ClassPathResource("static/emailtemplate.html");

            String htmlContent = new String(
                    resource.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );

            htmlContent = htmlContent.replace("{{adminName}}", name);
            htmlContent = htmlContent.replace("{{workspaceName}}", workspaceName);
            htmlContent = htmlContent.replace("{{role}}", role);
            htmlContent = htmlContent.replace("{{inviteLink}}", inviteLink);

            String body = createEmailBody(
                    email,
                    "You've been invited to Feature Forge",
                    htmlContent
            );


            HttpEntity<String> request =
                    new HttpEntity<>(body, createHeaders());

            restTemplate.postForEntity(
                    BREVO_API_URL,
                    request,
                    String.class
            );

        } catch (IOException e) {
            throw new EmailSendingException("Failed to load email template: " + e.getMessage());
        } catch (Exception e) {
            throw new EmailSendingException("An unexpected error occurred while sending email: " + e.getMessage());
        }
    }




}