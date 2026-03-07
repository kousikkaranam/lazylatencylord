package com.lazylatencylord.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class NewsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${news.api.key}")
    private String apiKey;

    @SuppressWarnings("unchecked")
    public List<String> getHeadlines(String category) {
        try {
            String url = "https://newsdata.io/api/1/latest?apikey=" + apiKey
                    + "&language=en&size=10";

            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("top")) {
                url += "&category=" + category;
            }

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.get("results") instanceof List<?> results) {
                List<String> headlines = new ArrayList<>();
                for (Object item : results) {
                    if (item instanceof Map<?, ?> article) {
                        String title = (String) article.get("title");
                        if (title != null && !title.isBlank()) {
                            headlines.add(title.trim());
                        }
                    }
                }
                return headlines;
            }
        } catch (Exception e) {
            log.error("News API call failed: {}", e.getMessage());
        }

        return List.of(
                "Technology continues to reshape how people work and communicate worldwide.",
                "Scientists discover new methods to reduce carbon emissions effectively.",
                "Global markets respond to recent changes in international trade policies."
        );
    }
}
