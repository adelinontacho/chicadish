# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# CHANGE: Look for WAR file instead of JAR
COPY --from=build /app/target/*.war app.war
EXPOSE 8080
# CHANGE: Run as WAR file
ENTRYPOINT ["java", "-jar", "app.war"]