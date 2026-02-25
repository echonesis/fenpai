# ── Build stage ────────────────────────────────────────────
# maven:3.9-eclipse-temurin-17 支援 amd64 + arm64（Apple Silicon）
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Runtime stage ───────────────────────────────────────────
# eclipse-temurin:17-jre-jammy 支援 amd64 + arm64
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN groupadd -r fenpai && useradd -r -g fenpai fenpai

COPY --from=builder /app/target/*.jar app.jar

USER fenpai

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
