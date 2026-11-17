/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
package com.oie.messageinspector.server;

import java.util.Properties;

import com.mirth.connect.model.ExtensionPermission;
import com.mirth.connect.plugins.ServicePlugin;

public class MessageInspectorServicePlugin implements ServicePlugin {

    public static final String PLUGIN_NAME = "Message Inspector";
    public static final String PERMISSION_ACCESS = "accessInspector";

    @Override
    public String getPluginPointName() {
        return PLUGIN_NAME;
    }

    @Override
    public void init(Properties properties) {
    }

    @Override
    public void start() {
    }

    @Override
    public void stop() {
    }

    @Override
    public void update(Properties properties) {
    }

    @Override
    public Properties getDefaultProperties() {
        return new Properties();
    }

    @Override
    public ExtensionPermission[] getExtensionPermissions() {
        ExtensionPermission accessPerm = new ExtensionPermission(
                PLUGIN_NAME,
                PERMISSION_ACCESS,
                "Access the Message Inspector",
                new String[] { "accessInspector", "checkAccess" },
                new String[] { "Access Inspector", "Check Access" });

        return new ExtensionPermission[] { accessPerm };
    }
}
