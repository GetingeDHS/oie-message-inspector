/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
package com.oie.messageinspector.shared;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class InspectorParseResult {

    private String version;
    private String messageType;
    private String messageDescription;
    private List<TreeNode> tree = new ArrayList<>();
    private ValidationSummary validation;

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public String getMessageDescription() { return messageDescription; }
    public void setMessageDescription(String messageDescription) { this.messageDescription = messageDescription; }

    public List<TreeNode> getTree() { return tree; }
    public void setTree(List<TreeNode> tree) { this.tree = tree; }

    public ValidationSummary getValidation() { return validation; }
    public void setValidation(ValidationSummary validation) { this.validation = validation; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TreeNode {
        private String path;
        private String name;
        private String value;
        private String dataType;
        private Boolean required;
        private String optionality;
        private Boolean valid;
        private String tableId;
        private String tableName;
        private String tableSince;
        private Boolean repeatable;
        private List<TableEntry> tableValues;
        private List<TreeNode> children;

        public Boolean getRepeatable() { return repeatable; }
        public void setRepeatable(Boolean repeatable) { this.repeatable = repeatable; }

        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }

        public String getDataType() { return dataType; }
        public void setDataType(String dataType) { this.dataType = dataType; }

        public Boolean getRequired() { return required; }
        public void setRequired(Boolean required) { this.required = required; }

        public String getOptionality() { return optionality; }
        public void setOptionality(String optionality) { this.optionality = optionality; }

        public Boolean getValid() { return valid; }
        public void setValid(Boolean valid) { this.valid = valid; }

        public String getTableId() { return tableId; }
        public void setTableId(String tableId) { this.tableId = tableId; }

        public String getTableName() { return tableName; }
        public void setTableName(String tableName) { this.tableName = tableName; }

        public String getTableSince() { return tableSince; }
        public void setTableSince(String tableSince) { this.tableSince = tableSince; }

        public List<TableEntry> getTableValues() { return tableValues; }
        public void setTableValues(List<TableEntry> tableValues) { this.tableValues = tableValues; }

        public List<TreeNode> getChildren() { return children; }
        public void setChildren(List<TreeNode> children) { this.children = children; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TableEntry {
        private String code;
        private String description;
        private String status;
        private String deprecated;

        public TableEntry() {}

        public TableEntry(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getDeprecated() { return deprecated; }
        public void setDeprecated(String deprecated) { this.deprecated = deprecated; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ValidationSummary {
        private int errors;
        private int warnings;
        private List<ValidationIssue> issues = new ArrayList<>();

        public int getErrors() { return errors; }
        public void setErrors(int errors) { this.errors = errors; }

        public int getWarnings() { return warnings; }
        public void setWarnings(int warnings) { this.warnings = warnings; }

        public List<ValidationIssue> getIssues() { return issues; }
        public void setIssues(List<ValidationIssue> issues) { this.issues = issues; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ValidationIssue {
        private String severity;
        private String path;
        private String message;

        public ValidationIssue() {}

        public ValidationIssue(String severity, String path, String message) {
            this.severity = severity;
            this.path = path;
            this.message = message;
        }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }

        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
