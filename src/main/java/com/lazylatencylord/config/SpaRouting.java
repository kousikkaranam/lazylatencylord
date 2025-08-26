// src/main/java/com/lazylatencylord/config/SpaRouting.java
package com.lazylatencylord.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SpaRouting implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry r) {
        // 1) Direct single-segment routes like /login, /about
        r.addViewController("/{spring:\\w+}")
                .setViewName("forward:/index.html");

        // Catch-all removed to avoid intercepting static assets and API routes.

        // Make sure this runs after controllers & resource handlers
        r.setOrder(Ordered.LOWEST_PRECEDENCE);
    }
}
