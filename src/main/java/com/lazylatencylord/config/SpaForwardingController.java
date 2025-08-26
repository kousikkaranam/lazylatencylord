// src/main/java/com/lazylatencylord/config/SpaForwardingController.java
package com.lazylatencylord.config;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;

/*
 Note: Disabled SPA forwarding via controller to avoid intercepting static assets.
 Keeping this class non-annotated ensures Spring doesn't register it as a controller.
*/
public class SpaForwardingController {

    // Forward any path WITHOUT a file extension to index.html
    // 1) "/{segment}"         — top-level routes
    // 2) "/{segment}/**"      — deeper routes (must end with **)
    // We restrict to requests that want HTML to avoid catching asset requests.
    // Disabled mapping – handled by WebMvcConfigurer (SpaRouting) with correct precedence.
    // @GetMapping(value = "/{path:[^\\.]*}", produces = MediaType.TEXT_HTML_VALUE)
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
