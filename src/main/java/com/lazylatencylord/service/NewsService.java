package com.lazylatencylord.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final RestTemplate restTemplate;

    @Value("${news.api.key:}")
    private String apiKey;

    private static final List<String> FALLBACK_HEADLINES = List.of(
            "Technology continues to reshape how people work and communicate worldwide.",
            "Scientists discover new methods to reduce carbon emissions effectively.",
            "Global markets respond to recent changes in international trade policies."
    );

    @JsonIgnoreProperties(ignoreUnknown = true)
    record NewsApiResponse(List<Article> results) {
        @JsonIgnoreProperties(ignoreUnknown = true)
        record Article(String title) {}
    }

    public List<String> getHeadlines(String category) {
        if (apiKey.isBlank()) {
            log.warn("NEWS_API_KEY not configured, using fallback headlines");
            return FALLBACK_HEADLINES;
        }

        try {
            String url = "https://newsdata.io/api/1/latest?apikey=" + apiKey
                    + "&language=en&size=10";

            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("top")) {
                url += "&category=" + category;
            }

            NewsApiResponse response = restTemplate.getForObject(url, NewsApiResponse.class);

            if (response != null && response.results() != null) {
                List<String> headlines = response.results().stream()
                        .filter(a -> a.title() != null && !a.title().isBlank())
                        .map(a -> a.title().trim())
                        .toList();
                if (!headlines.isEmpty()) return headlines;
            }
        } catch (Exception e) {
            log.error("News API call failed: {}", e.getMessage());
        }

        return FALLBACK_HEADLINES;
    }
}
