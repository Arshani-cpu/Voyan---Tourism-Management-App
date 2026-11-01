package com.voyan.backend;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs at startup and fills in opening_hours for every place that has none,
 * using sensible category-based defaults.
 */
@Component
public class TimingsEnricher implements InitializingBean {

    private final JdbcTemplate jdbcTemplate;

    public TimingsEnricher(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void afterPropertiesSet() {
        int total = enrichAll();
        System.out.printf("[TimingsEnricher] Filled opening_hours for %d places.%n", total);
    }

    private int enrichAll() {
        int count = 0;
        // Historical & Heritage / Fort / Palace
        count += update("Historical & heritage",       "6:00 AM – 6:00 PM (Closed Fridays)");
        count += update("Archaeological sites",        "6:00 AM – 6:00 PM");
        // Wildlife
        count += update("Wildlife & protected nature", "6:00 AM – 6:00 PM (Safari timings vary)");
        count += update("National Park",               "6:00 AM – 6:00 PM");
        count += update("Wildlife Sanctuary",          "6:00 AM – 6:00 PM");
        count += update("Tiger Reserve",               "6:00 AM – 6:00 PM");
        // Religious
        count += update("Religious sites",             "5:00 AM – 9:00 PM (Darshan timings vary)");
        count += update("Temple",                      "5:00 AM – 9:00 PM");
        count += update("Mosque",                      "5:00 AM – 10:00 PM");
        count += update("Church",                      "6:00 AM – 8:00 PM");
        count += update("Gurudwara",                   "4:00 AM – 10:00 PM");
        // Hills & Adventure
        count += update("Hills & adventure",           "Open 24 hours (Peak season Apr-Jun & Oct-Dec)");
        count += update("Hill Station",                "Open 24 hours (Best visited 6 AM – 7 PM)");
        count += update("Trekking",                    "5:00 AM – 5:00 PM (Guided treks recommended)");
        // Beaches
        count += update("Beaches & coastal",           "6:00 AM – 8:00 PM (Swimming: 7 AM – 6 PM)");
        count += update("Beach",                       "6:00 AM – 8:00 PM");
        count += update("Island",                      "6:00 AM – 6:00 PM");
        // Water & Nature
        count += update("Water & scenic nature",       "6:00 AM – 6:00 PM");
        count += update("Waterfall",                   "6:00 AM – 6:00 PM (Best during monsoon)");
        count += update("Lake",                        "6:00 AM – 7:00 PM");
        count += update("River",                       "6:00 AM – 7:00 PM");
        // Museums & Culture
        count += update("Museums & culture",           "10:00 AM – 5:00 PM (Closed Mondays)");
        count += update("Museum",                      "10:00 AM – 5:00 PM (Closed Mondays)");
        count += update("Art Gallery",                 "10:00 AM – 6:00 PM (Closed Mondays)");
        // Food & Nightlife
        count += update("Food & nightlife",            "11:00 AM – 12:00 AM");
        // Amusement Parks
        count += update("Amusement & adventure parks", "10:00 AM – 8:00 PM");
        count += update("Amusement Park",              "10:00 AM – 8:00 PM");
        count += update("Theme Park",                  "10:00 AM – 8:00 PM");
        // Shopping Malls
        count += update("Shopping Malls",              "10:00 AM – 10:00 PM");
        // Gardens & Parks
        count += update("Garden",                      "6:00 AM – 8:00 PM");
        count += update("Botanical Garden",            "9:00 AM – 5:00 PM");
        count += update("National Park (Urban)",       "5:00 AM – 8:00 PM");
        // Viewpoints
        count += update("Viewpoint",                   "6:00 AM – 7:00 PM (Sunrise & Sunset best)");
        // Default fallback for anything still missing
        count += updateNull();
        return count;
    }

    /** Update places whose opening_hours IS NULL and whose category CONTAINS the keyword. */
    private int update(String categoryContains, String timing) {
        return jdbcTemplate.update(
            "UPDATE places SET opening_hours = ?, raw_json = json_set(raw_json, '$.opening_hours', ?) " +
            "WHERE (opening_hours IS NULL OR opening_hours = '') " +
            "AND selection_category LIKE ?",
            timing, timing, "%" + categoryContains + "%"
        );
    }

    /** Fallback: any remaining place with no hours. */
    private int updateNull() {
        return jdbcTemplate.update(
            "UPDATE places SET opening_hours = 'Open daily – check official website for hours', " +
            "raw_json = json_set(raw_json, '$.opening_hours', 'Open daily – check official website for hours') " +
            "WHERE (opening_hours IS NULL OR opening_hours = '')"
        );
    }
}
