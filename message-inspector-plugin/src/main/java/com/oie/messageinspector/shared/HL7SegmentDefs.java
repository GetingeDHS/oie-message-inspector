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
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class HL7SegmentDefs {

    private static final Logger logger = LogManager.getLogger(HL7SegmentDefs.class);

    private static volatile Map<String, Map<String, SegmentDef>> versionData = Collections.emptyMap();
    private static volatile Map<String, Map<String, List<ComponentDef>>> componentData = Collections.emptyMap();

    static {
        loadDefs();
    }

    private HL7SegmentDefs() {}

    public static class FieldDef {
        public final String name;
        public final String optionality;
        public final String dataType;
        public final String tableId;
        public final boolean repeatable;
        public final int maxLength;

        public FieldDef(String name, String optionality, String dataType, String tableId, boolean repeatable, int maxLength) {
            this.name = name;
            this.optionality = optionality;
            this.dataType = dataType;
            this.tableId = tableId;
            this.repeatable = repeatable;
            this.maxLength = maxLength;
        }
    }

    public static class SegmentDef {
        public final String description;
        public final Map<Integer, FieldDef> fields;

        public SegmentDef(String description, Map<Integer, FieldDef> fields) {
            this.description = description;
            this.fields = Collections.unmodifiableMap(fields);
        }
    }

    public static class ComponentDef {
        public final int seq;
        public final String name;
        public final String optionality;
        public final String tableId;

        public ComponentDef(int seq, String name, String optionality, String tableId) {
            this.seq = seq;
            this.name = name;
            this.optionality = optionality;
            this.tableId = tableId;
        }
    }

    private static void loadDefs() {
        Map<String, Map<String, SegmentDef>> versions = new HashMap<>();
        Map<String, Map<String, List<ComponentDef>>> components = new HashMap<>();

        try {
            JsonNode root = readDefsJson();
            if (root == null) return;

            Iterator<Map.Entry<String, JsonNode>> fields = root.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String key = entry.getKey();
                if (key.startsWith("_")) {
                    if ("_components".equals(key)) {
                        parseComponents(entry.getValue(), components);
                    } else if ("_z".equals(key)) {
                        versions.put("_z", parseVersion(entry.getValue()));
                    }
                    continue;
                }
                versions.put(key, parseVersion(entry.getValue()));
            }
            logger.info("Loaded HL7 segment definitions for {} versions, {} component types",
                    versions.size(), components.size());
        } catch (Exception e) {
            logger.error("Failed to load HL7 segment definitions: {}", e.getMessage(), e);
        }

        versionData = Collections.unmodifiableMap(versions);
        componentData = Collections.unmodifiableMap(components);
    }

    private static Map<String, SegmentDef> parseVersion(JsonNode versionNode) {
        Map<String, SegmentDef> segments = new HashMap<>();
        Iterator<Map.Entry<String, JsonNode>> segIter = versionNode.fields();
        while (segIter.hasNext()) {
            Map.Entry<String, JsonNode> segEntry = segIter.next();
            String segCode = segEntry.getKey();
            JsonNode segNode = segEntry.getValue();

            String desc = segNode.has("description") ? segNode.get("description").asText() : segCode;
            Map<Integer, FieldDef> fieldDefs = new HashMap<>();

            JsonNode fieldsNode = segNode.get("fields");
            if (fieldsNode != null) {
                Iterator<Map.Entry<String, JsonNode>> fIter = fieldsNode.fields();
                while (fIter.hasNext()) {
                    Map.Entry<String, JsonNode> fEntry = fIter.next();
                    int fieldNum = Integer.parseInt(fEntry.getKey());
                    JsonNode fn = fEntry.getValue();

                    String name = fn.has("name") ? fn.get("name").asText() : segCode + "." + fieldNum;
                    String opt = fn.has("opt") ? fn.get("opt").asText() : "O";
                    String type = fn.has("type") ? fn.get("type").asText() : null;
                    String table = fn.has("table") ? fn.get("table").asText() : null;
                    boolean rep = fn.has("rep") && fn.get("rep").asBoolean();
                    int len = fn.has("len") ? fn.get("len").asInt() : 0;

                    fieldDefs.put(fieldNum, new FieldDef(name, opt, type, table, rep, len));
                }
            }
            segments.put(segCode, new SegmentDef(desc, fieldDefs));
        }
        return Collections.unmodifiableMap(segments);
    }

    private static void parseComponents(JsonNode compNode, Map<String, Map<String, List<ComponentDef>>> components) {
        Iterator<Map.Entry<String, JsonNode>> typeIter = compNode.fields();
        while (typeIter.hasNext()) {
            Map.Entry<String, JsonNode> typeEntry = typeIter.next();
            String dataType = typeEntry.getKey();
            JsonNode typeNode = typeEntry.getValue();
            Map<String, List<ComponentDef>> versionMap = new HashMap<>();

            if (typeNode.isArray()) {
                List<ComponentDef> defs = parseComponentList(typeNode);
                versionMap.put("*", defs);
            } else {
                Iterator<Map.Entry<String, JsonNode>> verIter = typeNode.fields();
                while (verIter.hasNext()) {
                    Map.Entry<String, JsonNode> verEntry = verIter.next();
                    versionMap.put(verEntry.getKey(), parseComponentList(verEntry.getValue()));
                }
            }
            components.put(dataType, Collections.unmodifiableMap(versionMap));
        }
    }

    private static List<ComponentDef> parseComponentList(JsonNode arrayNode) {
        List<ComponentDef> list = new ArrayList<>();
        for (JsonNode cn : arrayNode) {
            int seq = cn.has("seq") ? cn.get("seq").asInt() : 0;
            String name = cn.has("name") ? cn.get("name").asText() : "Component " + seq;
            String opt = cn.has("opt") ? cn.get("opt").asText() : "O";
            String table = cn.has("table") ? cn.get("table").asText() : null;
            list.add(new ComponentDef(seq, name, opt, table));
        }
        return Collections.unmodifiableList(list);
    }

    private static JsonNode readDefsJson() throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        File externalFile = findExternalFile();
        if (externalFile != null && externalFile.exists()) {
            logger.info("Loading HL7 segment definitions from: {}", externalFile.getAbsolutePath());
            return mapper.readTree(externalFile);
        }

        try (InputStream is = HL7SegmentDefs.class.getResourceAsStream("/hl7-segment-definitions.json")) {
            if (is != null) {
                logger.info("Loading HL7 segment definitions from classpath resource");
                return mapper.readTree(is);
            }
        }

        logger.warn("No hl7-segment-definitions.json found");
        return null;
    }

    private static File findExternalFile() {
        try {
            File jarFile = new File(HL7SegmentDefs.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            return new File(jarFile.getParentFile(), "hl7-segment-definitions.json");
        } catch (Exception e) {
            return null;
        }
    }

    public static FieldDef getFieldDef(String version, String segCode, int fieldNum) {
        Map<String, SegmentDef> segs = resolveVersion(version);
        SegmentDef seg = segs != null ? segs.get(segCode) : null;
        if (seg == null) {
            Map<String, SegmentDef> zSegs = versionData.get("_z");
            seg = zSegs != null ? zSegs.get(segCode) : null;
        }
        if (seg == null) return null;
        return seg.fields.get(fieldNum);
    }

    public static SegmentDef getSegmentDef(String version, String segCode) {
        Map<String, SegmentDef> segs = resolveVersion(version);
        SegmentDef seg = segs != null ? segs.get(segCode) : null;
        if (seg == null) {
            Map<String, SegmentDef> zSegs = versionData.get("_z");
            seg = zSegs != null ? zSegs.get(segCode) : null;
        }
        return seg;
    }

    public static List<ComponentDef> getComponentDefs(String version, String dataType) {
        Map<String, List<ComponentDef>> vmap = componentData.get(dataType);
        if (vmap == null) return null;
        List<ComponentDef> defs = vmap.get("*");
        if (defs != null) return defs;
        defs = vmap.get(version);
        if (defs != null) return defs;
        String baseVersion = version.contains(".") ? version.substring(0, version.lastIndexOf('.')) : version;
        defs = vmap.get(baseVersion);
        if (defs != null) return defs;
        if (!vmap.isEmpty()) return vmap.values().iterator().next();
        return null;
    }

    private static Map<String, SegmentDef> resolveVersion(String version) {
        Map<String, SegmentDef> segs = versionData.get(version);
        if (segs != null) return segs;
        String baseVersion = version.contains(".") ? version.substring(0, version.lastIndexOf('.')) : version;
        return versionData.get(baseVersion);
    }
}
