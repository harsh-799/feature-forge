package com.featureforge.backend.dto.request;

import lombok.Getter;

import java.util.UUID;

@Getter
public class RevokeInvitationRequest {
    private UUID token;
}
