/*
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2026 Getinge IT Solutions GmbH
 */
import { platform } from '@oie/web-shell';

var React = platform.React;
var useState = React.useState;
var useCallback = React.useCallback;
var useEffect = React.useEffect;
var useRef = React.useRef;
var useMemo = React.useMemo;

var API_PARSE = '/api/extensions/message-inspector/parse';
var API_FIELD_DESC = '/api/extensions/message-inspector/field-description';

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

function injectThemeStyles() {
    if (document.getElementById('mi-theme')) return;
    var style = document.createElement('style');
    style.id = 'mi-theme';
    style.textContent = [
        ':root, [data-theme="light"] {',
        '  --mi-bg-input: #ffffff;',
        '  --mi-bg-subtle: rgba(128,128,128,0.06);',
        '  --mi-bg-table-header: #f3f4f6;',
        '  --mi-bg-selected: var(--accent, rgba(59,130,246,0.15));',
        '  --mi-bg-match: rgba(59,130,246,0.12);',
        '  --mi-text-primary: #1f2937;',
        '  --mi-text-muted: #6b7280;',
        '  --mi-border: rgba(128,128,128,0.15);',
        '  --mi-border-subtle: rgba(128,128,128,0.06);',
        '  --mi-error: #ef4444;',
        '  --mi-error-dark: #dc2626;',
        '  --mi-error-bg: rgba(239,68,68,0.15);',
        '  --mi-error-bg-subtle: rgba(220,38,38,0.08);',
        '  --mi-error-border: rgba(220,38,38,0.25);',
        '  --mi-warning: #d97706;',
        '  --mi-warning-bg: rgba(217,119,6,0.12);',
        '  --mi-warning-bg-subtle: rgba(217,119,6,0.08);',
        '  --mi-warning-border: rgba(217,119,6,0.25);',
        '  --mi-success: #16a34a;',
        '  --mi-info: #3b82f6;',
        '  --mi-info-bg: rgba(59,130,246,0.15);',
        '  --mi-info-bg-subtle: rgba(59,130,246,0.08);',
        '  --mi-opt-gray: #9ca3af;',
        '  --mi-opt-gray-bg: rgba(156,163,175,0.1);',
        '  --mi-repeatable: #6366f1;',
        '  --mi-repeatable-bg: rgba(99,102,241,0.04);',
        '  --mi-repeatable-border: rgba(99,102,241,0.3);',
        '  --mi-dep: #dc2626;',
        '  --mi-dep-bg: rgba(220,38,38,0.1);',
        '  --mi-deprecated-bg: rgba(128,128,128,0.04);',
        '  --mi-hl7-segment: #1e40af;',
        '  --mi-hl7-field-sep: #9ca3af;',
        '  --mi-hl7-comp-sep: #d97706;',
        '  --mi-hl7-rep-sep: #7c3aed;',
        '  --mi-hl7-sub-sep: #059669;',
        '  --mi-hl7-line-num: #9ca3af;',
        '  --mi-hl7-gutter-bg: #f9fafb;',
        '  --mi-hl7-gutter-border: rgba(128,128,128,0.15);',
        '}',
        '[data-theme="dark"] {',
        '  --mi-bg-input: #1e1e1e;',
        '  --mi-bg-subtle: rgba(255,255,255,0.06);',
        '  --mi-bg-table-header: #2a2a2e;',
        '  --mi-text-primary: #e5e7eb;',
        '  --mi-text-muted: #9ca3af;',
        '  --mi-border: rgba(255,255,255,0.12);',
        '  --mi-border-subtle: rgba(255,255,255,0.06);',
        '  --mi-error: #f87171;',
        '  --mi-error-dark: #ef4444;',
        '  --mi-error-bg: rgba(248,113,113,0.15);',
        '  --mi-error-bg-subtle: rgba(248,113,113,0.08);',
        '  --mi-error-border: rgba(248,113,113,0.25);',
        '  --mi-warning: #fbbf24;',
        '  --mi-warning-bg: rgba(251,191,36,0.12);',
        '  --mi-warning-bg-subtle: rgba(251,191,36,0.08);',
        '  --mi-warning-border: rgba(251,191,36,0.25);',
        '  --mi-success: #4ade80;',
        '  --mi-info: #60a5fa;',
        '  --mi-info-bg: rgba(96,165,250,0.15);',
        '  --mi-info-bg-subtle: rgba(96,165,250,0.08);',
        '  --mi-opt-gray: #9ca3af;',
        '  --mi-opt-gray-bg: rgba(156,163,175,0.15);',
        '  --mi-repeatable: #a5b4fc;',
        '  --mi-repeatable-bg: rgba(165,180,252,0.06);',
        '  --mi-repeatable-border: rgba(165,180,252,0.3);',
        '  --mi-dep: #f87171;',
        '  --mi-dep-bg: rgba(248,113,113,0.1);',
        '  --mi-deprecated-bg: rgba(255,255,255,0.04);',
        '  --mi-bg-match: rgba(96,165,250,0.15);',
        '  --mi-hl7-segment: #93c5fd;',
        '  --mi-hl7-field-sep: #6b7280;',
        '  --mi-hl7-comp-sep: #fbbf24;',
        '  --mi-hl7-rep-sep: #a78bfa;',
        '  --mi-hl7-sub-sep: #34d399;',
        '  --mi-hl7-line-num: #6b7280;',
        '  --mi-hl7-gutter-bg: #1a1a1e;',
        '  --mi-hl7-gutter-border: rgba(255,255,255,0.08);',
        '}',
        '@media (prefers-color-scheme: dark) {',
        '  :root:not([data-theme="light"]) {',
        '    --mi-bg-input: #1e1e1e;',
        '    --mi-bg-subtle: rgba(255,255,255,0.06);',
        '    --mi-bg-table-header: #2a2a2e;',
        '    --mi-text-primary: #e5e7eb;',
        '    --mi-text-muted: #9ca3af;',
        '    --mi-border: rgba(255,255,255,0.12);',
        '    --mi-border-subtle: rgba(255,255,255,0.06);',
        '    --mi-error: #f87171;',
        '    --mi-error-dark: #ef4444;',
        '    --mi-error-bg: rgba(248,113,113,0.15);',
        '    --mi-error-bg-subtle: rgba(248,113,113,0.08);',
        '    --mi-error-border: rgba(248,113,113,0.25);',
        '    --mi-warning: #fbbf24;',
        '    --mi-warning-bg: rgba(251,191,36,0.12);',
        '    --mi-warning-bg-subtle: rgba(251,191,36,0.08);',
        '    --mi-warning-border: rgba(251,191,36,0.25);',
        '    --mi-success: #4ade80;',
        '    --mi-info: #60a5fa;',
        '    --mi-info-bg: rgba(96,165,250,0.15);',
        '    --mi-info-bg-subtle: rgba(96,165,250,0.08);',
        '    --mi-opt-gray: #9ca3af;',
        '    --mi-opt-gray-bg: rgba(156,163,175,0.15);',
        '    --mi-repeatable: #a5b4fc;',
        '    --mi-repeatable-bg: rgba(165,180,252,0.06);',
        '    --mi-repeatable-border: rgba(165,180,252,0.3);',
        '    --mi-dep: #f87171;',
        '    --mi-dep-bg: rgba(248,113,113,0.1);',
        '    --mi-deprecated-bg: rgba(255,255,255,0.04);',
        '    --mi-bg-match: rgba(96,165,250,0.15);',
        '    --mi-hl7-segment: #93c5fd;',
        '    --mi-hl7-field-sep: #6b7280;',
        '    --mi-hl7-comp-sep: #fbbf24;',
        '    --mi-hl7-rep-sep: #a78bfa;',
        '    --mi-hl7-sub-sep: #34d399;',
        '    --mi-hl7-line-num: #6b7280;',
        '    --mi-hl7-gutter-bg: #1a1a1e;',
        '    --mi-hl7-gutter-border: rgba(255,255,255,0.08);',
        '  }',
        '}',
        '.mi-link { cursor: pointer; opacity: 0.5; text-decoration: underline; transition: opacity 0.15s; }',
        '.mi-link:hover { opacity: 0.8; }',
    ].join('\n');
    document.head.appendChild(style);
}

if (typeof document !== 'undefined') injectThemeStyles();

// ---------------------------------------------------------------------------
// XStream JSON unwrapper
// ---------------------------------------------------------------------------

function unwrap(obj) {
    if (obj == null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(unwrap);
    var keys = Object.keys(obj);
    if (keys.length === 1 && keys[0].indexOf('.') > -1) {
        return unwrap(obj[keys[0]]);
    }
    var out = {};
    for (var i = 0; i < keys.length; i++) {
        out[keys[i]] = unwrap(obj[keys[i]]);
    }
    return out;
}

function ensureArray(val) {
    if (val == null) return null;
    if (Array.isArray(val)) return val;
    return [val];
}

function normalizeNode(node) {
    if (!node || typeof node !== 'object') return;
    if (node.value != null && typeof node.value !== 'string') node.value = String(node.value);
    if (node.name != null && typeof node.name !== 'string') node.name = String(node.name);
    if (node.path != null && typeof node.path !== 'string') node.path = String(node.path);
    node.children = ensureArray(node.children);
    node.tableValues = ensureArray(node.tableValues);
    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            normalizeNode(node.children[i]);
        }
    }
}

function normalizeResult(result) {
    if (!result) return;
    result.tree = ensureArray(result.tree);
    if (result.tree) {
        for (var i = 0; i < result.tree.length; i++) {
            normalizeNode(result.tree[i]);
        }
    }
    if (result.validation) {
        result.validation.issues = ensureArray(result.validation.issues);
    }
}

// ---------------------------------------------------------------------------
// Utilities: optionality colors, clipboard, search, tokenizer
// ---------------------------------------------------------------------------

function getOptColor(opt) {
    if (opt === 'R' || opt === 'RE') return 'var(--mi-error)';
    if (opt && opt.charAt(0) === 'C') return 'var(--mi-warning)';
    if (opt === 'B' || opt === 'W' || opt === 'X') return 'var(--mi-opt-gray)';
    return undefined;
}

function getOptBg(opt) {
    if (opt === 'R' || opt === 'RE') return 'var(--mi-error-bg)';
    if (opt && opt.charAt(0) === 'C') return 'var(--mi-warning-bg)';
    if (opt === 'B' || opt === 'W' || opt === 'X') return 'var(--mi-opt-gray-bg)';
    return undefined;
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve();
}

function computeVisibleNodes(tree, query) {
    var matchPaths = {};
    var visiblePaths = {};
    var totalCount = 0;
    var q = query.toLowerCase();

    function walk(node) {
        totalCount++;
        var selfMatch = false;
        var valStr = node.value != null ? String(node.value) : '';
        if ((node.path && node.path.toLowerCase().indexOf(q) > -1) ||
            (node.name && node.name.toLowerCase().indexOf(q) > -1) ||
            (valStr && valStr.toLowerCase().indexOf(q) > -1)) {
            selfMatch = true;
            matchPaths[node.path] = true;
        }
        var childMatch = false;
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                if (walk(node.children[i])) childMatch = true;
            }
        }
        if (selfMatch || childMatch) {
            visiblePaths[node.path] = true;
            return true;
        }
        return false;
    }

    if (tree) {
        for (var i = 0; i < tree.length; i++) { walk(tree[i]); }
    }
    return { visiblePaths: visiblePaths, matchPaths: matchPaths, total: totalCount, visible: Object.keys(visiblePaths).length };
}

function tokenizeHL7Line(line) {
    if (!line) return [];
    var tokens = [];
    var i = 0;
    if (line.length >= 3) {
        tokens.push({ text: line.substring(0, 3), color: 'var(--mi-hl7-segment)' });
        i = 3;
    }
    var buf = '';
    for (; i < line.length; i++) {
        var ch = line[i];
        var sepColor = ch === '|' ? 'var(--mi-hl7-field-sep)'
            : ch === '^' ? 'var(--mi-hl7-comp-sep)'
            : ch === '~' ? 'var(--mi-hl7-rep-sep)'
            : ch === '&' ? 'var(--mi-hl7-sub-sep)' : null;
        if (sepColor) {
            if (buf) { tokens.push({ text: buf, color: null }); buf = ''; }
            tokens.push({ text: ch, color: sepColor });
        } else {
            buf += ch;
        }
    }
    if (buf) tokens.push({ text: buf, color: null });
    return tokens;
}

// ---------------------------------------------------------------------------
// URL Params (hash-based and standard routing)
// ---------------------------------------------------------------------------

function getUrlParams() {
    var search = window.location.search;
    if (search) {
        var params = new URLSearchParams(search);
        if (params.has('channelId')) return params;
    }
    var hash = window.location.hash;
    var qIdx = hash.indexOf('?');
    if (qIdx > -1) {
        return new URLSearchParams(hash.substring(qIdx + 1));
    }
    return new URLSearchParams(search);
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

function findConnectorContent(connMsg, targetId) {
    if (!connMsg || typeof connMsg !== 'object') return null;
    var contentSources = targetId === 0
        ? ['raw', 'processedRaw', 'encoded']
        : ['encoded', 'sent', 'processedRaw', 'raw'];
    for (var c = 0; c < contentSources.length; c++) {
        var src = connMsg[contentSources[c]];
        if (src && src.content) {
            return { content: src.content, connectorName: connMsg.connectorName || ('Connector ' + targetId) };
        }
    }
    return null;
}

function resolveConnectorMessage(msg, targetId) {
    if (!msg || typeof msg !== 'object') return null;
    var cm = msg.connectorMessages;
    if (!cm || typeof cm !== 'object') return null;

    // Format A: XStream entry array — {entry: [{int: N, "com.…ConnectorMessage": {…}}]}
    var entries = cm.entry;
    if (entries) {
        if (!Array.isArray(entries)) entries = [entries];
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (entry['int'] != targetId) continue;
            var keys = Object.keys(entry);
            for (var k = 0; k < keys.length; k++) {
                if (keys[k] !== 'int' && typeof entry[keys[k]] === 'object') {
                    var hit = findConnectorContent(entry[keys[k]], targetId);
                    if (hit) return hit;
                }
            }
        }
    }

    // Format B: plain object keyed by metaDataId — {0: ConnectorMessage, 2: ConnectorMessage}
    var byKey = cm[String(targetId)] || cm[targetId];
    if (byKey) {
        var hit = findConnectorContent(byKey, targetId);
        if (hit) return hit;
    }

    // Format C: iterate all values looking for matching metaDataId
    var cmKeys = Object.keys(cm);
    for (var i = 0; i < cmKeys.length; i++) {
        var val = cm[cmKeys[i]];
        if (val && typeof val === 'object' && val.metaDataId == targetId) {
            var hit = findConnectorContent(val, targetId);
            if (hit) return hit;
        }
    }

    return null;
}

async function fetchMessageContent(channelId, messageId, metaDataId) {
    metaDataId = metaDataId != null ? String(metaDataId) : '0';
    var targetId = parseInt(metaDataId, 10);

    var msg = null;

    // Prefer platform.api.messages.get — handles XStream deserialization internally
    if (platform.api && platform.api.messages && platform.api.messages.get) {
        try {
            msg = await platform.api.messages.get(channelId, messageId);
        } catch (e) {
            console.warn('[MessageInspector] platform.api.messages.get failed, falling back to fetch:', e);
        }
    }

    // Fallback: raw fetch with includeContent
    if (!msg) {
        var url = '/api/channels/' + encodeURIComponent(channelId) +
                  '/messages/' + encodeURIComponent(messageId) + '?includeContent=true';
        var res = await fetch(url, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        });
        if (!res.ok) {
            var text = await res.text().catch(function () { return res.statusText; });
            throw new Error('Failed to fetch message: [' + res.status + '] ' + (text || res.statusText));
        }
        msg = unwrap(await res.json());
    }

    var result = resolveConnectorMessage(msg, targetId);
    if (result) return result;

    console.error('[MessageInspector] Could not extract content. connectorMessages:', msg && msg.connectorMessages);
    throw new Error('No HL7 content found for connector ' + metaDataId);
}

async function parseHL7(messageContent) {
    var res = await fetch(API_PARSE, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: messageContent,
    });
    if (!res.ok) {
        var text = await res.text().catch(function () { return res.statusText; });
        throw new Error('[' + res.status + '] ' + (text || res.statusText));
    }
    var raw = await res.json();
    var result = unwrap(raw);
    normalizeResult(result);
    return result;
}

// ---------------------------------------------------------------------------
// CopyablePath
// ---------------------------------------------------------------------------

function CopyablePath({ path, style }) {
    var _c = useState(false), copied = _c[0], setCopied = _c[1];
    var timerRef = useRef(null);

    useEffect(function () {
        return function () { clearTimeout(timerRef.current); };
    }, []);

    var handleClick = useCallback(function (e) {
        e.stopPropagation();
        copyToClipboard(path).then(function () {
            if (platform.ui && platform.ui.toast) {
                platform.ui.toast('Copied: ' + path, 'info');
            } else {
                clearTimeout(timerRef.current);
                setCopied(true);
                timerRef.current = setTimeout(function () { setCopied(false); }, 1500);
            }
        }).catch(function () {});
    }, [path]);

    return (
        <span onClick={handleClick} title={'Click to copy: ' + path}
              style={Object.assign({ fontWeight: 600, minWidth: '60px', cursor: 'pointer', position: 'relative' }, style)}>
            {path}
            {copied && (
                <span style={{
                    position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--mi-text-primary)', color: 'var(--mi-bg-input)',
                    fontSize: '10px', padding: '2px 6px', borderRadius: '3px', whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                }}>Copied!</span>
            )}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Tree Node
// ---------------------------------------------------------------------------

function TreeNode({ node, depth, onSelect, selectedNode, expandAll, revealPath, filterResult }) {
    var initialExpanded = expandAll === true ? true : expandAll === false ? false : depth < 1;
    var _e = useState(initialExpanded), expanded = _e[0], setExpanded = _e[1];
    var hasChildren = node.children && node.children.length > 0;
    var nodeRef = useRef(null);
    var forceExpand = filterResult && filterResult.visiblePaths[node.path] && hasChildren;

    var toggle = useCallback(function (e) {
        e.stopPropagation();
        if (!forceExpand) setExpanded(function (prev) { return !prev; });
    }, [forceExpand]);

    var select = useCallback(function () {
        onSelect(node);
    }, [node, onSelect]);

    useEffect(function () {
        if (!revealPath) return;
        var rp = revealPath.path || revealPath;
        if (hasChildren && rp.indexOf(node.path + '.') === 0) {
            setExpanded(true);
        }
    }, [revealPath]);

    useEffect(function () {
        if (selectedNode === node && nodeRef.current && revealPath) {
            setTimeout(function () {
                if (nodeRef.current) {
                    nodeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }, 60);
        }
    }, [selectedNode, revealPath]);

    if (filterResult && !filterResult.visiblePaths[node.path]) return null;
    var isMatch = filterResult && filterResult.matchPaths[node.path];
    var isExpanded = forceExpand ? true : expanded;

    var isSelected = selectedNode === node;
    var treeOpt = node.optionality || (node.required === true || node.required === 'true' ? 'R' : null);

    var indent = depth * 16;

    return (
        <div>
            <div
                ref={nodeRef}
                onClick={select}
                style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '2px 4px', paddingLeft: indent + 'px',
                    cursor: 'pointer', borderRadius: '3px',
                    background: isSelected ? 'var(--mi-bg-selected)' : isMatch ? 'var(--mi-bg-match)' : 'transparent',
                    fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'nowrap',
                }}
            >
                {hasChildren
                    ? <span onClick={toggle} style={{ width: '16px', textAlign: 'center', cursor: 'pointer', userSelect: 'none', fontSize: '10px', opacity: 0.5 }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    : <span style={{ width: '16px' }} />}

                <CopyablePath path={node.path} />

                {treeOpt && (
                    <span style={{ color: getOptColor(treeOpt), fontSize: '10px', fontWeight: 700, opacity: 0.7 }}
                          title={treeOpt === 'R' ? 'Required' : treeOpt === 'RE' ? 'Required (may be empty)' : treeOpt === 'O' ? 'Optional' : treeOpt}>[{treeOpt}]</span>
                )}

                {node.repeatable && (
                    <span style={{ color: 'var(--mi-repeatable)', fontSize: '10px', fontWeight: 600, opacity: 0.7 }} title="Repeatable">[...]</span>
                )}

                {node.name && node.name !== node.path && (
                    <span style={{ opacity: 0.5, marginLeft: '4px' }}>({node.name})</span>
                )}

                {node.repeatable && hasChildren && (
                    <span style={{ color: 'var(--mi-repeatable)', fontSize: '10px', marginLeft: '6px', opacity: 0.7 }}>
                        x{node.children.length}
                    </span>
                )}

                {node.value && !hasChildren && (
                    <span style={{ opacity: 0.35, marginLeft: '8px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                        = {node.value}
                    </span>
                )}
            </div>

            {isExpanded && hasChildren && (
                <div>
                    {node.children.map(function (child, i) {
                        return <TreeNode key={child.path + '-' + i} node={child} depth={depth + 1} onSelect={onSelect} selectedNode={selectedNode} expandAll={expandAll} revealPath={revealPath} filterResult={filterResult} />;
                    })}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// HL7 Tree View
// ---------------------------------------------------------------------------

function HL7TreeView({ tree, onSelect, selectedNode, revealPath }) {
    var _tk = useState(0), treeKey = _tk[0], setTreeKey = _tk[1];
    var _de = useState(null), defaultExpand = _de[0], setDefaultExpand = _de[1];
    var _sq = useState(''), searchQuery = _sq[0], setSearchQuery = _sq[1];
    var searchTimerRef = useRef(null);
    var _dq = useState(''), debouncedQuery = _dq[0], setDebouncedQuery = _dq[1];

    useEffect(function () {
        return function () { clearTimeout(searchTimerRef.current); };
    }, []);

    var handleSearchChange = useCallback(function (e) {
        var val = e.target.value;
        setSearchQuery(val);
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(function () {
            setDebouncedQuery(val);
        }, 150);
    }, []);

    var handleClearSearch = useCallback(function () {
        setSearchQuery('');
        setDebouncedQuery('');
        clearTimeout(searchTimerRef.current);
    }, []);

    var filterResult = useMemo(function () {
        if (!debouncedQuery || !debouncedQuery.trim()) return null;
        return computeVisibleNodes(tree, debouncedQuery.trim());
    }, [tree, debouncedQuery]);

    var handleExpandAll = useCallback(function () {
        setTreeKey(function (k) { return k + 1; });
        setDefaultExpand(true);
    }, []);

    var handleCollapseAll = useCallback(function () {
        setTreeKey(function (k) { return k + 1; });
        setDefaultExpand(false);
    }, []);

    if (!tree || tree.length === 0) {
        return <div style={{ opacity: 0.35, padding: '1rem', textAlign: 'center', fontSize: '13px' }}>No segments found</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Filter by path, name, or value..."
                    aria-label="Filter tree nodes"
                    style={{
                        flex: 1, fontSize: '12px', padding: '4px 8px', fontFamily: 'monospace',
                        border: '1px solid var(--mi-border)', borderRadius: '3px',
                        background: 'var(--mi-bg-input)', color: 'inherit', outline: 'none',
                    }}
                />
                {searchQuery && (
                    <span className="mi-link" onClick={handleClearSearch}
                          style={{ fontSize: '11px', textDecoration: 'none' }}>Clear</span>
                )}
            </div>
            {filterResult && (
                <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>
                    {filterResult.visible} of {filterResult.total} nodes
                </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '11px' }}>
                <span className="mi-link" onClick={handleExpandAll}>Expand all</span>
                <span className="mi-link" onClick={handleCollapseAll}>Collapse all</span>
            </div>
            <div key={treeKey} style={{ fontSize: '13px' }}>
                {tree.map(function (node, i) {
                    return <TreeNode key={node.path + '-' + i} node={node} depth={0} onSelect={onSelect} selectedNode={selectedNode} expandAll={defaultExpand} revealPath={revealPath} filterResult={filterResult} />;
                })}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Validation Issues
// ---------------------------------------------------------------------------

function ValidationPanel({ validation, tree, onSelectNode }) {
    var _s = useState(true), expanded = _s[0], setExpanded = _s[1];

    var findNodeByPath = useCallback(function (path) {
        if (!tree || !path) return null;
        var parts = path.split('.');
        var segName = parts[0];
        for (var si = 0; si < tree.length; si++) {
            var seg = tree[si];
            if (seg.path === segName) {
                if (parts.length === 1) return seg;
                if (seg.children) {
                    for (var fi = 0; fi < seg.children.length; fi++) {
                        var field = seg.children[fi];
                        if (field.path === parts[0] + '.' + parts[1]) {
                            if (parts.length === 2) return field;
                            if (field.children) {
                                for (var ci = 0; ci < field.children.length; ci++) {
                                    if (field.children[ci].path === path) return field.children[ci];
                                }
                            }
                            return field;
                        }
                    }
                }
                return seg;
            }
        }
        return null;
    }, [tree]);

    var handleClick = useCallback(function (path) {
        var node = findNodeByPath(path);
        if (node && onSelectNode) onSelectNode(node);
    }, [findNodeByPath, onSelectNode]);

    if (!validation || !validation.issues || validation.issues.length === 0) return null;

    var issues = validation.issues;
    if (!Array.isArray(issues)) {
        issues = [issues];
    }

    var errors = issues.filter(function (i) { return (i.severity || '').toUpperCase() === 'ERROR'; });
    var warnings = issues.filter(function (i) { return (i.severity || '').toUpperCase() === 'WARNING'; });

    var borderColor = errors.length > 0 ? 'var(--mi-error-border)' : 'var(--mi-warning-border)';
    var bgColor = errors.length > 0 ? 'var(--mi-error-bg-subtle)' : 'var(--mi-warning-bg-subtle)';

    function renderIssue(issue, i) {
        var sev = (issue.severity || '').toUpperCase();
        var color = sev === 'ERROR' ? 'var(--mi-error)' : sev === 'WARNING' ? 'var(--mi-warning)' : 'var(--mi-text-muted)';
        var icon = sev === 'ERROR' ? '✖' : '⚠';
        return (
            <div key={i} style={{
                display: 'flex', gap: '0.5rem', padding: '3px 0', alignItems: 'baseline',
                borderBottom: '1px solid var(--mi-border-subtle)',
            }}>
                <span style={{ color: color, fontSize: '11px', minWidth: '14px' }}>{icon}</span>
                <span onClick={function () { handleClick(issue.path); }}
                      style={{ fontFamily: 'monospace', color: 'var(--mi-info)', cursor: 'pointer', minWidth: '60px', fontSize: '12px', textDecoration: 'underline' }}>
                    {issue.path}
                </span>
                <span style={{ fontSize: '12px' }}>{issue.message}</span>
            </div>
        );
    }

    return (
        <div style={{
            border: '1px solid ' + borderColor, borderRadius: '4px',
            background: bgColor, fontSize: '12px', overflow: 'hidden',
        }}>
            <div onClick={function () { setExpanded(!expanded); }} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 10px', cursor: 'pointer', userSelect: 'none',
                borderBottom: expanded ? '1px solid ' + borderColor : 'none',
            }}>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>{expanded ? '▼' : '▶'}</span>
                <span style={{ fontWeight: 600 }}>Validation</span>
                {errors.length > 0 && (
                    <span style={{
                        background: 'var(--mi-error-bg)', color: 'var(--mi-error)', fontWeight: 700,
                        padding: '1px 6px', borderRadius: '3px', fontSize: '11px',
                    }}>{errors.length} Error{errors.length !== 1 ? 's' : ''}</span>
                )}
                {warnings.length > 0 && (
                    <span style={{
                        background: 'var(--mi-warning-bg)', color: 'var(--mi-warning)', fontWeight: 700,
                        padding: '1px 6px', borderRadius: '3px', fontSize: '11px',
                    }}>{warnings.length} Warning{warnings.length !== 1 ? 's' : ''}</span>
                )}
                {errors.length === 0 && warnings.length === 0 && (
                    <span style={{ color: 'var(--mi-success)', fontWeight: 600, fontSize: '11px' }}>No issues</span>
                )}
            </div>
            {expanded && (
                <div style={{ padding: '4px 10px', maxHeight: '200px', overflow: 'auto' }}>
                    {errors.length > 0 && errors.map(renderIssue)}
                    {warnings.length > 0 && warnings.map(function (w, i) { return renderIssue(w, errors.length + i); })}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Version comparison
// ---------------------------------------------------------------------------

function compareVersions(a, b) {
    if (a == null || b == null) return 0;
    var pa = String(a).split('.').map(Number);
    var pb = String(b).split('.').map(Number);
    var len = Math.max(pa.length, pb.length);
    for (var i = 0; i < len; i++) {
        var na = pa[i] || 0;
        var nb = pb[i] || 0;
        if (na !== nb) return na - nb;
    }
    return 0;
}

// ---------------------------------------------------------------------------
// Table Values
// ---------------------------------------------------------------------------

function TableValues({ node, messageVersion }) {
    var scrollRef = useRef(null);
    var tableValues = node.tableValues;
    if (!Array.isArray(tableValues)) {
        tableValues = tableValues ? [tableValues] : [];
    }

    var currentValue = node.value != null ? String(node.value) : '';
    var simpleValue = currentValue.indexOf('^') > -1 ? currentValue.split('^')[0] : currentValue;
    var tableSince = node.tableSince;
    var tableNotYetIntroduced = tableSince && messageVersion && compareVersions(messageVersion, tableSince) < 0;

    useEffect(function () {
        if (!scrollRef.current || !simpleValue) return;
        var matchRow = scrollRef.current.querySelector('[data-match="true"]');
        if (matchRow) {
            var container = scrollRef.current;
            var rowRect = matchRow.getBoundingClientRect();
            var containerRect = container.getBoundingClientRect();
            var offset = rowRect.top - containerRect.top + container.scrollTop;
            container.scrollTop = offset - container.clientHeight / 2 + matchRow.offsetHeight / 2;
        }
    }, [simpleValue, node.tableId]);

    if (tableValues.length === 0) return null;

    return (
        <div style={{ marginTop: '1rem' }}>
            <span style={{ fontWeight: 600, opacity: 0.5, fontSize: '12px', display: 'block', marginBottom: '0.25rem' }}>
                HL7 Table {node.tableId}{node.tableName ? ' — ' + node.tableName : ''}
                {tableSince && <span style={{ opacity: 0.5 }}> (since v{tableSince})</span>}
            </span>
            {tableNotYetIntroduced && (
                <div style={{
                    background: 'var(--mi-warning-bg-subtle)', border: '1px solid var(--mi-warning-border)',
                    borderRadius: '4px', padding: '4px 8px', fontSize: '11px', color: 'var(--mi-warning)',
                    marginBottom: '6px',
                }}>
                    This table was introduced in HL7 v{tableSince}. The message uses v{messageVersion}.
                </div>
            )}
            <div ref={scrollRef} style={{
                border: '1px solid var(--mi-border)', borderRadius: '4px',
                maxHeight: '200px', overflow: 'auto', fontSize: '12px',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--mi-bg-table-header)', textAlign: 'left', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid var(--mi-border)' }}>Code</th>
                            <th style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--mi-bg-table-header)', textAlign: 'left', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid var(--mi-border)' }}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableValues.map(function (entry, i) {
                            var isMatch = entry.code === simpleValue;
                            var isNew = entry.status === 'N';
                            var isDeprecated = entry.deprecated && messageVersion && compareVersions(messageVersion, entry.deprecated) >= 0;
                            return (
                                <tr key={i} data-match={isMatch ? 'true' : undefined} style={{
                                    background: isMatch ? 'var(--mi-bg-match)' : isDeprecated ? 'var(--mi-deprecated-bg)' : 'transparent',
                                    fontWeight: isMatch ? 600 : 'normal',
                                    opacity: isDeprecated ? 0.5 : 1,
                                }}>
                                    <td style={{ padding: '2px 8px', fontFamily: 'monospace', borderBottom: '1px solid var(--mi-border-subtle)' }}>
                                        {entry.code}
                                        {isMatch && <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.5 }}>&#8592;</span>}
                                        {isNew && (
                                            <span style={{
                                                marginLeft: '4px', fontSize: '9px', fontWeight: 700,
                                                background: 'var(--mi-info-bg)', color: 'var(--mi-info)',
                                                padding: '0 3px', borderRadius: '2px', fontFamily: 'sans-serif',
                                            }}>NEW</span>
                                        )}
                                        {isDeprecated && (
                                            <span style={{
                                                marginLeft: '4px', fontSize: '9px', fontWeight: 700,
                                                background: 'var(--mi-dep-bg)', color: 'var(--mi-dep)',
                                                padding: '0 3px', borderRadius: '2px', fontFamily: 'sans-serif',
                                            }} title={'Deprecated since v' + entry.deprecated}>DEP</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '2px 8px', borderBottom: '1px solid var(--mi-border-subtle)' }}>
                                        {entry.description}
                                        {isDeprecated && (
                                            <span style={{ opacity: 0.5, fontSize: '10px', marginLeft: '4px' }}>(deprecated v{entry.deprecated})</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Field Detail
// ---------------------------------------------------------------------------

function FieldDetail({ node, messageVersion }) {
    var _d = useState(null), fieldDesc = _d[0], setFieldDesc = _d[1];
    var _dl = useState(false), descLoading = _dl[0], setDescLoading = _dl[1];
    var reqIdRef = useRef(0);

    useEffect(function () {
        setFieldDesc(null);
        if (!node || !messageVersion) return;

        var pathParts = node.path.replace(/\[.*\]/, '').split('.');
        if (pathParts.length < 2) return;
        var seg = pathParts[0];
        var fieldNum = parseInt(pathParts[1], 10);
        if (!seg || isNaN(fieldNum)) return;

        setDescLoading(true);
        var currentReq = ++reqIdRef.current;
        var url = API_FIELD_DESC + '?version=' + encodeURIComponent(messageVersion) +
            '&segment=' + encodeURIComponent(seg) + '&field=' + fieldNum;

        fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } }).then(function (r) { return r.text(); }).then(function (text) {
            if (currentReq !== reqIdRef.current) return;
            try {
                var parsed = JSON.parse(text);
                if (typeof parsed === 'object' && parsed !== null) {
                    var keys = Object.keys(parsed);
                    if (keys.length === 1 && keys[0].indexOf('.') > -1) {
                        parsed = parsed[keys[0]];
                    }
                }
                setFieldDesc(typeof parsed === 'string' && parsed.length > 0 ? parsed : null);
            } catch (e) {
                setFieldDesc(text && text.length > 2 ? text : null);
            }
            setDescLoading(false);
        }).catch(function () {
            if (currentReq !== reqIdRef.current) return;
            setDescLoading(false);
        });
    }, [node && node.path, messageVersion]);

    if (!node) {
        return <div style={{ opacity: 0.35, padding: '1rem', textAlign: 'center', fontSize: '13px' }}>Select a node to see data type, optionality, table values, and HL7 description</div>;
    }

    var opt = node.optionality || (node.required === true || node.required === 'true' ? 'R' : null);
    var optLabel = { 'R': 'Required', 'RE': 'Required (may be empty)', 'O': 'Optional',
        'C': 'Conditional', 'CE': 'Conditional (may be empty)', 'C(R/O)': 'Conditional (R/O)',
        'C(R/X)': 'Conditional (R/X)', 'C(RE/X)': 'Conditional (RE/X)',
        'B': 'Backward compatible', 'W': 'Withdrawn', 'X': 'Not permitted' };

    return (
        <div style={{ fontSize: '13px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 1rem 0' }}>
                <CopyablePath path={node.path} />
                {opt && <span style={{
                    color: getOptColor(opt), marginLeft: '6px', fontSize: '11px', fontWeight: 700,
                    background: getOptBg(opt), padding: getOptColor(opt) ? '1px 5px' : undefined, borderRadius: '3px',
                }}>{opt}</span>}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, opacity: 0.5, fontSize: '12px' }}>Path</span>
                <CopyablePath path={node.path} style={{ fontFamily: 'monospace', fontWeight: 'normal', minWidth: 0 }} />

                <span style={{ fontWeight: 600, opacity: 0.5, fontSize: '12px' }}>Description</span>
                <span>{node.name || '-'}</span>

                {node.dataType && (
                    <>
                        <span style={{ fontWeight: 600, opacity: 0.5, fontSize: '12px' }}>Data Type</span>
                        <span style={{ fontFamily: 'monospace' }}>{node.dataType}</span>
                    </>
                )}

                <span style={{ fontWeight: 600, opacity: 0.5, fontSize: '12px' }}>Optionality</span>
                <span style={{ color: getOptColor(opt) }}>{opt ? (optLabel[opt] || opt) + ' (' + opt + ')' : '-'}</span>

                <span style={{ fontWeight: 600, opacity: 0.5, fontSize: '12px' }}>Repeatable</span>
                <span>{node.repeatable ? <span style={{ color: 'var(--mi-repeatable)' }}>Yes</span> : 'No'}</span>

                {node.valid != null && (
                    <>
                        <span style={{ fontWeight: 600, opacity: 0.5, fontSize: '12px' }}>Valid</span>
                        <span style={{ color: node.valid ? 'var(--mi-success)' : 'var(--mi-error)' }}>{node.valid ? 'Yes' : 'No'}</span>
                    </>
                )}
            </div>

            {node.value && (
                <div style={{ marginTop: '1rem' }}>
                    <span style={{ fontWeight: 600, opacity: 0.5, fontSize: '12px', display: 'block', marginBottom: '0.25rem' }}>Value</span>
                    <pre style={{
                        fontFamily: 'monospace', fontSize: '12px', padding: '0.5rem',
                        background: 'var(--mi-bg-subtle)',
                        borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0,
                    }}>
                        {node.value}
                    </pre>
                </div>
            )}

            {node.tableId && <TableValues node={node} messageVersion={messageVersion} />}

            {(fieldDesc || descLoading) && (
                <div style={{ marginTop: '1rem' }}>
                    <span style={{ fontWeight: 600, opacity: 0.5, fontSize: '12px', display: 'block', marginBottom: '0.25rem' }}>HL7 Standard Description</span>
                    {descLoading && !fieldDesc
                        ? <span style={{ opacity: 0.35, fontSize: '12px' }}>Loading...</span>
                        : <div style={{
                            fontSize: '12px', lineHeight: '1.5', padding: '0.5rem',
                            background: 'var(--mi-repeatable-bg)', borderLeft: '3px solid var(--mi-repeatable-border)',
                            borderRadius: '0 4px 4px 0',
                        }}>{fieldDesc}</div>
                    }
                </div>
            )}

            {node.children && node.children.length > 0 && (
                <div style={{ marginTop: '1rem', opacity: 0.5 }}>
                    <span style={{ fontSize: '12px' }}>{node.children.length} child element{node.children.length !== 1 ? 's' : ''}</span>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Textarea click → tree navigation
// ---------------------------------------------------------------------------

function resolvePathAtPosition(hl7Message, caretPos) {
    if (!hl7Message || caretPos < 0 || caretPos > hl7Message.length) return null;
    var segments = hl7Message.split(/\r\n|\r|\n/);
    var offset = 0;
    var segCounts = {};
    for (var s = 0; s < segments.length; s++) {
        var seg = segments[s];
        var segEnd = offset + seg.length;
        var segName = seg.length >= 3 ? seg.substring(0, 3) : null;
        if (segName) {
            segCounts[segName] = (segCounts[segName] || 0) + 1;
        }
        if (caretPos >= offset && caretPos <= segEnd) {
            var fieldPath = resolveFieldPath(seg, caretPos - offset);
            return { path: fieldPath, segmentOccurrence: segCounts[segName] || 1 };
        }
        offset = segEnd + 1;
    }
    return null;
}

function resolveFieldPath(segment, pos) {
    if (segment.length < 3) return null;
    var segName = segment.substring(0, 3);
    var fields = segment.split('|');
    var fieldOffset = 0;
    for (var i = 0; i < fields.length; i++) {
        var fieldEnd = fieldOffset + fields[i].length;
        if (pos >= fieldOffset && pos <= fieldEnd) {
            var fieldNum = segName === 'MSH' ? i + 1 : i;
            if (fieldNum === 0) return segName;
            var fieldPath = segName + '.' + fieldNum;
            var posInField = pos - fieldOffset;
            var comps = fields[i].split('^');
            if (comps.length <= 1) return fieldPath;
            var compOffset = 0;
            for (var c = 0; c < comps.length; c++) {
                var compEnd = compOffset + comps[c].length;
                if (posInField >= compOffset && posInField <= compEnd) {
                    return fieldPath + '.' + (c + 1);
                }
                compOffset = compEnd + 1;
            }
            return fieldPath;
        }
        fieldOffset = fieldEnd + 1;
    }
    return segName;
}

function resolveTextRange(message, path, segmentOccurrence) {
    if (!message || !path) return null;
    var parts = path.replace(/\[.*\]/, '').split('.');
    var segName = parts[0];
    var targetOcc = segmentOccurrence || 1;
    var lines = message.split(/\r\n|\r|\n/);
    var offset = 0;
    var segCount = 0;

    for (var li = 0; li < lines.length; li++) {
        var line = lines[li];
        var lineEnd = offset + line.length;
        var lineName = line.length >= 3 ? line.substring(0, 3) : null;

        if (lineName === segName) {
            segCount++;
            if (segCount === targetOcc) {
                if (parts.length === 1) return { start: offset, end: lineEnd };

                var fieldNum = parseInt(parts[1], 10);
                if (segName === 'MSH' && fieldNum === 1) return { start: offset + 3, end: offset + 4 };

                var fields = line.split('|');
                var fOff = offset;
                for (var f = 0; f < fields.length; f++) {
                    var fEnd = fOff + fields[f].length;
                    var actualNum = segName === 'MSH' ? f + 1 : f;
                    if (actualNum === fieldNum) {
                        if (parts.length === 2) return { start: fOff, end: fEnd };
                        var compNum = parseInt(parts[2], 10);
                        var comps = fields[f].split('^');
                        var cOff = fOff;
                        for (var c = 0; c < comps.length; c++) {
                            var cEnd = cOff + comps[c].length;
                            if (c + 1 === compNum) {
                                if (parts.length === 3) return { start: cOff, end: cEnd };
                                var subNum = parseInt(parts[3], 10);
                                var subs = comps[c].split('&');
                                var sOff = cOff;
                                for (var sc = 0; sc < subs.length; sc++) {
                                    var sEnd = sOff + subs[sc].length;
                                    if (sc + 1 === subNum) return { start: sOff, end: sEnd };
                                    sOff = sEnd + 1;
                                }
                                return { start: cOff, end: cEnd };
                            }
                            cOff = cEnd + 1;
                        }
                        return { start: fOff, end: fEnd };
                    }
                    fOff = fEnd + 1;
                }
                return { start: offset, end: lineEnd };
            }
        }
        offset = lineEnd + 1;
    }
    return null;
}

function findSegmentOccurrence(tree, node) {
    var segName = node.path.split('.')[0];
    var count = 0;
    function contains(root, target) {
        if (root === target) return true;
        if (root.children) {
            for (var i = 0; i < root.children.length; i++) {
                if (contains(root.children[i], target)) return true;
            }
        }
        return false;
    }
    for (var i = 0; i < tree.length; i++) {
        if (tree[i].path === segName) {
            count++;
            if (contains(tree[i], node)) return count;
        }
    }
    return 1;
}

// ---------------------------------------------------------------------------
// HL7 Syntax Highlighting Textarea
// ---------------------------------------------------------------------------

var HL7_EDITOR_FONT = { fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.5' };

function HL7SyntaxTextarea({ value, onChange, onClick, placeholder, rows, selectionRange }) {
    var textareaRef = useRef(null);
    var highlightRef = useRef(null);
    var gutterRef = useRef(null);

    var handleScroll = useCallback(function () {
        var ta = textareaRef.current;
        if (!ta) return;
        if (highlightRef.current) {
            highlightRef.current.scrollTop = ta.scrollTop;
            highlightRef.current.scrollLeft = ta.scrollLeft;
        }
        if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
    }, []);

    useEffect(function () {
        var ta = textareaRef.current;
        if (!ta || !selectionRange) return;
        ta.focus();
        ta.setSelectionRange(selectionRange.start, selectionRange.end);
        var lineHeight = 18;
        var charsBeforeStart = (value || '').substring(0, selectionRange.start);
        var lineNum = charsBeforeStart.split(/\r\n|\r|\n/).length - 1;
        var targetScroll = lineNum * lineHeight - ta.clientHeight / 2 + lineHeight;
        ta.scrollTop = Math.max(0, targetScroll);
        if (highlightRef.current) highlightRef.current.scrollTop = ta.scrollTop;
        if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
    }, [selectionRange]);

    var lines = useMemo(function () {
        if (!value) return [];
        return value.split(/\r\n|\r|\n/);
    }, [value]);

    var gutterW = Math.max(String(lines.length).length * 8 + 16, 32);

    var highlighted = useMemo(function () {
        if (!value) return null;
        return lines.map(function (line, i) {
            var tokens = tokenizeHL7Line(line);
            return React.createElement('div', { key: i, style: { height: '18px' } },
                tokens.length > 0
                    ? tokens.map(function (tok, j) {
                        return React.createElement('span', { key: j, style: { color: tok.color } }, tok.text);
                    })
                    : React.createElement('br')
            );
        });
    }, [value, lines]);

    var initH = (rows || 8) * 18 + 16;

    return (
        <div style={{
            display: 'flex',
            border: '1px solid var(--mi-border)',
            borderRadius: '4px',
            background: 'var(--mi-bg-input)',
            overflow: 'hidden',
            resize: 'vertical',
            height: initH + 'px',
            minHeight: '72px',
        }}>
            {lines.length > 0 && (
                <div ref={gutterRef} style={{
                    fontFamily: HL7_EDITOR_FONT.fontFamily, fontSize: HL7_EDITOR_FONT.fontSize, lineHeight: HL7_EDITOR_FONT.lineHeight,
                    width: gutterW + 'px', minWidth: gutterW + 'px',
                    padding: '8px 6px 8px 4px', textAlign: 'right',
                    color: 'var(--mi-hl7-line-num)', background: 'var(--mi-hl7-gutter-bg)',
                    borderRight: '1px solid var(--mi-hl7-gutter-border)',
                    overflow: 'hidden', userSelect: 'none', whiteSpace: 'pre', boxSizing: 'border-box',
                }}>
                    {lines.map(function (_, i) {
                        return React.createElement('div', { key: i, style: { height: '18px' } }, String(i + 1));
                    })}
                </div>
            )}
            <div style={{ position: 'relative', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div ref={highlightRef} style={{
                    fontFamily: HL7_EDITOR_FONT.fontFamily, fontSize: HL7_EDITOR_FONT.fontSize, lineHeight: HL7_EDITOR_FONT.lineHeight,
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    padding: '8px', overflow: 'hidden', pointerEvents: 'none',
                    whiteSpace: 'pre', overflowWrap: 'normal', boxSizing: 'border-box',
                }}>
                    {highlighted}
                </div>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onClick={onClick}
                    onScroll={handleScroll}
                    placeholder={!value ? placeholder : ''}
                    aria-label="HL7v2 message input"
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    style={{
                        fontFamily: HL7_EDITOR_FONT.fontFamily, fontSize: HL7_EDITOR_FONT.fontSize, lineHeight: HL7_EDITOR_FONT.lineHeight,
                        display: 'block', width: '100%', height: '100%', padding: '8px',
                        border: 'none', outline: 'none', resize: 'none',
                        background: 'transparent', color: 'transparent',
                        caretColor: 'var(--mi-text-primary, inherit)',
                        whiteSpace: 'pre', overflowWrap: 'normal', boxSizing: 'border-box',
                        overflow: 'auto',
                    }}
                />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Inspector View (main)
// ---------------------------------------------------------------------------

function InspectorView(props) {
    var _m = useState(''), messageInput = _m[0], setMessageInput = _m[1];
    var _r = useState(null), result = _r[0], setResult = _r[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    var _l = useState(false), loading = _l[0], setLoading = _l[1];
    var _s = useState(null), selectedNode = _s[0], setSelectedNode = _s[1];
    var _dl = useState(null), deepLinkInfo = _dl[0], setDeepLinkInfo = _dl[1];
    var _ic = useState(false), inputCollapsed = _ic[0], setInputCollapsed = _ic[1];
    var _rp = useState(null), revealPath = _rp[0], setRevealPath = _rp[1];
    var _tsr = useState(null), textareaSelRange = _tsr[0], setTextareaSelRange = _tsr[1];
    var selCounter = useRef(0);
    var revealCounter = useRef(0);
    var doReveal = useCallback(function (path) {
        revealCounter.current++;
        setRevealPath({ path: path, key: revealCounter.current });
    }, []);
    var deepLinkTriggered = useRef(false);

    useEffect(function () {
        if (deepLinkTriggered.current) return;

        var query = (props && props.query) || {};

        if (query.fromBrowser) {
            var stored = null;
            try { stored = sessionStorage.getItem(INSPECTOR_SESSION_KEY); } catch (e) { /* */ }
            if (stored) {
                try { sessionStorage.removeItem(INSPECTOR_SESSION_KEY); } catch (e) { /* */ }
                deepLinkTriggered.current = true;
                setMessageInput(stored);
                setDeepLinkInfo({ source: 'Message Browser' });
                setLoading(true);
                parseHL7(stored).then(function (parsed) {
                    setResult(parsed);
                    setLoading(false);
                }).catch(function (err) {
                    setError(err.message || String(err));
                    setLoading(false);
                    setInputCollapsed(false);
                });
                return;
            }
        }

        var channelId = query.channelId || null;
        var messageId = query.messageId || null;
        var metaDataId = query.metaDataId || '0';

        if (!channelId) {
            var urlParams = getUrlParams();
            channelId = urlParams.get('channelId');
            messageId = urlParams.get('messageId');
            metaDataId = urlParams.get('metaDataId') || '0';
        }

        if (!channelId || !messageId) {
            setInputCollapsed(false);
            return;
        }
        deepLinkTriggered.current = true;
        setDeepLinkInfo({ channelId: channelId, messageId: messageId, metaDataId: metaDataId });
        setLoading(true);

        fetchMessageContent(channelId, messageId, metaDataId).then(function (msgData) {
            setMessageInput(msgData.content);
            setDeepLinkInfo(function (prev) {
                if (!prev) return prev;
                return { channelId: prev.channelId, messageId: prev.messageId, metaDataId: prev.metaDataId, connectorName: msgData.connectorName };
            });
            return parseHL7(msgData.content);
        }).then(function (parsed) {
            setResult(parsed);
            setLoading(false);
        }).catch(function (err) {
            setError(err.message || String(err));
            setLoading(false);
            setInputCollapsed(false);
        });
    }, []);

    var parseTimerRef = useRef(null);
    useEffect(function () {
        clearTimeout(parseTimerRef.current);
        if (!messageInput || !messageInput.trim()) {
            setResult(null);
            setError(null);
            setSelectedNode(null);
            return;
        }
        if (deepLinkTriggered.current && loading) return;
        parseTimerRef.current = setTimeout(function () {
            setLoading(true);
            setError(null);
            parseHL7(messageInput).then(function (parsed) {
                setResult(parsed);
                setLoading(false);
            }, function (err) {
                setError(err.message || String(err));
                setLoading(false);
            });
        }, 500);
        return function () { clearTimeout(parseTimerRef.current); };
    }, [messageInput]);

    var highlightInTextarea = useCallback(function (node) {
        if (!messageInput || !result || !result.tree) return;
        var occ = findSegmentOccurrence(result.tree, node);
        var range = resolveTextRange(messageInput, node.path, occ);
        if (range) {
            selCounter.current++;
            setTextareaSelRange({ start: range.start, end: range.end, key: selCounter.current });
        }
    }, [messageInput, result]);

    var handleTreeSelect = useCallback(function (node) {
        setSelectedNode(node);
        setRevealPath(null);
        highlightInTextarea(node);
    }, [highlightInTextarea]);

    var handleValidationSelect = useCallback(function (node) {
        setSelectedNode(node);
        doReveal(node.path);
        highlightInTextarea(node);
    }, [doReveal, highlightInTextarea]);

    var findNodeInTree = useCallback(function (path, segmentOccurrence) {
        if (!result || !result.tree || !path) return null;
        var parts = path.split('.');
        var segName = parts[0];
        var targetOcc = segmentOccurrence || 1;
        var segCount = 0;
        for (var si = 0; si < result.tree.length; si++) {
            var seg = result.tree[si];
            if (seg.path === segName) {
                segCount++;
                if (segCount !== targetOcc) continue;
                if (parts.length === 1) return seg;
                if (seg.children) {
                    for (var fi = 0; fi < seg.children.length; fi++) {
                        var field = seg.children[fi];
                        if (field.path === parts[0] + '.' + parts[1]) {
                            if (parts.length === 2) return field;
                            if (field.children) {
                                for (var ci = 0; ci < field.children.length; ci++) {
                                    if (field.children[ci].path === path) return field.children[ci];
                                }
                            }
                            return field;
                        }
                    }
                }
                return seg;
            }
        }
        return null;
    }, [result]);

    var handleTextareaClick = useCallback(function (e) {
        setTextareaSelRange(null);
        if (!result || !messageInput) return;
        var pos = e.target.selectionStart;
        var resolved = resolvePathAtPosition(messageInput, pos);
        if (resolved && resolved.path) {
            var node = findNodeInTree(resolved.path, resolved.segmentOccurrence);
            if (node) {
                setSelectedNode(node);
                doReveal(node.path);
            }
        }
    }, [result, messageInput, findNodeInTree, doReveal]);

    return (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Message Inspector</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {deepLinkInfo && !loading && (
                        <span style={{
                            fontSize: '11px', padding: '2px 8px', borderRadius: '3px',
                            background: 'var(--mi-info-bg-subtle)', color: 'var(--mi-info)',
                        }}>
                            {deepLinkInfo.source ? deepLinkInfo.source
                                : ('Message #' + deepLinkInfo.messageId + (deepLinkInfo.connectorName ? ' · ' + deepLinkInfo.connectorName : ''))}
                        </span>
                    )}
                    {result && (
                        <span style={{ opacity: 0.5, fontSize: '12px' }}>
                            {result.messageType} ({result.version})
                            {result.messageDescription ? ' — ' + result.messageDescription : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Input area */}
            {inputCollapsed && result ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px' }}>
                    <span className="mi-link" onClick={function () { setInputCollapsed(false); }}>
                        Show message input
                    </span>
                </div>
            ) : (
                <div>
                    {inputCollapsed === false && result && (
                        <div style={{ marginBottom: '4px', fontSize: '12px' }}>
                            <span className="mi-link" onClick={function () { setInputCollapsed(true); }}>
                                Hide message input
                            </span>
                        </div>
                    )}
                    <HL7SyntaxTextarea
                        value={messageInput}
                        onChange={function (e) { setMessageInput(e.target.value); }}
                        onClick={handleTextareaClick}
                        placeholder="Paste HL7v2 message here..."
                        rows={8}
                        selectionRange={textareaSelRange}
                    />
                    {loading && <span style={{ fontSize: '11px', opacity: 0.5 }}>Parsing...</span>}
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    color: 'var(--mi-error-dark)', background: 'var(--mi-error-bg-subtle)',
                    padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '13px',
                    fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                }}>
                    {error}
                </div>
            )}

            {/* Deep link loading */}
            {loading && !result && deepLinkInfo && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                    <span style={{ fontSize: '13px' }}>
                        Loading message #{deepLinkInfo.messageId}...
                    </span>
                </div>
            )}

            {/* Tree + Detail */}
            {result && result.tree && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 0, overflow: 'hidden' }}>
                    <div style={{ flex: 1, display: 'flex', gap: '1rem', minHeight: 0, overflow: 'hidden' }}>
                        <div style={{ flex: 3, overflow: 'auto', padding: '0.5rem', border: '1px solid var(--mi-border)', borderRadius: '4px' }}>
                            <HL7TreeView tree={result.tree} onSelect={handleTreeSelect} selectedNode={selectedNode} revealPath={revealPath} />
                        </div>
                        <div style={{ flex: 2, overflow: 'auto', padding: '0.75rem', border: '1px solid var(--mi-border)', borderRadius: '4px' }}>
                            <FieldDetail node={selectedNode} messageVersion={result ? result.version : null} />
                        </div>
                    </div>
                    {result.validation && (
                        <ValidationPanel validation={result.validation} tree={result.tree} onSelectNode={handleValidationSelect} />
                    )}
                </div>
            )}

            {/* Empty state */}
            {!result && !error && !loading && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35 }}>
                    <span style={{ fontSize: '13px' }}>Paste an HL7v2 message above to inspect it</span>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Message Browser Integration — platform.registerMessageAction (API 4.7+)
// ---------------------------------------------------------------------------

var INSPECTOR_SESSION_KEY = 'oie-inspector-message';

function extractHL7Content(connectorMessage) {
    if (!connectorMessage) return null;
    var sources = ['raw', 'processedRaw', 'encoded', 'sent'];
    for (var i = 0; i < sources.length; i++) {
        var src = connectorMessage[sources[i]];
        if (src && src.content && typeof src.content === 'string' && src.content.length > 3) {
            return src.content;
        }
    }
    return null;
}

function navigateToInspector(path) {
    if (platform.router && platform.router.navigate) {
        platform.router.navigate(path);
    } else {
        window.location.hash = '#/extensions' + path;
    }
}

function setupMessageAction() {
    if (!platform.registerMessageAction) {
        console.warn('[MessageInspector] platform.registerMessageAction not available — OIE Web Client API 4.7+ required');
        return;
    }

    console.info('[MessageInspector] Registering message action "Inspect Message"');
    platform.registerMessageAction({
        id: 'inspect-hl7-message',
        label: 'Inspect Message',
        icon: 'search',
        order: 100,
        onInvoke: function (message, ctx) {
            var content = extractHL7Content(ctx.connectorMessage);
            if (content) {
                try { sessionStorage.setItem(INSPECTOR_SESSION_KEY, content); } catch (e) { /* quota */ }
                navigateToInspector('/message-inspector?fromBrowser=1');
                return;
            }
            if (ctx.channelId && message && message.messageId) {
                var metaDataId = ctx.metaDataId != null ? ctx.metaDataId : 0;
                navigateToInspector('/message-inspector?channelId=' + ctx.channelId
                    + '&messageId=' + message.messageId + '&metaDataId=' + metaDataId);
                return;
            }
            if (platform.ui && platform.ui.toast) {
                platform.ui.toast('No HL7 content found for this message.', 'warning');
            }
        },
    });
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function register() {
    fetch('/api/extensions/message-inspector/check', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }).then(function (response) {
        if (!response.ok) return;

        platform.registerView('/message-inspector', platform.reactView(InspectorView), { title: 'Message Inspector' });

        platform.registerNavItem({
            id: 'message-inspector',
            label: 'Message Inspector',
            icon: 'search',
            path: '/message-inspector',
            section: 'tools',
            order: 80,
        });

        setupMessageAction();
    }).catch(function () {});
}
