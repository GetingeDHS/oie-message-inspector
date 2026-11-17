/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
package com.oie.messageinspector.validation;

public class ValidationResult {

    public enum Severity {
        ERROR, WARNING, INFO
    }

    private final Severity severity;
    private final String path;
    private final String message;

    public ValidationResult(Severity severity, String path, String message) {
        this.severity = severity;
        this.path = path;
        this.message = message;
    }

    public Severity getSeverity() { return severity; }
    public String getPath() { return path; }
    public String getMessage() { return message; }
}
