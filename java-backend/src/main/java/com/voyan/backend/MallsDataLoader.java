package com.voyan.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

/**
 * Seeds 50 major Indian shopping malls into the places table on startup.
 * Skips any mall whose place_id already exists to avoid duplicates.
 */
@Component
public class MallsDataLoader implements InitializingBean {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public MallsDataLoader(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        // Count existing malls
        Integer mallCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM places WHERE selection_category = 'Shopping Malls'",
            Integer.class);

        if (mallCount != null && mallCount >= 50) {
            System.out.printf("[MallsDataLoader] %d malls already seeded – skipping.%n", mallCount);
            return;
        }

        ClassPathResource resource = new ClassPathResource("malls_data.json");
        try (InputStream is = resource.getInputStream()) {
            List<JsonNode> malls = objectMapper.readValue(is, new TypeReference<>() {});
            int inserted = 0;
            for (JsonNode mall : malls) {
                String placeId = mall.path("place_id").asText();
                // Skip if already exists
                Integer exists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM places WHERE place_id = ?", Integer.class, placeId);
                if (exists != null && exists > 0) continue;

                String rawJson = objectMapper.writeValueAsString(mall);
                String name     = mall.path("name").asText();
                String state    = mall.path("state").asText(null);
                String district = mall.path("district").asText(null);
                String locality = mall.path("locality").asText(null);
                String category = mall.path("selection_category").asText("Shopping Malls");
                double rating   = mall.path("rating_value").asDouble(4.0);
                String hours    = mall.path("opening_hours").asText(null);
                String mapsUrl  = mall.path("google_maps_url").asText(null);

                jdbcTemplate.update("""
                    INSERT INTO places
                      (place_id, name, state, district, locality, selection_category,
                       rating_value, opening_hours, google_maps_url, audience_keys, raw_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    placeId, name, state, district, locality, category,
                    rating, hours, mapsUrl, "family,couples,solo", rawJson
                );
                inserted++;
            }
            System.out.printf("[MallsDataLoader] Inserted %d malls into places table.%n", inserted);
        }
    }
}
