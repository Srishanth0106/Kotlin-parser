import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DiagnosticsTab({ diagnostics = [], code = '' }) {
  const codeLines = code.split('\n');

  if (diagnostics.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <CheckCircle2 size={42} color="var(--success)" style={{ marginBottom: 12 }} />
        <h3 style={{ color: '#e5e7eb', marginBottom: 6 }}>Clean Compilation — Zero Errors</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Flex lexer and GNU Bison parser completed analysis with no syntax or lexical violations.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Found <strong>{diagnostics.length}</strong> diagnostic error(s) during syntax analysis:
      </div>

      {diagnostics.map((diag, idx) => {
        const lineContent = codeLines[diag.line - 1] || '';

        return (
          <div key={idx} className="diag-card">
            <div className="diag-title">
              <AlertTriangle size={18} color="var(--error)" />
              <span>[{diag.severity}] Line {diag.line}, Column {diag.column}</span>
            </div>

            <div style={{ color: '#f3f4f6', fontSize: '0.875rem', marginBottom: 8 }}>
              {diag.message}
            </div>

            {lineContent && (
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '8px 12px',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: '#f87171'
              }}>
                <div>{diag.line} | {lineContent}</div>
                <div style={{ color: '#f59e0b' }}>
                  {' '.repeat(Math.max(0, String(diag.line).length + 3 + (diag.column - 1))) + '^'}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
