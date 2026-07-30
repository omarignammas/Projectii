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
import org.springframework.web.util.UriComponentsBuilder;
import org.test.backendprojecty.exception.ExternalApiException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around the Google Gemini API — a single-shot text-generation
 * call, no conversation/multi-turn state. Mirrors YoutubeApiClient's shape:
 * constructor-injected RestTemplate + @Value config with env-var defaults, an
 * assertConfigured() guard, HTTP failures wrapped as ExternalApiException.
 */
@Service
@Slf4j
public class LlmApiClient {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;
    private final String model;

    public LlmApiClient(@Qualifier("llmRestTemplate") RestTemplate restTemplate,
                         @Value("${app.llm.api-key}") String apiKey,
                         @Value("${app.llm.base-url}") String baseUrl,
                         @Value("${app.llm.model}") String model) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
        log.info("AI session reports: {} (key length: {}), model: {}",
                (apiKey == null || apiKey.isBlank()) ? "DISABLED — no key resolved" : "enabled",
                apiKey == null ? 0 : apiKey.length(), model);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String generateText(String prompt) {
        if (!isConfigured()) {
            throw new ExternalApiException(
                    "AI session reports are not configured. Set the GEMINI_API_KEY environment variable to enable them.");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        var uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/models/" + model + ":generateContent")
                .queryParam("key", apiKey)
                .build()
                .encode()
                .toUri();

        JsonNode response;
        try {
            response = restTemplate.postForObject(uri, entity, JsonNode.class);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.warn("Gemini API call failed: {} {}", e.getStatusCode(), e.getMessage());
            throw new ExternalApiException("AI request failed (" + e.getStatusCode() + "). Please try again later.");
        } catch (ResourceAccessException e) {
            log.warn("Gemini API network error: {}", e.getMessage());
            throw new ExternalApiException("Could not reach the AI service. Please try again later.");
        }

        if (response == null) {
            throw new ExternalApiException("Empty response from the AI service. Please try again later.");
        }

        JsonNode textNode = response.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new ExternalApiException("The AI service returned an empty summary. Please try again later.");
        }
        return textNode.asText();
    }
}
