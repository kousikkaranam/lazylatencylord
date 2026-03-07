package com.lazylatencylord;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LazyLatencyLordApplication {

    public static void main(String[] args) {
        SpringApplication.run(LazyLatencyLordApplication.class, args);
    }

}
