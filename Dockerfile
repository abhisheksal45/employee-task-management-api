# ---------- Stage 1: build ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY src src

# Windows ke line endings (CRLF) Linux par mvnw ko tod dete hain, isliye theek karo
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Maven ki downloaded libraries cache hoti hain, dobara build tez
RUN --mount=type=cache,target=/root/.m2 ./mvnw -B -q package -DskipTests

# ---------- Stage 2: run ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# root user se app mat chalao
RUN useradd --system --create-home appuser

COPY --from=build /app/target/*.jar app.jar

USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]