package com.voyan.backend;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Public, read-only REST API for the Voyan Indian Places catalogue.
 *
 * <p>All endpoints are unauthenticated so that the frontend (and AI layer)
 * can query places without a signed-in user.</p>
 *
 * <pre>
 * GET /api/places                     – paginated list with optional filters
 * GET /api/places/{placeId}           – single place (full raw JSON)
 * GET /api/places/search?q=...        – free-text search on name / state / district
 * GET /api/places/meta/states         – distinct state list
 * GET /api/places/meta/categories     – distinct selection_category list
 * </pre>
 */
@RestController
@RequestMapping("/api/places")
public class PlacesController {

    private static final int MAX_PAGE_SIZE = 50;

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public PlacesController(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    // ── List / filter ─────────────────────────────────────────────────────────

    /**
     * Returns a paginated list of places.
     *
     * <p>Optional query parameters:
     * <ul>
     *   <li>{@code state}     – exact state name (case-insensitive)</li>
     *   <li>{@code category}  – selection_category (case-insensitive)</li>
     *   <li>{@code audience}  – audience key, e.g. {@code family}, {@code couples}</li>
     *   <li>{@code minRating} – minimum rating_value (0–5)</li>
     *   <li>{@code page}      – 0-based page index (default 0)</li>
     *   <li>{@code size}      – page size 1–50 (default 20)</li>
     * </ul>
     */
    @GetMapping
    public Map<String, Object> list(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String audience,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        size = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        page = Math.max(page, 0);
        int offset = page * size;

        StringBuilder where = new StringBuilder("WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (state != null && !state.isBlank()) {
            where.append(" AND state LIKE ?");
            params.add(state.trim());
        }
        if (category != null && !category.isBlank()) {
            where.append(" AND selection_category LIKE ?");
            params.add(category.trim());
        }
        if (audience != null && !audience.isBlank()) {
            where.append(" AND (',' || audience_keys || ',') LIKE ?");
            params.add("%," + audience.trim() + ",%");
        }
        if (minRating != null) {
            where.append(" AND rating_value >= ?");
            params.add(minRating);
        }

        String countSql = "SELECT COUNT(*) FROM places " + where;
        Integer total = jdbcTemplate.queryForObject(countSql, Integer.class, params.toArray());

        String dataSql = "SELECT raw_json FROM places " + where
                + " ORDER BY rating_value DESC NULLS LAST LIMIT ? OFFSET ?";
        params.add(size);
        params.add(offset);

        List<JsonNode> places = jdbcTemplate.query(dataSql, (rs, i) -> parseJson(rs.getString("raw_json")),
                params.toArray());

        // Attach entry pass data to each place
        List<Object> enrichedPlaces = enrichWithEntryPasses(places);

        return Map.of(
                "total", total == null ? 0 : total,
                "page", page,
                "size", size,
                "places", enrichedPlaces);
    }

    // ── Single place ──────────────────────────────────────────────────────────

    @GetMapping("/{placeId}")
    public Object getOne(@PathVariable String placeId) {
        List<JsonNode> results = jdbcTemplate.query(
                "SELECT raw_json FROM places WHERE place_id = ?",
                (rs, i) -> parseJson(rs.getString("raw_json")),
                placeId);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Place not found: " + placeId);
        }
        List<Object> enriched = enrichWithEntryPasses(results);
        return enriched.get(0);
    }

    // ── Free-text search ──────────────────────────────────────────────────────

    /**
     * Searches across {@code name}, {@code state}, {@code district}, and
     * {@code selection_category} using a LIKE pattern.
     *
     * @param q    the search query (required)
     * @param page 0-based page index
     * @param size page size (1–50, default 20)
     */
    @GetMapping("/search")
    public Map<String, Object> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (q == null || q.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Query parameter 'q' is required");
        }
        size = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        page = Math.max(page, 0);
        int offset = page * size;

        String pattern = "%" + q.trim() + "%";
        String where = """
                WHERE name LIKE ?
                   OR state LIKE ?
                   OR district LIKE ?
                   OR selection_category LIKE ?
                   OR locality LIKE ?
                """;
        Object[] countParams = {pattern, pattern, pattern, pattern, pattern};

        Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM places " + where, Integer.class, countParams);

        List<JsonNode> places = jdbcTemplate.query(
                "SELECT raw_json FROM places " + where
                        + " ORDER BY rating_value DESC NULLS LAST LIMIT ? OFFSET ?",
                (rs, i) -> parseJson(rs.getString("raw_json")),
                pattern, pattern, pattern, pattern, pattern, size, offset);

        List<Object> enrichedPlaces = enrichWithEntryPasses(places);

        return Map.of(
                "query", q,
                "total", total == null ? 0 : total,
                "page", page,
                "size", size,
                "places", enrichedPlaces);
    }

    // ── Metadata endpoints ────────────────────────────────────────────────────

    /** Returns a sorted list of all distinct states present in the catalogue. */
    @GetMapping("/meta/states")
    public Map<String, Object> states() {
        List<String> states = jdbcTemplate.queryForList(
                "SELECT DISTINCT state FROM places WHERE state IS NOT NULL ORDER BY state ASC",
                String.class);
        return Map.of("states", states);
    }

    /** Returns a sorted list of all distinct selection categories. */
    @GetMapping("/meta/categories")
    public Map<String, Object> categories() {
        List<String> cats = jdbcTemplate.queryForList(
                "SELECT DISTINCT selection_category FROM places WHERE selection_category IS NOT NULL ORDER BY selection_category ASC",
                String.class);
        return Map.of("categories", cats);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    /** Enrich a list of place JSON nodes with entry_pass data from the DB,
     *  falling back to a category/state-derived entry pass when no specific
     *  record is found, so every place has entry_pass populated. */
    private List<Object> enrichWithEntryPasses(List<JsonNode> places) {
        List<Object> result = new ArrayList<>();
        for (JsonNode place : places) {
            Map<String, Object> map = objectMapper.convertValue(place, Map.class);
            String placeId = place.has("place_id") ? place.get("place_id").asText() : null;
            String category = place.has("selection_category") ? place.get("selection_category").asText("") : "";
            String state    = place.has("state")              ? place.get("state").asText("")              : "";
            String name     = place.has("name")               ? place.get("name").asText("")               : "";

            Map<String, Object> entryPass = null;
            if (placeId != null) {
                List<Map<String, Object>> passes = jdbcTemplate.queryForList(
                    "SELECT indian_price, foreign_price, child_price, notes, booking_url " +
                    "FROM entry_passes WHERE place_id = ? LIMIT 1", placeId);
                if (!passes.isEmpty()) {
                    entryPass = passes.get(0);
                }
            }

            // Fallback: derive from category + state when no specific record matched
            if (entryPass == null) {
                entryPass = buildFallbackEntryPass(category, state, name);
            }

            map.put("entry_pass", entryPass);
            result.add(map);
        }
        return result;
    }

    /**
     * Builds a sensible fallback entry-pass record when no specific DB match exists.
     * Uses category and state to infer price tier and official website URL.
     */
    private Map<String, Object> buildFallbackEntryPass(String category, String state, String name) {
        Map<String, Object> ep = new HashMap<>();
        String cat = (category == null ? "" : category).toLowerCase();
        String st  = (state    == null ? "" : state).toLowerCase();

        // ── Official website by state ──────────────────────────────────────────
        String stateUrl = stateTourismUrl(state);

        // ── Pricing + website by category ─────────────────────────────────────
        if (cat.contains("historical") || cat.contains("heritage") || cat.contains("fort") || cat.contains("palace")) {
            ep.put("indian_price",   50);
            ep.put("foreign_price",  300);
            ep.put("child_price",    0);
            ep.put("notes",          "State heritage site. Timings vary; check before visiting.");
            ep.put("booking_url",    stateUrl);

        } else if (cat.contains("religious") || cat.contains("temple") || cat.contains("pilgrimage")) {
            ep.put("indian_price",   0);
            ep.put("foreign_price",  0);
            ep.put("child_price",    0);
            ep.put("notes",          "Free entry. Special darshan or prasad may have charges. Dress code applies.");
            ep.put("booking_url",    stateUrl);

        } else if (cat.contains("wildlife") || cat.contains("national park") || cat.contains("sanctuary")) {
            ep.put("indian_price",   150);
            ep.put("foreign_price",  1000);
            ep.put("child_price",    75);
            ep.put("notes",          "Safari/jeep charges extra. Advance booking recommended.");
            ep.put("booking_url",    stateForestUrl(state));

        } else if (cat.contains("beach") || cat.contains("island") || cat.contains("coastal")) {
            ep.put("indian_price",   0);
            ep.put("foreign_price",  0);
            ep.put("child_price",    0);
            ep.put("notes",          "Free public beach. Water sports and activities are charged separately.");
            ep.put("booking_url",    stateUrl);

        } else if (cat.contains("museum")) {
            ep.put("indian_price",   30);
            ep.put("foreign_price",  200);
            ep.put("child_price",    10);
            ep.put("notes",          "Closed on Mondays. Camera charges may apply.");
            ep.put("booking_url",    stateUrl);

        } else if (cat.contains("adventure") || cat.contains("trekking")) {
            ep.put("indian_price",   100);
            ep.put("foreign_price",  500);
            ep.put("child_price",    50);
            ep.put("notes",          "Permit required. Guide charges extra. Check seasonal availability.");
            ep.put("booking_url",    stateUrl);

        } else if (cat.contains("lake") || cat.contains("waterfall") || cat.contains("river")) {
            ep.put("indian_price",   20);
            ep.put("foreign_price",  100);
            ep.put("child_price",    10);
            ep.put("notes",          "Boating/ferry charges extra. Best during monsoon season.");
            ep.put("booking_url",    stateUrl);

        } else if (cat.contains("hill") || cat.contains("mountain") || cat.contains("viewpoint")) {
            ep.put("indian_price",   0);
            ep.put("foreign_price",  0);
            ep.put("child_price",    0);
            ep.put("notes",          "Free entry. Ropeway/cable car charges apply separately.");
            ep.put("booking_url",    stateUrl);

        } else if (cat.contains("garden") || cat.contains("park") || cat.contains("botanical")) {
            ep.put("indian_price",   30);
            ep.put("foreign_price",  100);
            ep.put("child_price",    15);
            ep.put("notes",          "Camera charges may apply. Open during daylight hours.");
            ep.put("booking_url",    stateUrl);

        } else if (cat.contains("amusement") || cat.contains("theme park")) {
            ep.put("indian_price",   600);
            ep.put("foreign_price",  600);
            ep.put("child_price",    400);
            ep.put("notes",          "Online booking often cheaper. Combo passes available.");
            ep.put("booking_url",    stateUrl);

        } else {
            // Generic fallback
            ep.put("indian_price",   0);
            ep.put("foreign_price",  0);
            ep.put("child_price",    0);
            ep.put("notes",          "Check official website for latest entry fees and timings.");
            ep.put("booking_url",    stateUrl);
        }
        return ep;
    }

    /** Maps a state name to its official tourism portal URL. */
    private String stateTourismUrl(String state) {
        if (state == null) return "https://www.incredibleindia.org/";
        return switch (state.trim()) {
            case "Rajasthan"                      -> "https://www.rajasthantourism.gov.in/";
            case "Kerala"                         -> "https://www.keralatourism.org/";
            case "Goa"                            -> "https://www.goatourism.gov.in/";
            case "Himachal Pradesh"               -> "https://himachaltourism.gov.in/";
            case "Uttarakhand"                    -> "https://uttarakhandtourism.gov.in/";
            case "Jammu and Kashmir"              -> "https://www.jktourism.org/";
            case "Tamil Nadu"                     -> "https://www.tamilnadutourism.tn.gov.in/";
            case "Karnataka"                      -> "https://www.karnatakatourism.org/";
            case "Maharashtra"                    -> "https://www.maharashtratourism.gov.in/";
            case "Andhra Pradesh"                 -> "https://aptourism.gov.in/";
            case "Telangana"                      -> "https://www.telanganatourism.gov.in/";
            case "Gujarat"                        -> "https://www.gujarattourism.com/";
            case "Madhya Pradesh"                 -> "https://www.mptourism.com/";
            case "Uttar Pradesh"                  -> "https://uptourism.gov.in/";
            case "West Bengal"                    -> "https://www.tourismwestbengal.gov.in/";
            case "Odisha"                         -> "https://odishatourism.gov.in/";
            case "Bihar"                          -> "https://www.bihartourism.gov.in/";
            case "Assam"                          -> "https://www.assamtourism.gov.in/";
            case "Meghalaya"                      -> "https://megtourism.gov.in/";
            case "Sikkim"                         -> "https://sikkimtourism.gov.in/";
            case "Manipur"                        -> "https://tourismimphal.nic.in/";
            case "Mizoram"                        -> "https://www.tourism.mizoram.gov.in/";
            case "Nagaland"                       -> "https://tourismnagaland.com/";
            case "Arunachal Pradesh"              -> "https://www.arunachaltourism.com/";
            case "Andaman and Nicobar Islands"    -> "https://www.andamantourism.gov.in/";
            case "Lakshadweep"                    -> "https://lakshadweeptourism.com/";
            case "Puducherry"                     -> "https://www.pondicherrytourism.co.in/";
            case "Chhattisgarh"                   -> "https://www.chhattisgarhtourism.in/";
            case "Jharkhand"                      -> "https://www.jharkhandtourism.in/";
            case "Punjab"                         -> "https://www.punjabtourism.gov.in/";
            case "Haryana"                        -> "https://www.haryanatourism.gov.in/";
            case "Delhi"                          -> "https://www.delhitourism.gov.in/";
            case "Ladakh"                         -> "https://www.lahdc.nic.in/";
            default                               -> "https://www.incredibleindia.org/";
        };
    }

    /** Maps a state to its forest/wildlife booking portal. */
    private String stateForestUrl(String state) {
        if (state == null) return "https://www.incredibleindia.org/";
        return switch (state.trim()) {
            case "Madhya Pradesh"   -> "https://forest.mponline.gov.in/";
            case "Rajasthan"        -> "https://rajasthanwildlife.in/";
            case "Uttarakhand"      -> "https://www.corbettonline.uk.gov.in/";
            case "Assam"            -> "https://kaziranga.assam.gov.in/";
            case "Gujarat"          -> "https://girlion.in/";
            case "Kerala"           -> "https://periyartigerreserve.org/";
            case "Karnataka"        -> "https://bandipurtigerreserve.org/";
            case "West Bengal"      -> "https://www.sundarbantigerreserve.in/";
            case "Maharashtra"      -> "https://www.maharashtratourism.gov.in/";
            default                 -> stateTourismUrl(state);
        };
    }


    @SuppressWarnings("unchecked")
    private JsonNode parseJson(String raw) {
        try {
            return objectMapper.readTree(raw);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Corrupt place record in database");
        }
    }
}
