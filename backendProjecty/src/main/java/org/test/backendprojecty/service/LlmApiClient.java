package org.test.backendprojecty.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.test.backendprojecty.exception.ExternalApiException;

import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around the Groq API — OpenAI-compatible chat completions,
 * single-shot calls, no conversation/multi-turn state. Mirrors
 * YoutubeApiClient's shape: constructor-injected RestTemplate + @Value config
 * with env-var defaults, an isConfigured() guard, HTTP failures wrapped as
 * ExternalApiException.
 */
@Service
@Slf4j
public class LlmApiClient {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final String visionModel;

    public LlmApiClient(@Qualifier("llmRestTemplate") RestTemplate restTemplate,
                         @Value("${app.llm.api-key}") String apiKey,
                         @Value("${app.llm.base-url}") String baseUrl,
                         @Value("${app.llm.model}") String model,
                         @Value("${app.llm.vision-model}") String visionModel) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
        this.visionModel = visionModel;
        log.info("AI generation: {} (key length: {}), model: {}, vision model: {}",
                (apiKey == null || apiKey.isBlank()) ? "DISABLED — no key resolved" : "enabled",
                apiKey == null ? 0 : apiKey.length(), model, visionModel);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String generateText(String prompt) {
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );
        return callGroq(body);
    }

    public String generateFromImage(String prompt, byte[] imageBytes, String mimeType) {
        String base64 = Base64.getEncoder().encodeToString(imageBytes);
        Map<String, Object> body = Map.of(
                "model", visionModel,
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", List.of(
                                Map.of("type", "text", "text", prompt),
                                Map.of("type", "image_url", "image_url", Map.of("url", "data:" + mimeType + ";base64," + base64))
                        )
                ))
        );
        return callGroq(body);
    }

    private String callGroq(Map<String, Object> body) {
        if (!isConfigured()) {
            throw new ExternalApiException(
                    "AI generation is not configured. Set the GROQ_API_KEY environment variable to enable it.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        String uri = baseUrl + "/chat/completions";

        JsonNode response;
        try {
            response = restTemplate.postForObject(uri, entity, JsonNode.class);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.warn("Groq API call failed: {} {}", e.getStatusCode(), e.getMessage());
            throw new ExternalApiException("AI request failed (" + e.getStatusCode() + "). Please try again later.");
        } catch (ResourceAccessException e) {
            log.warn("Groq API network error: {}", e.getMessage());
            throw new ExternalApiException("Could not reach the AI service. Please try again later.");
        }

        if (response == null) {
            throw new ExternalApiException("Empty response from the AI service. Please try again later.");
        }

        JsonNode textNode = response.path("choices").path(0).path("message").path("content");
        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new ExternalApiException("The AI service returned an empty response. Please try again later.");
        }
        return textNode.asText();
    }
}
