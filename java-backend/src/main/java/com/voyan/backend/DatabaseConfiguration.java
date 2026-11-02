package com.voyan.backend;

import java.nio.file.Files;
import java.nio.file.Path;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.beans.factory.InitializingBean;

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

    @Bean(name = "databaseSchemaInitializer")
InitializingBean initializeDatabase(JdbcTemplate jdbcTemplate) {
    return () -> {
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

            // ── Places catalogue (seeded from bundled JSON on first boot) ──────────
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS places (
                    place_id          TEXT PRIMARY KEY,
                    name              TEXT NOT NULL,
                    state             TEXT,
                    district          TEXT,
                    locality          TEXT,
                    place_type        TEXT,
                    description       TEXT,
                    opening_hours     TEXT,
                    rating_value      REAL,
                    rating_text       TEXT,
                    review_count      INTEGER,
                    google_maps_url   TEXT,
                    directions_url    TEXT,
                    selection_category TEXT,
                    audience_keys     TEXT,
                    source_quality_status TEXT,
                    raw_json          TEXT NOT NULL
                )
                """);
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_places_state    ON places(state)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_places_category ON places(selection_category)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_places_rating   ON places(rating_value)");

            // ── Entry passes (real ticket pricing matched to places) ────────────
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS entry_passes (
                    id              INTEGER PRIMARY KEY AUTOINCREMENT,
                    place_id        TEXT,
                    name_pattern    TEXT NOT NULL,
                    indian_price    INTEGER NOT NULL DEFAULT 0,
                    foreign_price   INTEGER NOT NULL DEFAULT 0,
                    child_price     INTEGER NOT NULL DEFAULT 0,
                    notes           TEXT,
                    booking_url     TEXT,
                    FOREIGN KEY (place_id) REFERENCES places(place_id)
                )
                """);
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_entry_passes_place ON entry_passes(place_id)");
        };
    }
}
