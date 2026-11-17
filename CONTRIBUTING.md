# Contributing to Message Inspector

Thank you for your interest in contributing! This project is an extension for the
[Open Integration Engine (OIE)](https://github.com/OpenIntegrationEngine/engine)
and is licensed under the **Mozilla Public License 2.0 (MPL-2.0)**.

## License

By submitting a contribution you agree that your work is licensed under
MPL-2.0 on the same terms as the rest of this project (inbound = outbound).
**Copyright remains with you** — there is no copyright assignment and no
relicensing right granted beyond MPL-2.0.

## Developer Certificate of Origin (DCO)

Every commit **must** carry a `Signed-off-by` line certifying the
[Developer Certificate of Origin v1.1](https://developercertificate.org/).
This replaces a CLA — no paperwork, no legal review, just a per-commit
attestation that you have the right to submit the code under MPL-2.0.

### How to sign off

Add `-s` when you commit:

```bash
git commit -s -m "Add support for ZBE segment"
```

This appends a line like:

```
Signed-off-by: Jane Doe <jane@example.com>
```

If you forgot on an existing commit:

```bash
git commit --amend -s --no-edit
```

For multiple commits on a branch:

```bash
git rebase HEAD~N --signoff
```

> **CI enforces this.** Pull requests where any commit is missing a
> `Signed-off-by` line will not pass the DCO check.

### DCO 1.1 (full text)

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

## License headers

Every new source file must include a license header as the first comment.
The copyright line names **you** (or your organization) — MPL-2.0 does not
require copyright assignment, so each contributor retains their own copyright.

```java
/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) <year> <your name or organization>
 */
```

```xml
<!--
  SPDX-License-Identifier: MPL-2.0
  Copyright (c) <year> <your name or organization>
-->
```

When editing an existing file, leave the original copyright header as-is.

Existing files without a header will be updated over time; please add one
if you are making substantial changes to such a file.

## Pull request checklist

- [ ] All commits have a `Signed-off-by` line (`git commit -s`)
- [ ] New files have a license header (see above)
- [ ] The project builds cleanly (`mvn clean package`)
- [ ] Changes are described in the PR body

## Code style

- Language for all code, comments, and UI labels: **English**
- Package namespace: `com.oie.messageinspector`
- Follow the existing patterns in the codebase

## Questions?

Open an issue — we are happy to help.
