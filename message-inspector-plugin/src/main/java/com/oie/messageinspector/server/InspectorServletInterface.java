/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
package com.oie.messageinspector.server;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import com.mirth.connect.client.core.ClientException;
import com.mirth.connect.client.core.Operation.ExecuteType;
import com.mirth.connect.client.core.api.BaseServletInterface;
import com.mirth.connect.client.core.api.MirthOperation;

import com.oie.messageinspector.shared.InspectorParseResult;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Path("/extensions/message-inspector")
@Tag(name = "Message Inspector")
@Produces(MediaType.APPLICATION_JSON)
public interface InspectorServletInterface extends BaseServletInterface {

    @GET
    @Path("/check")
    @Operation(summary = "Check access to the Message Inspector")
    @MirthOperation(
            name = "checkAccess",
            display = "Check Access",
            permission = MessageInspectorServicePlugin.PERMISSION_ACCESS,
            type = ExecuteType.SYNC,
            auditable = false,
            abortable = false)
    void checkAccess() throws ClientException;

    @POST
    @Path("/parse")
    @Consumes(MediaType.TEXT_PLAIN)
    @MirthOperation(
            name = "accessInspector",
            display = "Parse HL7 Message",
            permission = MessageInspectorServicePlugin.PERMISSION_ACCESS,
            type = ExecuteType.ASYNC,
            auditable = false,
            abortable = false)
    InspectorParseResult parseMessage(String hl7Message) throws ClientException;

    @GET
    @Path("/field-description")
    @MirthOperation(
            name = "getFieldDescription",
            display = "Get Field Description",
            permission = MessageInspectorServicePlugin.PERMISSION_ACCESS,
            type = ExecuteType.ASYNC,
            auditable = false,
            abortable = false)
    String getFieldDescription(
            @QueryParam("version") String version,
            @QueryParam("segment") String segment,
            @QueryParam("field") int field) throws ClientException;
}
