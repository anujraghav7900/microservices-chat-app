FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src
RUN mvn clean package

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/maven-demo-service-1.0.0.jar app.jar

CMD ["java", "-jar", "app.jar"]
