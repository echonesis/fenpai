package com.fenpai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class FenpaiApplication {
    public static void main(String[] args) {
        SpringApplication.run(FenpaiApplication.class, args);
    }
}
