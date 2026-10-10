import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, Code } from 'lucide-react';

function TreeNode({ node }) {
  const [expanded, setExpanded] = useState(true);

  if (!node) return null;

  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <div className="ast-node">
      <div className="ast-node-header" onClick={() => setExpanded(!expanded)}>
        {hasChildren ? (
          expanded ? <ChevronDown size={14} color="var(--primary)" /> : <ChevronRight size={14} color="var(--primary)" />
        ) : (
          <span style={{ width: 14 }} />
        )}
        <span className="ast-type">{node.type}</span>

        {node.type === 'VariableDeclaration' && (
          <span className="ast-val" style={{ color: node.isVal ? '#f472b6' : '#fb923c' }}>
            [{node.isVal ? 'val' : 'var'}]
          </span>
        )}

        {node.name && <span className="ast-val" style={{ color: '#60a5fa' }}>name="{node.name}"</span>}
        {node.dataType && <span className="ast-val" style={{ color: '#a78bfa' }}>type="{node.dataType}"</span>}
        {node.value && <span className="ast-val" style={{ color: '#4ade80' }}>value={node.value}</span>}

        <span className="ast-pos">L{node.line}:C{node.column}</span>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AstTab({ ast }) {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (ast) {
      navigator.clipboard.writeText(JSON.stringify(ast, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!ast) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
        No AST structure available. Click <strong>Run Parser</strong> to parse input source code.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button className="btn" onClick={() => setShowJson(!showJson)}>
          <Code size={14} />
          {showJson ? 'Switch to Tree View' : 'Switch to Raw JSON'}
        </button>

        <button className="btn" onClick={handleCopy}>
          {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
          {copied ? 'Copied AST JSON!' : 'Copy JSON'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {showJson ? (
          <pre className="json-view">{JSON.stringify(ast, null, 2)}</pre>
        ) : (
          <TreeNode node={ast} />
        )}
      </div>
    </div>
  );
}
