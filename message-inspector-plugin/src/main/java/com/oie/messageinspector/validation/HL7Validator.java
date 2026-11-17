/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
package com.oie.messageinspector.validation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.AbstractGroup;
import ca.uhn.hl7v2.model.AbstractSegment;
import ca.uhn.hl7v2.model.Composite;
import ca.uhn.hl7v2.model.Message;
import ca.uhn.hl7v2.model.Primitive;
import ca.uhn.hl7v2.model.Structure;
import ca.uhn.hl7v2.model.Type;

public class HL7Validator {

    private static final Logger logger = LogManager.getLogger(HL7Validator.class);

    public List<ValidationResult> validate(Message message) {
        if (message == null) {
            return Collections.emptyList();
        }

        List<ValidationResult> results = new ArrayList<>();

        try {
            if (message instanceof AbstractGroup) {
                validateGroup((AbstractGroup) message, "", results);
            }
        } catch (HL7Exception e) {
            logger.error("Validation failed: {}", e.getClass().getSimpleName());
            results.add(new ValidationResult(
                    ValidationResult.Severity.ERROR, "/",
                    "Validation could not complete: " + e.getMessage()));
        }

        return results;
    }

    private void validateGroup(AbstractGroup group, String pathPrefix, List<ValidationResult> results) throws HL7Exception {
        for (String name : group.getNames()) {
            String path = pathPrefix.isEmpty() ? name : pathPrefix + "." + name;
            boolean required = group.isRequired(name);

            Structure[] reps = group.getAll(name);

            if (required && (reps.length == 0 || isStructureEmpty(reps[0]))) {
                results.add(new ValidationResult(
                        ValidationResult.Severity.ERROR, path,
                        "Required segment/group '" + name + "' is missing or empty"));
            }

            for (Structure rep : reps) {
                if (rep instanceof AbstractGroup) {
                    validateGroup((AbstractGroup) rep, path, results);
                } else if (rep instanceof AbstractSegment) {
                    validateSegment((AbstractSegment) rep, path, results);
                }
            }
        }
    }

    private void validateSegment(AbstractSegment segment, String pathPrefix, List<ValidationResult> results) {
        int numFields = segment.numFields();
        for (int i = 1; i <= numFields; i++) {
            try {
                boolean required = segment.isRequired(i);
                int maxReps = segment.getMaxCardinality(i);
                Type[] reps = segment.getField(i);

                if (required && (reps.length == 0 || isFieldEmpty(reps[0]))) {
                    results.add(new ValidationResult(
                            ValidationResult.Severity.ERROR,
                            pathPrefix + "." + i,
                            "Required field " + pathPrefix + "-" + i + " is missing or empty"));
                }

                if (maxReps > 0 && reps.length > maxReps) {
                    results.add(new ValidationResult(
                            ValidationResult.Severity.WARNING,
                            pathPrefix + "." + i,
                            "Field " + pathPrefix + "-" + i + " has " + reps.length
                                    + " repetitions (max " + maxReps + ")"));
                }
            } catch (HL7Exception e) {
                logger.debug("Could not validate field {}.{}: {}", pathPrefix, i, e.getClass().getSimpleName());
            }
        }
    }

    private boolean isStructureEmpty(Structure structure) {
        if (structure instanceof AbstractSegment) {
            AbstractSegment seg = (AbstractSegment) structure;
            try {
                for (int i = 1; i <= seg.numFields(); i++) {
                    Type[] fields = seg.getField(i);
                    if (fields.length > 0 && !isFieldEmpty(fields[0])) {
                        return false;
                    }
                }
            } catch (HL7Exception e) {
                return true;
            }
            return true;
        }
        return false;
    }

    private boolean isFieldEmpty(Type type) {
        if (type instanceof Primitive) {
            String value = ((Primitive) type).getValue();
            return value == null || value.trim().isEmpty();
        }
        if (type instanceof Composite) {
            Type[] components = ((Composite) type).getComponents();
            for (Type comp : components) {
                if (!isFieldEmpty(comp)) return false;
            }
            return true;
        }
        return true;
    }
}
