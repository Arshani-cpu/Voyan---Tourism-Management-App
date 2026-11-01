package com.voyan.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the `places` SQLite table from the bundled classpath resource
 * {@code places_data.json} on every application startup.
 *
 * <p>Uses INSERT OR IGNORE so it is safe to run multiple times; existing rows
 * are left untouched.</p>
 */
@Component
public class PlacesDataLoader implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PlacesDataLoader.class);

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public PlacesDataLoader(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Skip if already seeded
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM places", Integer.class);
        if (count != null && count > 0) {
            log.info("Places table already contains {} records – skipping seed.", count);
            return;
        }

        log.info("Seeding places table from bundled JSON …");
        ClassPathResource resource = new ClassPathResource("places_data.json");
        try (InputStream in = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(in);
            JsonNode placesArray = root.path("places");

            if (!placesArray.isArray()) {
                log.warn("places_data.json does not contain a 'places' array – aborting seed.");
                return;
            }

            List<Object[]> batchArgs = new ArrayList<>();
            for (JsonNode place : placesArray) {
                String placeId       = text(place, "place_id");
                String name          = text(place, "name");
                String state         = text(place, "state");
                String district      = text(place, "district");
                String locality      = text(place, "locality");
                String placeType     = text(place, "place_type");
                String description   = text(place, "description");
                String openingHours  = text(place, "opening_hours");
                Double ratingValue   = place.path("rating_value").isNull() || place.path("rating_value").isMissingNode()
                                       ? null : place.path("rating_value").asDouble();
                String ratingText    = text(place, "rating_text");
                Integer reviewCount  = place.path("review_count").isNull() || place.path("review_count").isMissingNode()
                                       ? null : place.path("review_count").asInt();
                String mapsUrl       = text(place, "google_maps_url");
                String directionsUrl = text(place, "directions_url");
                String category      = text(place, "selection_category");
                String qualityStatus = text(place, "source_quality_status");

                // Flatten audience_categories into a comma-separated key list
                String audienceKeys = buildAudienceKeys(place.path("audience_categories"));

                // Store the full original JSON node for rich client queries
                String rawJson = objectMapper.writeValueAsString(place);

                if (placeId == null || name == null) continue;

                batchArgs.add(new Object[]{
                    placeId, name, state, district, locality, placeType,
                    description, openingHours, ratingValue, ratingText,
                    reviewCount, mapsUrl, directionsUrl, category,
                    audienceKeys, qualityStatus, rawJson
                });
            }

            jdbcTemplate.batchUpdate("""
                INSERT OR IGNORE INTO places (
                    place_id, name, state, district, locality, place_type,
                    description, opening_hours, rating_value, rating_text,
                    review_count, google_maps_url, directions_url, selection_category,
                    audience_keys, source_quality_status, raw_json
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """, batchArgs);

            log.info("Places seed complete – {} records inserted.", batchArgs.size());
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String text(JsonNode node, String field) {
        JsonNode v = node.path(field);
        return (v.isNull() || v.isMissingNode()) ? null : v.asText();
    }

    private String buildAudienceKeys(JsonNode audienceArray) {
        if (!audienceArray.isArray()) return null;
        List<String> keys = new ArrayList<>();
        for (JsonNode a : audienceArray) {
            String key = text(a, "category_key");
            if (key != null) keys.add(key);
        }
        return keys.isEmpty() ? null : String.join(",", keys);
    }
}
