FROM eclipse-temurin:21-jdk-alpine as build
WORKDIR /workspace/app

# Copy gradle wrapper and related files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable
RUN chmod +x ./gradlew

# Copy source code
COPY src src

# Build the application
RUN ./gradlew build -x test

# Create the final image
FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp

# Copy the built jar file
COPY --from=build /workspace/app/build/libs/*.jar app.jar

# Run the application
ENTRYPOINT ["java","-jar","/app.jar"]
