# -- Stage 1: Build the Spring Boot JAR --------------------------------------
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

# Copy Maven wrapper and pom first (layer cache)
COPY mvnw* ./
COPY .mvn/ .mvn/
COPY java-backend/pom.xml java-backend/pom.xml

# Download dependencies (cached unless pom changes)
RUN sed -i 's/\r$//' mvnw && \
    chmod +x mvnw && \
    ./mvnw -f java-backend/pom.xml dependency:go-offline -B --no-transfer-progress

# Copy source and build
COPY java-backend/src java-backend/src
RUN ./mvnw -f java-backend/pom.xml package -B --no-transfer-progress -DskipTests

# -- Stage 2: Slim runtime image ----------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# Persistent storage directories
RUN mkdir -p /app/.sqlite-data /app/.file-data

# Copy the built JAR
COPY --from=builder /build/java-backend/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
