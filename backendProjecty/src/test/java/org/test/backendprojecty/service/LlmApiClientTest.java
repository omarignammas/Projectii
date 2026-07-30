package org.test.backendprojecty.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.test.backendprojecty.exception.ExternalApiException;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LlmApiClientTest {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Mock
    private RestTemplate restTemplate;

    private LlmApiClient client;

    @BeforeEach
    void setUp() {
        client = new LlmApiClient(restTemplate, "test-api-key", BASE_URL, "gemini-2.0-flash");
    }

    private JsonNode json(String text) {
        try {
            return MAPPER.readTree(text);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void generateText_ReturnsText_WhenSuccessful() {
        when(restTemplate.postForObject(any(URI.class), any(HttpEntity.class), eq(JsonNode.class))).thenReturn(json("""
                { "candidates": [ { "content": { "parts": [ { "text": "Great session recap!" } ] } } ] }
                """));

        String result = client.generateText("summarize this");

        assertEquals("Great session recap!", result);
    }

    @Test
    void generateText_ThrowsExternalApiException_WhenApiKeyBlank() {
        LlmApiClient unconfigured = new LlmApiClient(restTemplate, "", BASE_URL, "gemini-2.0-flash");

        assertThrows(ExternalApiException.class, () -> unconfigured.generateText("summarize this"));
        verifyNoInteractions(restTemplate);
    }

    @Test
    void generateText_ThrowsExternalApiException_OnHttpClientError() {
        when(restTemplate.postForObject(any(URI.class), any(HttpEntity.class), eq(JsonNode.class)))
                .thenThrow(HttpClientErrorException.create(HttpStatus.FORBIDDEN, "Forbidden", null, null, null));

        assertThrows(ExternalApiException.class, () -> client.generateText("summarize this"));
    }

    @Test
    void generateText_ThrowsExternalApiException_OnNetworkError() {
        when(restTemplate.postForObject(any(URI.class), any(HttpEntity.class), eq(JsonNode.class)))
                .thenThrow(new ResourceAccessException("timeout"));

        assertThrows(ExternalApiException.class, () -> client.generateText("summarize this"));
    }

    @Test
    void generateText_ThrowsExternalApiException_WhenResponseHasNoCandidates() {
        when(restTemplate.postForObject(any(URI.class), any(HttpEntity.class), eq(JsonNode.class)))
                .thenReturn(json("{ \"candidates\": [] }"));

        assertThrows(ExternalApiException.class, () -> client.generateText("summarize this"));
    }
}
