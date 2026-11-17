/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
package com.oie.messageinspector.server;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import ca.uhn.hl7v2.DefaultHapiContext;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.model.AbstractGroup;
import ca.uhn.hl7v2.model.AbstractSegment;
import ca.uhn.hl7v2.model.Composite;
import ca.uhn.hl7v2.model.Group;
import ca.uhn.hl7v2.model.Message;
import ca.uhn.hl7v2.model.Structure;
import ca.uhn.hl7v2.model.Type;
import ca.uhn.hl7v2.model.Varies;
import ca.uhn.hl7v2.model.primitive.ID;
import ca.uhn.hl7v2.model.primitive.IS;
import ca.uhn.hl7v2.parser.PipeParser;

import com.oie.messageinspector.shared.HL7SegmentDefs;
import com.oie.messageinspector.shared.HL7TableData;
import com.oie.messageinspector.shared.InspectorParseResult;
import com.oie.messageinspector.shared.InspectorParseResult.TreeNode;
import com.oie.messageinspector.shared.InspectorParseResult.ValidationSummary;
import com.oie.messageinspector.shared.InspectorParseResult.ValidationIssue;
import com.oie.messageinspector.validation.HL7Validator;
import com.oie.messageinspector.validation.ValidationResult;

/**
 * Stateless parse engine that converts a raw HL7v2 pipe-delimited message
 * into an {@link InspectorParseResult}.  All methods are static so the
 * engine can be called from both the REST servlet and from
 * {@code ServicePlugin.invoke()}.
 */
public final class InspectorParseEngine {

    private static final Logger logger = LogManager.getLogger(InspectorParseEngine.class);

    private InspectorParseEngine() { /* utility class */ }

    private static final Map<String, String[]> COMPONENT_TYPES;
    static {
        COMPONENT_TYPES = new HashMap<>();
        COMPONENT_TYPES.put("XPN", new String[]{"FN", null, null, null, null, null, null, null, null, null, null, null, null, null});
        COMPONENT_TYPES.put("XCN", new String[]{null, "FN", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "FN"});
        COMPONENT_TYPES.put("CX",  new String[]{null, null, null, "HD", null, "HD"});
        COMPONENT_TYPES.put("EI",  new String[]{null, null, null, null});
        COMPONENT_TYPES.put("PL",  new String[]{null, null, null, "HD", null, null, null, null, null, null, null});
        COMPONENT_TYPES.put("XAD", new String[]{null, null, null, null, null, null, null, null, null, null, null, null, null, null});
        COMPONENT_TYPES.put("XON", new String[]{null, null, null, null, null, "HD", null, null, null, null});
        COMPONENT_TYPES.put("CQ",  new String[]{null, "CWE"});
    }

    // ------------------------------------------------------------------
    //  Public entry point
    // ------------------------------------------------------------------

    public static InspectorParseResult parse(String hl7Message) throws Exception {
        if (hl7Message == null || hl7Message.trim().isEmpty()) {
            throw new IllegalArgumentException("Message body is empty");
        }

        String normalizedMessage = hl7Message.trim().replace('\n', '\r').replaceAll("\r\r+", "\r");
        if (normalizedMessage.endsWith("\r")) {
            normalizedMessage = normalizedMessage.substring(0, normalizedMessage.length() - 1);
        }
        if (normalizedMessage.startsWith("\r")) {
            normalizedMessage = normalizedMessage.substring(1);
        }

        if (!normalizedMessage.startsWith("MSH|") && !normalizedMessage.startsWith("FHS|") && !normalizedMessage.startsWith("BHS|")) {
            throw new IllegalArgumentException("Message must start with MSH|, FHS|, or BHS| — found: '"
                    + normalizedMessage.substring(0, Math.min(normalizedMessage.length(), 20)) + "...'");
        }

        String version;
        String messageType = extractMessageType(normalizedMessage);
        Message hapiMessage = null;

        HapiContext context = new DefaultHapiContext();
        PipeParser parser = context.getPipeParser();
        parser.getParserConfiguration().setValidating(false);
        try {
            hapiMessage = parser.parse(normalizedMessage);
            version = hapiMessage.getVersion();
        } catch (Exception hapiEx) {
            logger.warn("HAPI parse failed, falling back to manual parsing: {}", hapiEx.getClass().getSimpleName());
            version = extractVersion(normalizedMessage);
            if (version == null) version = "2.5";
        }

        Object vocabulary = createVocabulary(version, messageType);
        String messageDescription = getMessageDescription(version, messageType);

        InspectorParseResult result = new InspectorParseResult();
        result.setVersion(version);
        result.setMessageType(messageType);
        result.setMessageDescription(messageDescription);

        List<ValidationIssue> allIssues = new ArrayList<>();
        List<TreeNode> tree;
        try {
            tree = buildTreeFromMessage(normalizedMessage, vocabulary, hapiMessage, version, allIssues);
        } catch (Exception treeEx) {
            logger.error("Tree building failed: {} at {}", treeEx.getClass().getSimpleName(), getExceptionLocation(treeEx));
            tree = new ArrayList<>();
            allIssues.add(new ValidationIssue("ERROR", "/",
                    "Tree building failed: " + treeEx.getClass().getSimpleName() + " — " + getExceptionLocation(treeEx)));
        }
        result.setTree(tree);

        if (hapiMessage != null) {
            try {
                HL7Validator validator = new HL7Validator();
                List<ValidationResult> validationResults = validator.validate(hapiMessage);
                for (ValidationResult vr : validationResults) {
                    allIssues.add(new ValidationIssue(vr.getSeverity().name(), vr.getPath(), vr.getMessage()));
                }
            } catch (Exception valEx) {
                logger.warn("HAPI validation failed: {}", valEx.getClass().getSimpleName());
                allIssues.add(new ValidationIssue("WARNING", "/",
                        "Structural validation skipped: " + valEx.getMessage()));
            }
        }

        ValidationSummary summary = new ValidationSummary();
        int errors = 0, warnings = 0;
        for (ValidationIssue vi : allIssues) {
            if ("ERROR".equals(vi.getSeverity())) errors++;
            else if ("WARNING".equals(vi.getSeverity())) warnings++;
        }
        summary.setErrors(errors);
        summary.setWarnings(warnings);
        summary.setIssues(allIssues);
        result.setValidation(summary);

        return result;
    }

    // ------------------------------------------------------------------
    //  Private helpers (all static)
    // ------------------------------------------------------------------

    private static String extractMessageType(String message) {
        String[] segments = message.split("\r");
        if (segments.length > 0 && segments[0].startsWith("MSH")) {
            String[] fields = segments[0].split("\\|");
            if (fields.length > 9) {
                return fields[8];
            }
        }
        return "Unknown";
    }

    private static String extractVersion(String message) {
        String[] segments = message.split("\r");
        if (segments.length > 0 && segments[0].startsWith("MSH")) {
            String[] fields = segments[0].split("\\|");
            if (fields.length > 11 && !fields[11].isEmpty()) {
                return fields[11];
            }
        }
        return null;
    }

    /**
     * Load HL7v2Vocabulary via reflection — the class is on the OIE server classpath
     * at runtime but not available as a compile-time Maven dependency.
     */
    private static Object createVocabulary(String version, String messageType) {
        try {
            Class<?> vocabClass = Class.forName("com.mirth.connect.plugins.datatypes.hl7v2.HL7v2Vocabulary");
            return vocabClass.getConstructor(String.class, String.class)
                    .newInstance(version, messageType.replaceAll("[\\^~]", ""));
        } catch (Exception e) {
            logger.debug("HL7v2Vocabulary not available, descriptions will be limited: {}", e.getMessage());
            return null;
        }
    }

    private static String getVocabDescription(Object vocabulary, String elementId) {
        if (vocabulary == null) return "";
        try {
            Method getDescription = vocabulary.getClass().getMethod("getDescription", String.class);
            String desc = (String) getDescription.invoke(vocabulary, elementId);
            return desc != null ? desc : "";
        } catch (Exception e) {
            return "";
        }
    }

    private static String getMessageDescription(String version, String messageType) {
        try {
            Class<?> componentClass = Class.forName("com.mirth.connect.model.hl7v2.Component");
            Method method = componentClass.getMethod("getMessageDescription", String.class, String.class);
            String versionKey = version.replaceAll("\\.", "");
            String typeKey = messageType.replace("^", "").replace("~", "");
            String desc = (String) method.invoke(null, versionKey, typeKey);
            return desc != null ? desc : "";
        } catch (Exception e) {
            logger.debug("No message description for {} v{}", messageType, version);
            return "";
        }
    }

    private static List<TreeNode> buildTreeFromMessage(String hl7Message, Object vocabulary, Message hapiMessage, String version, List<ValidationIssue> issues) {
        List<TreeNode> tree = new ArrayList<>();

        String[] segments = hl7Message.split("\r");
        for (String segmentStr : segments) {
            if (segmentStr.trim().isEmpty()) continue;

            String segmentName = segmentStr.length() >= 3 ? segmentStr.substring(0, 3) : segmentStr;

            try {

            HL7SegmentDefs.SegmentDef segDef = HL7SegmentDefs.getSegmentDef(version, segmentName);
            String segmentDescription = segDef != null ? segDef.description : getVocabDescription(vocabulary, segmentName);

            TreeNode segmentNode = new TreeNode();
            segmentNode.setPath(segmentName);
            segmentNode.setName(!segmentDescription.isEmpty() ? segmentDescription : segmentName);

            AbstractSegment hapiSegment = findHapiSegment(hapiMessage, segmentName);

            Boolean segmentRequired = isSegmentRequired(hapiMessage, segmentName);
            if (segmentRequired != null) {
                segmentNode.setRequired(segmentRequired);
            }

            String[] fields = segmentStr.split("\\|", -1);

            List<TreeNode> fieldNodes = new ArrayList<>();
            for (int i = 1; i < fields.length; i++) {
                int fieldNum = "MSH".equals(segmentName) ? i + 1 : i;

                String fieldPath = segmentName + "." + fieldNum;
                HL7SegmentDefs.FieldDef fieldDef = HL7SegmentDefs.getFieldDef(version, segmentName, fieldNum);

                String fieldDescription;
                if (fieldDef != null) {
                    fieldDescription = fieldDef.name;
                } else {
                    fieldDescription = getVocabDescription(vocabulary, fieldPath);
                }

                int fieldTableNum = 0;
                String fieldTableStr = null;
                if (fieldDef != null && fieldDef.tableId != null) {
                    try { fieldTableNum = Integer.parseInt(fieldDef.tableId); } catch (NumberFormatException e) {
                        fieldTableStr = fieldDef.tableId;
                    }
                }
                if (fieldTableNum <= 0 && hapiSegment != null) {
                    try {
                        Type[] fieldTypes = hapiSegment.getField(fieldNum);
                        if (fieldTypes != null && fieldTypes.length > 0) {
                            Type fieldType = fieldTypes[0];
                            fieldTableNum = getTableNumber(fieldType);
                            if (fieldTableNum <= 0) {
                                fieldTableNum = getTableFromSegmentDefinition(hapiSegment, fieldNum);
                            }
                        }
                    } catch (Exception ignored) {}
                }

                String fieldDataType = fieldDef != null ? fieldDef.dataType : null;
                if (fieldDataType == null && hapiSegment != null) {
                    try {
                        Type[] fieldTypes = hapiSegment.getField(fieldNum);
                        if (fieldTypes != null && fieldTypes.length > 0) {
                            fieldDataType = unwrapVaries(fieldTypes[0]).getName();
                        }
                    } catch (Exception ignored) {}
                }

                if (fieldTableNum <= 0 && hapiSegment != null) {
                    String hapiName = getHapiFieldName(hapiSegment, fieldNum);
                    if (hapiName != null) {
                        fieldTableNum = guessTableFromFieldName(hapiName);
                    }
                }

                boolean isRepeatable = fieldDef != null && fieldDef.repeatable;
                String[] repetitions = fields[i].split("~", -1);
                boolean hasRepetitions = repetitions.length > 1;

                TreeNode fieldNode = new TreeNode();
                fieldNode.setPath(fieldPath);
                fieldNode.setName(!fieldDescription.isEmpty() ? fieldDescription : fieldPath);
                fieldNode.setValue(fields[i]);
                if (fieldDataType != null) {
                    fieldNode.setDataType(fieldDataType);
                }

                if (fieldDef != null) {
                    fieldNode.setOptionality(fieldDef.optionality);
                    fieldNode.setRequired("R".equals(fieldDef.optionality) || "RE".equals(fieldDef.optionality));
                    if (isRepeatable) {
                        fieldNode.setRepeatable(true);
                    }
                } else if (hapiSegment != null) {
                    try {
                        boolean req = hapiSegment.isRequired(fieldNum);
                        fieldNode.setRequired(req);
                        fieldNode.setOptionality(req ? "R" : "O");
                    } catch (Exception ignored) {}
                }

                if (fieldTableNum > 0) {
                    applyTableData(fieldNode, fieldTableNum);
                } else if (fieldTableStr != null) {
                    applyTableData(fieldNode, fieldTableStr);
                }

                validateField(fieldNode, fieldDef, fields[i], fieldPath, fieldTableNum, fieldTableStr, fieldDataType, issues);

                if (hasRepetitions) {
                    List<TreeNode> repNodes = new ArrayList<>();
                    for (int r = 0; r < repetitions.length; r++) {
                        String repPath = fieldPath + "[" + (r + 1) + "]";
                        TreeNode repNode = new TreeNode();
                        repNode.setPath(repPath);
                        repNode.setName((!fieldDescription.isEmpty() ? fieldDescription : fieldPath) + " #" + (r + 1));
                        repNode.setValue(repetitions[r]);
                        if (fieldDataType != null) repNode.setDataType(fieldDataType);
                        if (fieldTableNum > 0) applyTableData(repNode, fieldTableNum);
                        else if (fieldTableStr != null) applyTableData(repNode, fieldTableStr);

                        buildComponentNodes(repNode, repetitions[r], fieldPath, fieldDataType, fieldTableNum, version, vocabulary, issues,
                                fieldDef != null && "R".equals(fieldDef.optionality));
                        repNodes.add(repNode);
                    }
                    fieldNode.setChildren(repNodes);
                } else {
                    buildComponentNodes(fieldNode, fields[i], fieldPath, fieldDataType, fieldTableNum, version, vocabulary, issues,
                            fieldDef != null && "R".equals(fieldDef.optionality));
                }

                fieldNodes.add(fieldNode);
            }

            segmentNode.setChildren(fieldNodes);
            tree.add(segmentNode);

            } catch (Exception segEx) {
                logger.warn("Failed to process segment '{}': {} at {}", segmentName,
                        segEx.getClass().getSimpleName(), getExceptionLocation(segEx));
                TreeNode errorNode = new TreeNode();
                errorNode.setPath(segmentName);
                errorNode.setName(segmentName + " (parse error: " + segEx.getClass().getSimpleName()
                        + " at " + getExceptionLocation(segEx) + ")");
                errorNode.setValue(segmentStr);
                tree.add(errorNode);
                issues.add(new ValidationIssue("ERROR", segmentName,
                        "Segment parse error: " + segEx.getClass().getSimpleName() + " at " + getExceptionLocation(segEx)));
            }
        }

        return tree;
    }

    private static void buildSubComponentNodes(TreeNode compNode, String rawValue, String compPath,
                                         List<HL7SegmentDefs.ComponentDef> subDefs, String version) {
        if (rawValue == null || !rawValue.contains("&")) return;
        String[] subComps = rawValue.split("&", -1);
        List<TreeNode> subNodes = new ArrayList<>();
        for (int k = 0; k < subComps.length; k++) {
            TreeNode subNode = new TreeNode();
            subNode.setPath(compPath + "." + (k + 1));
            subNode.setValue(subComps[k]);
            if (k < subDefs.size()) {
                HL7SegmentDefs.ComponentDef sd = subDefs.get(k);
                subNode.setName(sd.name);
                subNode.setOptionality(sd.optionality);
                if (sd.tableId != null) {
                    try {
                        int t = Integer.parseInt(sd.tableId);
                        if (t > 0) applyTableData(subNode, t);
                    } catch (NumberFormatException ignored) {}
                }
            } else {
                subNode.setName(compPath + "." + (k + 1));
            }
            subNodes.add(subNode);
        }
        compNode.setChildren(subNodes);
    }

    private static String getComponentDataType(String parentDataType, int componentIndex) {
        if (parentDataType == null) return null;
        String[] types = COMPONENT_TYPES.get(parentDataType);
        if (types != null && componentIndex < types.length) {
            return types[componentIndex];
        }
        return null;
    }

    private static void validateField(TreeNode fieldNode, HL7SegmentDefs.FieldDef fieldDef, String rawValue,
                               String fieldPath, int fieldTableNum, String fieldTableStr, String fieldDataType, List<ValidationIssue> issues) {
        String trimmedValue = rawValue != null ? rawValue.replace("~", "").replace("^", "").trim() : "";
        boolean isEmpty = trimmedValue.isEmpty();

        if (fieldDef != null && "R".equals(fieldDef.optionality) && isEmpty) {
            fieldNode.setValid(false);
            issues.add(new ValidationIssue("ERROR", fieldPath,
                    "Required field " + fieldPath + " (" + fieldDef.name + ") is empty"));
        }

        String effectiveTableId = fieldTableNum > 0 ? String.format("%04d", fieldTableNum) : fieldTableStr;
        if (!isEmpty && effectiveTableId != null) {
            boolean isCoded = "CWE".equals(fieldDataType) || "CE".equals(fieldDataType)
                    || "CNE".equals(fieldDataType) || "CF".equals(fieldDataType);
            boolean isSimpleCoded = "ID".equals(fieldDataType) || "IS".equals(fieldDataType);

            if (isCoded) {
                String firstRep = rawValue.contains("~") ? rawValue.substring(0, rawValue.indexOf("~")) : rawValue;
                String[] comps = firstRep.split("\\^", -1);
                String identifier = comps.length > 0 ? comps[0].trim() : "";
                String codingSystem = comps.length > 2 ? comps[2].trim() : "";

                if (!identifier.isEmpty() && !codingSystem.isEmpty()) {
                    boolean isHL7System = codingSystem.toUpperCase().startsWith("HL7");
                    if (!isHL7System) {
                        return;
                    }
                }
                if (!identifier.isEmpty()) {
                    checkAgainstTable(identifier, fieldPath, effectiveTableId, issues);
                }
            } else if (isSimpleCoded || fieldDataType == null) {
                String checkValue = rawValue;
                if (checkValue.contains("~")) checkValue = checkValue.substring(0, checkValue.indexOf("~"));
                if (checkValue.contains("^")) checkValue = checkValue.substring(0, checkValue.indexOf("^"));
                checkValue = checkValue.trim();
                if (!checkValue.isEmpty()) {
                    checkAgainstTable(checkValue, fieldPath, effectiveTableId, issues);
                }
            }
        }

        if (!isEmpty && fieldDef != null && fieldDef.maxLength > 0) {
            String lenValue = rawValue;
            if (lenValue.contains("~")) lenValue = lenValue.substring(0, lenValue.indexOf("~"));
            boolean isComposite = "CWE".equals(fieldDataType) || "CE".equals(fieldDataType)
                    || "CNE".equals(fieldDataType) || "CF".equals(fieldDataType)
                    || "DR".equals(fieldDataType);
            if (isComposite && lenValue.contains("^")) {
                lenValue = lenValue.substring(0, lenValue.indexOf("^"));
            }
            if (lenValue.length() > fieldDef.maxLength) {
                issues.add(new ValidationIssue("WARNING", fieldPath,
                        "Value length " + lenValue.length() + " exceeds max " + fieldDef.maxLength
                                + " for " + fieldPath + " (" + fieldDef.name + ")"));
            }
        }
    }

    private static void checkAgainstTable(String value, String fieldPath, String tableId, List<ValidationIssue> issues) {
        List<InspectorParseResult.TableEntry> entries = HL7TableData.getTableValues(tableId);
        if (entries != null && !entries.isEmpty()) {
            boolean found = false;
            for (InspectorParseResult.TableEntry e : entries) {
                if (value.equals(e.getCode())) { found = true; break; }
            }
            if (!found) {
                String tableName = HL7TableData.getTableName(tableId);
                issues.add(new ValidationIssue("WARNING", fieldPath,
                        "Value '" + value + "' not found in Table " + tableId
                                + (tableName != null ? " (" + tableName + ")" : "")));
            }
        }
    }

    private static String getExceptionLocation(Exception e) {
        for (StackTraceElement ste : e.getStackTrace()) {
            if (ste.getClassName().startsWith("com.oie.messageinspector.")) {
                return ste.getClassName().substring(ste.getClassName().lastIndexOf('.') + 1)
                        + "." + ste.getMethodName() + ":" + ste.getLineNumber();
            }
        }
        StackTraceElement[] frames = e.getStackTrace();
        if (frames.length > 0) {
            return frames[0].getClassName() + "." + frames[0].getMethodName() + ":" + frames[0].getLineNumber();
        }
        return "unknown";
    }

    private static AbstractSegment findHapiSegment(Message message, String segmentName) {
        if (message == null) return null;
        try {
            Structure structure = message.get(segmentName);
            if (structure instanceof AbstractSegment) {
                return (AbstractSegment) structure;
            }
        } catch (Exception ignored) {}
        return null;
    }

    private static void buildComponentNodes(TreeNode parentNode, String rawValue, String fieldPath,
                                      String fieldDataType, int fieldTableNum, String version,
                                      Object vocabulary, List<ValidationIssue> issues, boolean fieldIsRequired) {
        List<HL7SegmentDefs.ComponentDef> compDefs =
                fieldDataType != null ? HL7SegmentDefs.getComponentDefs(version, fieldDataType) : null;

        if (rawValue != null && rawValue.contains("^")) {
            String[] components = rawValue.split("\\^", -1);
            List<TreeNode> componentNodes = new ArrayList<>();

            for (int j = 0; j < components.length; j++) {
                String compPath = fieldPath + "." + (j + 1);

                TreeNode compNode = new TreeNode();
                compNode.setPath(compPath);
                compNode.setValue(components[j]);

                HL7SegmentDefs.ComponentDef compDef = null;
                if (compDefs != null && j < compDefs.size()) {
                    compDef = compDefs.get(j);
                }

                if (compDef != null) {
                    compNode.setName(compDef.name);
                    compNode.setOptionality(compDef.optionality);
                    if (compDef.tableId != null) {
                        try {
                            int compTableNum = Integer.parseInt(compDef.tableId);
                            if (compTableNum > 0) {
                                applyTableData(compNode, compTableNum);
                            }
                        } catch (NumberFormatException e) {
                            applyTableData(compNode, compDef.tableId);
                        }
                    }
                } else {
                    String compDescription = getVocabDescription(vocabulary, compPath);
                    compNode.setName(!compDescription.isEmpty() ? compDescription : compPath);
                }

                if (compNode.getTableId() == null && j == 0 && fieldTableNum > 0) {
                    applyTableData(compNode, fieldTableNum);
                }

                if (components[j].contains("&")) {
                    String compDataType = getComponentDataType(fieldDataType, j);
                    List<HL7SegmentDefs.ComponentDef> subDefs = null;
                    if (compDataType != null) {
                        subDefs = HL7SegmentDefs.getComponentDefs(version, compDataType);
                    }
                    if (subDefs != null && !subDefs.isEmpty()) {
                        compNode.setDataType(compDataType);
                    } else {
                        subDefs = new ArrayList<>();
                    }
                    buildSubComponentNodes(compNode, components[j], fieldPath + "." + (j + 1), subDefs, version);
                }

                componentNodes.add(compNode);
            }
            parentNode.setChildren(componentNodes);
        }

        if (compDefs != null && issues != null) {
            String fieldContent = rawValue != null ? rawValue.replace("^", "").replace("~", "").replace("&", "").trim() : "";
            if (!fieldContent.isEmpty()) {
                String[] parts = rawValue.split("\\^", -1);
                for (int j = 0; j < compDefs.size(); j++) {
                    HL7SegmentDefs.ComponentDef cd = compDefs.get(j);
                    if ("R".equals(cd.optionality)) {
                        String val = (j < parts.length) ? parts[j].trim() : "";
                        if (val.isEmpty()) {
                            String compPath = fieldPath + "." + (j + 1);
                            String severity = fieldIsRequired ? "ERROR" : "WARNING";
                        issues.add(new ValidationIssue(severity, compPath,
                                    "Required component " + compPath + " (" + cd.name + ") is empty"));
                        }
                    }
                }
            }
        }
    }

    private static Boolean isSegmentRequired(Message message, String segmentName) {
        if (!(message instanceof Group)) return null;
        try {
            String[] names = ((Group) message).getNames();
            for (String name : names) {
                if (name.equals(segmentName)) {
                    return ((AbstractGroup) message).isRequired(name);
                }
            }
            return findSegmentRequiredInGroups((Group) message, segmentName);
        } catch (Exception ignored) {}
        return null;
    }

    private static Boolean findSegmentRequiredInGroups(Group group, String segmentName) {
        try {
            String[] names = group.getNames();
            for (String name : names) {
                Structure[] structures = group.getAll(name);
                if (structures.length > 0 && structures[0] instanceof Group) {
                    Group childGroup = (Group) structures[0];
                    String[] childNames = childGroup.getNames();
                    for (String childName : childNames) {
                        if (childName.equals(segmentName)) {
                            return ((AbstractGroup) childGroup).isRequired(childName);
                        }
                    }
                    Boolean found = findSegmentRequiredInGroups(childGroup, segmentName);
                    if (found != null) return found;
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private static Type unwrapVaries(Type type) {
        while (type instanceof Varies) {
            type = ((Varies) type).getData();
        }
        return type;
    }

    private static int getTableNumber(Type type) {
        if (type instanceof IS) {
            return ((IS) type).getTable();
        }
        if (type instanceof ID) {
            return ((ID) type).getTable();
        }
        if (type instanceof Composite) {
            Type[] components = ((Composite) type).getComponents();
            if (components != null && components.length > 0) {
                return getTableNumber(components[0]);
            }
        }
        if (type instanceof Varies) {
            return getTableNumber(((Varies) type).getData());
        }
        return 0;
    }

    private static void applyTableData(TreeNode node, int tableNum) {
        applyTableData(node, String.format("%04d", tableNum));
    }

    private static void applyTableData(TreeNode node, String tableId) {
        node.setTableId(tableId);
        String tableName = HL7TableData.getTableName(tableId);
        if (tableName != null) {
            node.setTableName(tableName);
            node.setTableValues(new ArrayList<>(HL7TableData.getTableValues(tableId)));
            String since = HL7TableData.getTableSince(tableId);
            if (since != null) {
                node.setTableSince(since);
            }
        }
    }

    private static int getTableFromSegmentDefinition(AbstractSegment segment, int fieldNum) {
        try {
            Method getArgs = AbstractSegment.class.getDeclaredMethod("getArgs", int.class);
            getArgs.setAccessible(true);
            Object[] args = (Object[]) getArgs.invoke(segment, fieldNum - 1);
            if (args != null && args.length >= 2 && args[1] instanceof Integer) {
                int table = (Integer) args[1];
                if (table > 0) return table;
            }
        } catch (Exception e) {
            logger.debug("Could not extract table from segment definition: {}", e.getMessage());
        }
        return 0;
    }

    @SuppressWarnings("unchecked")
    private static String getHapiFieldName(AbstractSegment segment, int fieldNum) {
        try {
            Field namesField = AbstractSegment.class.getDeclaredField("names");
            namesField.setAccessible(true);
            List<String> names = (List<String>) namesField.get(segment);
            int idx = fieldNum - 1;
            if (idx >= 0 && idx < names.size()) {
                return names.get(idx);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private static int guessTableFromFieldName(String fieldName) {
        if (fieldName == null || fieldName.length() < 4) return 0;
        String lowerField = fieldName.toLowerCase();

        Map<String, String> allNames = HL7TableData.getAllTableNames();
        int bestTable = 0;
        int bestScore = 0;

        for (Map.Entry<String, String> entry : allNames.entrySet()) {
            String tableName = entry.getValue();
            if (tableName.length() < 4) continue;
            String lowerTable = tableName.toLowerCase();

            int score = 0;
            if (lowerField.contains(lowerTable)) {
                score = lowerTable.length();
            } else if (lowerTable.contains(lowerField)) {
                score = lowerField.length();
            }
            if (score > bestScore) {
                bestScore = score;
                try {
                    bestTable = Integer.parseInt(entry.getKey());
                } catch (NumberFormatException ignored) {}
            }
        }
        return bestTable;
    }
}
