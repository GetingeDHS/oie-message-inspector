# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |

## Reporting a Vulnerability

Please do **not** report security vulnerabilities through public issues.

Report them privately through GitHub instead: open the **Security** tab of this repository and choose **Report a vulnerability**. Include the affected version, steps to reproduce and, if possible, a suggested fix.

We aim to acknowledge reports within 5 working days and will keep you informed while we work on a fix.

## Scope

This extension processes HL7v2 messages that may contain patient data. Issues that could expose message content, bypass the `accessInspector` permission or affect the OIE server are especially relevant.
