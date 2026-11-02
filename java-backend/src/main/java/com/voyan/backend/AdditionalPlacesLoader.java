package com.voyan.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.DependsOn;

import java.io.InputStream;
import java.util.List;

/**
 * Seeds 125 additional curated Indian tourist places on startup.
 * Skips any place whose place_id already exists.
 */
@Component
@DependsOn("databaseSchemaInitializer")
public class AdditionalPlacesLoader implements InitializingBean {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public AdditionalPlacesLoader(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        // Check if already seeded
        Integer exists = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM places WHERE place_id LIKE 'ap_%'", Integer.class);
        if (exists != null && exists >= 100) {
            System.out.printf("[AdditionalPlacesLoader] %d additional places already seeded – skipping.%n", exists);
            return;
        }

        ClassPathResource resource = new ClassPathResource("additional_places.json");
        try (InputStream is = resource.getInputStream()) {
            List<JsonNode> places = objectMapper.readValue(is, new TypeReference<>() {});
            int inserted = 0;
            for (JsonNode place : places) {
                String placeId = place.path("place_id").asText();
                Integer alreadyExists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM places WHERE place_id = ?", Integer.class, placeId);
                if (alreadyExists != null && alreadyExists > 0) continue;

                String rawJson   = objectMapper.writeValueAsString(place);
                String name      = place.path("name").asText();
                String state     = place.path("state").asText(null);
                String district  = place.path("district").asText(null);
                String locality  = place.path("locality").asText(null);
                String category  = place.path("selection_category").asText(null);
                double rating    = place.path("rating_value").asDouble(4.0);
                String hours     = place.path("opening_hours").asText(null);
                String mapsUrl   = place.path("google_maps_url").asText(null);
                String audience  = place.path("audience_keys").asText("family,solo");
                String desc      = place.path("description").asText(null);

                jdbcTemplate.update("""
                    INSERT INTO places
                      (place_id, name, state, district, locality, selection_category,
                       rating_value, opening_hours, google_maps_url, audience_keys,
                       description, raw_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    placeId, name, state, district, locality, category,
                    rating, hours, mapsUrl, audience, desc, rawJson
                );
                inserted++;
            }
            System.out.printf("[AdditionalPlacesLoader] Inserted %d additional places.%n", inserted);
        }
    }
}
