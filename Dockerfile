# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app

# Copy only pom.xml first (for layer caching - makes builds faster)
COPY pom.xml .
# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src
# Build the application (skip tests for faster deployment)
RUN mvn clean package -DskipTests

# Run stage - smaller image for running
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]