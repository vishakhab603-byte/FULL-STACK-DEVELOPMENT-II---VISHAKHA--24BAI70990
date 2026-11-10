package com.example.cicd.testcontainers;

import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.sql.DriverManager;
import static org.junit.jupiter.api.Assertions.assertEquals;

@Testcontainers(disabledWithoutDocker = true)
class DatabaseContainerTest {
    @Container static final PostgreSQLContainer<?> database = new PostgreSQLContainer<>("postgres:16-alpine");
    @Test void connectsToAnIsolatedPostgresContainer() throws Exception {
        try (var connection = DriverManager.getConnection(database.getJdbcUrl(), database.getUsername(), database.getPassword());
             var statement = connection.createStatement(); var result = statement.executeQuery("SELECT 6 * 7")) {
            result.next(); assertEquals(42, result.getInt(1));
        }
    }
}
