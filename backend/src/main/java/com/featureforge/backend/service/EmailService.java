package com.featureforge.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import jakarta.mail.internet.MimeMessage;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String brevoSenderName;

    @Value("${featureforge.app.url:http://localhost:5173}")
    private String appUrl;

    public void sendWorkspaceInvitation(
            String toEmail,
            String senderName,
            String workspaceName,
            String role,
            String token
    ) {

        String inviteLink = appUrl + "/accept-invite?token=" + token;

        try {

            // 1. Read HTML template
            ClassPathResource resource =
                    new ClassPathResource("templates/emailTemplate.html");

            byte[] bytes =
                    FileCopyUtils.copyToByteArray(resource.getInputStream());

            String htmlContent =
                    new String(bytes, StandardCharsets.UTF_8);


            // 2. Replace dynamic placeholders
            String logoUrl = "https://res.cloudinary.com/dzexb7f3p/image/upload/v1785935269/1785882227966_rtowpc.png";
            htmlContent = htmlContent
                    .replace("{{logoUrl}}", logoUrl)
                    .replace("{{senderName}}", senderName)
                    .replace("{{workspaceName}}", workspaceName)
                    .replace("{{role}}", role)
                    .replace("{{inviteLink}}", inviteLink);


            // 3. Prepare Brevo request body
            Map<String, Object> requestBody = Map.of(

                    "sender", Map.of(
                            "name", brevoSenderName,
                            "email", senderEmail
                    ),

                    "to", List.of(
                            Map.of(
                                    "email", toEmail
                            )
                    ),

                    "subject",
                    senderName + " invited you to join "
                            + workspaceName
                            + " on FeatureForge",

                    "htmlContent",
                    htmlContent
            );


            // 4. Send email through Brevo REST API
            RestClient restClient = RestClient.create();

            restClient.post()
                    .uri("https://api.brevo.com/v3/smtp/email")
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();


            log.info(
                    "FeatureForge workspace invitation successfully sent to {}",
                    toEmail
            );

        } catch (Exception e) {

            log.error(
                    "Failed to send workspace invitation to {}. Error: {}",
                    toEmail,
                    e.getMessage(),
                    e
            );

            printMockEmail(
                    toEmail,
                    senderName,
                    workspaceName,
                    role,
                    inviteLink
            );
        }
    }

    private void printMockEmail(String toEmail, String senderName, String workspaceName, String role, String inviteLink) {
        System.out.println("=================================================================");
        System.out.println("  [MOCK EMAIL INVITE] FeatureForge Workspace Invitation");
        System.out.println("  To: " + toEmail);
        System.out.println("  Invited by: " + senderName);
        System.out.println("  Workspace: " + workspaceName);
        System.out.println("  Role: " + role);
        System.out.println("  Accept Link: " + inviteLink);
        System.out.println("=================================================================");
    }
}
