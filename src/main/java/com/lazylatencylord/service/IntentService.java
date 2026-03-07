package com.lazylatencylord.service;

import org.springframework.stereotype.Service;

@Service
public class IntentService {

    public String detectIntent(String text) {
        text = text.toLowerCase();
        if (text.contains("hi") || text.contains("hello") || text.contains("dear")) {
            return "email";
        } else if (text.contains("tweet") || text.length() < 280) {
            return "tweet";
        } else if (text.contains("function") || text.contains("class") || text.contains("code")) {
            return "code";
        } else {
            return "general";
        }
    }
}