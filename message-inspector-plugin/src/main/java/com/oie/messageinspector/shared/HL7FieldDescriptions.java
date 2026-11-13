/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
package com.oie.messageinspector.shared;

import java.io.File;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class HL7FieldDescriptions {

    private static final Logger logger = LogManager.getLogger(HL7FieldDescriptions.class);

    private static volatile Map<String, Map<String, Map<String, String>>> versionData;
    private static volatile Map<String, Map<String, String>> starData;
    private static volatile boolean loaded = false;

    private HL7FieldDescriptions() {}

    public static String getDescription(String version, String segCode, int fieldNum) {
        ensureLoaded();
        String fieldKey = String.valueOf(fieldNum);

        if (starData != null) {
            Map<String, String> starSeg = starData.get(segCode);
            if (starSeg != null) {
                String desc = starSeg.get(fieldKey);
                if (desc != null) return desc;
            }
        }

        if (versionData != null) {
            Map<String, Map<String, String>> verMap = versionData.get(version);
            if (verMap == null && version.contains(".")) {
                verMap = versionData.get(version.substring(0, version.lastIndexOf('.')));
            }
            if (verMap != null) {
                Map<String, String> segMap = verMap.get(segCode);
                if (segMap != null) {
                    return segMap.get(fieldKey);
                }
            }
        }

        return null;
    }

    private static synchronized void ensureLoaded() {
        if (loaded) return;
        loaded = true;

        Map<String, Map<String, Map<String, String>>> versions = new HashMap<>();
        Map<String, Map<String, String>> star = null;

        try {
            JsonNode root = readJson();
            if (root == null) return;

            Iterator<Map.Entry<String, JsonNode>> fields = root.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String key = entry.getKey();
                if (key.startsWith("_")) continue;

                Map<String, Map<String, String>> segMap = parseSegments(entry.getValue());
                if ("*".equals(key)) {
                    star = segMap;
                } else {
                    versions.put(key, segMap);
                }
            }
            logger.info("Loaded HL7 field descriptions for {} versions ({} in '*')",
                    versions.size(), star != null ? star.size() : 0);
        } catch (Exception e) {
            logger.error("Failed to load HL7 field descriptions: {}", e.getMessage(), e);
        }

        versionData = Collections.unmodifiableMap(versions);
        starData = star;
    }

    private static Map<String, Map<String, String>> parseSegments(JsonNode node) {
        Map<String, Map<String, String>> result = new HashMap<>();
        Iterator<Map.Entry<String, JsonNode>> iter = node.fields();
        while (iter.hasNext()) {
            Map.Entry<String, JsonNode> entry = iter.next();
            Map<String, String> fields = new HashMap<>();
            Iterator<Map.Entry<String, JsonNode>> fIter = entry.getValue().fields();
            while (fIter.hasNext()) {
                Map.Entry<String, JsonNode> fEntry = fIter.next();
                fields.put(fEntry.getKey(), fEntry.getValue().asText());
            }
            result.put(entry.getKey(), Collections.unmodifiableMap(fields));
        }
        return Collections.unmodifiableMap(result);
    }

    private static JsonNode readJson() throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        File externalFile = findExternalFile();
        if (externalFile != null && externalFile.exists()) {
            logger.info("Loading HL7 field descriptions from: {}", externalFile.getAbsolutePath());
            return mapper.readTree(externalFile);
        }

        try (InputStream is = HL7FieldDescriptions.class.getResourceAsStream("/hl7-field-descriptions.json")) {
            if (is != null) {
                logger.info("Loading HL7 field descriptions from classpath resource");
                return mapper.readTree(is);
            }
        }

        logger.warn("No hl7-field-descriptions.json found");
        return null;
    }

    private static File findExternalFile() {
        try {
            File jarFile = new File(HL7FieldDescriptions.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            return new File(jarFile.getParentFile(), "hl7-field-descriptions.json");
        } catch (Exception e) {
            return null;
        }
    }
}
