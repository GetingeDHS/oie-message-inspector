/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
package com.oie.messageinspector.shared;

import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class HL7TableData {

    private static final Logger logger = LogManager.getLogger(HL7TableData.class);
    private static volatile Map<String, String> tableNames = Collections.emptyMap();
    private static volatile Map<String, String> tableSinceVersions = Collections.emptyMap();
    private static volatile Map<String, List<InspectorParseResult.TableEntry>> tableValues = Collections.emptyMap();

    static {
        loadTables();
    }

    private HL7TableData() {}

    private static void loadTables() {
        Map<String, String> names = new HashMap<>();
        Map<String, String> sinceVersions = new HashMap<>();
        Map<String, List<InspectorParseResult.TableEntry>> values = new HashMap<>();

        try {
            JsonNode root = readTableJson();
            if (root != null) {
                Iterator<Map.Entry<String, JsonNode>> tables = root.fields();
                while (tables.hasNext()) {
                    Map.Entry<String, JsonNode> entry = tables.next();
                    String tableId = entry.getKey();
                    if (tableId.startsWith("_")) continue;
                    JsonNode tableNode = entry.getValue();

                    String name = tableNode.has("name") ? tableNode.get("name").asText() : "";
                    names.put(tableId, name);

                    if (tableNode.has("since")) {
                        sinceVersions.put(tableId, tableNode.get("since").asText());
                    }

                    List<InspectorParseResult.TableEntry> entries = new ArrayList<>();
                    if (tableNode.has("values")) {
                        for (JsonNode valueNode : tableNode.get("values")) {
                            String code = valueNode.has("code") ? valueNode.get("code").asText() : "";
                            String description = valueNode.has("description") ? valueNode.get("description").asText() : "";
                            InspectorParseResult.TableEntry te = new InspectorParseResult.TableEntry(code, description);
                            if (valueNode.has("status")) {
                                te.setStatus(valueNode.get("status").asText());
                            }
                            if (valueNode.has("deprecated")) {
                                te.setDeprecated(valueNode.get("deprecated").asText());
                            }
                            entries.add(te);
                        }
                    }
                    values.put(tableId, entries);
                }
                logger.info("Loaded {} HL7 tables", names.size());
            }
        } catch (Exception e) {
            logger.error("Failed to load HL7 tables: {}", e.getMessage(), e);
        }

        tableNames = Collections.unmodifiableMap(names);
        tableSinceVersions = Collections.unmodifiableMap(sinceVersions);
        tableValues = Collections.unmodifiableMap(values);
    }

    private static JsonNode readTableJson() throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        File externalFile = findExternalFile();
        if (externalFile != null && externalFile.exists()) {
            logger.info("Loading HL7 tables from: {}", externalFile.getAbsolutePath());
            return mapper.readTree(externalFile);
        }

        try (InputStream is = HL7TableData.class.getResourceAsStream("/hl7-tables.json")) {
            if (is != null) {
                logger.info("Loading HL7 tables from classpath resource");
                return mapper.readTree(is);
            }
        }

        logger.warn("No hl7-tables.json found on filesystem or classpath");
        return null;
    }

    private static File findExternalFile() {
        try {
            File jarFile = new File(HL7TableData.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            return new File(jarFile.getParentFile(), "hl7-tables.json");
        } catch (Exception e) {
            logger.debug("Could not determine extension directory: {}", e.getMessage());
            return null;
        }
    }

    public static synchronized void reload() {
        loadTables();
    }

    public static String getTableName(String tableId) {
        return tableNames.get(tableId);
    }

    public static String getTableSince(String tableId) {
        return tableSinceVersions.get(tableId);
    }

    public static List<InspectorParseResult.TableEntry> getTableValues(String tableId) {
        List<InspectorParseResult.TableEntry> vals = tableValues.get(tableId);
        return vals != null ? vals : Collections.emptyList();
    }

    public static boolean hasTable(String tableId) {
        return tableValues.containsKey(tableId);
    }

    public static Map<String, String> getAllTableNames() {
        return tableNames;
    }
}
