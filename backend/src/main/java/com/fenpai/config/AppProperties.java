package com.fenpai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Frontend frontend = new Frontend();
    private final Auth auth = new Auth();

    public Jwt getJwt() { return jwt; }
    public Cors getCors() { return cors; }
    public Frontend getFrontend() { return frontend; }
    public Auth getAuth() { return auth; }

    public static class Jwt {
        private String secret;
        private long expirationMs = 86400000L;

        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        public long getExpirationMs() { return expirationMs; }
        public void setExpirationMs(long expirationMs) { this.expirationMs = expirationMs; }
    }

    public static class Cors {
        private String allowedOrigins;

        public String getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(String allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    }

    public static class Frontend {
        private String baseUrl;

        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
    }

    public static class Auth {
        private final Google google = new Google();

        public Google getGoogle() { return google; }
    }

    public static class Google {
        private String clientId;

        public String getClientId() { return clientId; }
        public void setClientId(String clientId) { this.clientId = clientId; }
    }
}
