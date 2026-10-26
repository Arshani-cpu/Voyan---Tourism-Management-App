package com.voyan.backend;

import java.nio.file.Files;
import java.nio.file.Path;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Configuration
public class DatabaseConfiguration {
    @Bean
    DataSource dataSource(@Value("${voyan.sqlite-path}") String sqlitePath) throws Exception {
        Path databaseFile = Path.of(sqlitePath).toAbsolutePath();
        Path databaseDirectory = databaseFile.getParent();
        if (databaseDirectory != null) {
            Files.createDirectories(databaseDirectory);
        }

        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.sqlite.JDBC");
        dataSource.setUrl("jdbc:sqlite:" + databaseFile);
        return dataSource;
    }

    @Bean
    CommandLineRunner initializeDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            jdbcTemplate.execute("PRAGMA journal_mode = WAL");
            jdbcTemplate.execute("PRAGMA busy_timeout = 5000");
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS app_records (
                    user_id TEXT NOT NULL,
                    collection TEXT NOT NULL,
                    record_id TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (user_id, collection, record_id)
                )
                """);
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS sos_live_sessions (
                    id TEXT PRIMARY KEY,
                    share_token TEXT NOT NULL UNIQUE,
                    update_token_hash TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL,
                    ended_at INTEGER,
                    latitude REAL,
                    longitude REAL,
                    accuracy REAL,
                    updated_at INTEGER
                )
                """);
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_sos_live_sessions_expiry ON sos_live_sessions(expires_at)");
        };
    }
}