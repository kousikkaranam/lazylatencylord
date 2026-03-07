package com.lazylatencylord.exception;

public class SessionNotFoundException extends RuntimeException {
    public SessionNotFoundException(String sessionId) {
        super("Session not found or expired: " + sessionId);
    }
}
