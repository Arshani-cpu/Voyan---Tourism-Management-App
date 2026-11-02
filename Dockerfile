
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /build

COPY java-backend/pom.xml ./pom.xml
COPY java-backend/src ./src

RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /build/target/*.jar app.jar
COPY firebase-applet-config.json ./firebase-applet-config.json

EXPOSE 8081

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar app.jar"]
