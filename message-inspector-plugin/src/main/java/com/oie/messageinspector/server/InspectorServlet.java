/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
package com.oie.messageinspector.server;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.SecurityContext;

import com.mirth.connect.client.core.ClientException;
import com.mirth.connect.server.api.MirthServlet;

import com.oie.messageinspector.shared.HL7FieldDescriptions;
import com.oie.messageinspector.shared.InspectorParseResult;

public class InspectorServlet extends MirthServlet implements InspectorServletInterface {

    public InspectorServlet(@Context HttpServletRequest request, @Context SecurityContext sc) {
        super(request, sc, MessageInspectorServicePlugin.PLUGIN_NAME);
    }

    @Override
    public void checkAccess() {
    }

    @Override
    public String getFieldDescription(String version, String segment, int field) throws ClientException {
        String desc = HL7FieldDescriptions.getDescription(version, segment, field);
        return desc != null ? desc : "";
    }

    @Override
    public InspectorParseResult parseMessage(String hl7Message) throws ClientException {
        if (hl7Message == null || hl7Message.trim().isEmpty()) {
            throw new ClientException("Message body is empty");
        }
        try {
            return InspectorParseEngine.parse(hl7Message);
        } catch (Exception e) {
            throw new ClientException("Failed to parse HL7 message: " + e.getMessage());
        }
    }
}
