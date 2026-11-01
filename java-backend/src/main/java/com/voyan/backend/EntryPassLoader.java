package com.voyan.backend;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Loads real entry-pass / ticket pricing from entry_passes.json and matches
 * them against the 700 places in the DB by name pattern (regex).
 * Runs AFTER PlacesDataLoader (Order 2 vs Order 1).
 */
@Component
@Order(2)
public class EntryPassLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(EntryPassLoader.class);
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public EntryPassLoader(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @SuppressWarnings("unchecked")
    public void run(String... args) throws Exception {
        // Skip if already seeded
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM entry_passes", Integer.class);
        if (count != null && count > 0) {
            log.info("Entry passes table already has {} records – skipping seed.", count);
            return;
        }

        InputStream is = new ClassPathResource("entry_passes.json").getInputStream();
        Map<String, Object> root = mapper.readValue(is, Map.class);
        List<Map<String, Object>> entries = (List<Map<String, Object>>) root.get("entry_passes");

        if (entries == null || entries.isEmpty()) {
            log.warn("No entry pass data found in entry_passes.json");
            return;
        }

        log.info("Loading {} entry pass definitions …", entries.size());

        // Load all place_id + name pairs from DB
        List<Map<String, Object>> allPlaces = jdbc.queryForList(
            "SELECT place_id, name FROM places"
        );

        int matched = 0;
        int unmatched = 0;

        for (Map<String, Object> entry : entries) {
            String namePattern = (String) entry.get("name_pattern");
            int indianPrice  = toInt(entry.get("indian_price"));
            int foreignPrice = toInt(entry.get("foreign_price"));
            int childPrice   = toInt(entry.get("child_price"));
            String notes     = (String) entry.get("notes");
            String bookingUrl = entry.get("booking_url") != null ? entry.get("booking_url").toString() : null;

            // Compile the name pattern as case-insensitive regex
            Pattern regex = Pattern.compile(namePattern, Pattern.CASE_INSENSITIVE);

            // Find matching places
            boolean foundMatch = false;
            for (Map<String, Object> place : allPlaces) {
                String placeName = (String) place.get("name");
                String placeId   = (String) place.get("place_id");
                if (placeName != null && regex.matcher(placeName).find()) {
                    jdbc.update(
                        """
                        INSERT INTO entry_passes (place_id, name_pattern, indian_price, foreign_price, child_price, notes, booking_url)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        placeId, namePattern, indianPrice, foreignPrice, childPrice, notes, bookingUrl
                    );
                    foundMatch = true;
                    matched++;
                }
            }

            if (!foundMatch) {
                // Insert without place_id – can still be used for display
                jdbc.update(
                    """
                    INSERT INTO entry_passes (place_id, name_pattern, indian_price, foreign_price, child_price, notes, booking_url)
                    VALUES (NULL, ?, ?, ?, ?, ?, ?)
                    """,
                    namePattern, indianPrice, foreignPrice, childPrice, notes, bookingUrl
                );
                unmatched++;
            }
        }

        log.info("Entry pass seed complete – {} matched to places, {} unmatched patterns stored.", matched, unmatched);
    }

    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (NumberFormatException e) { return 0; }
    }
}
