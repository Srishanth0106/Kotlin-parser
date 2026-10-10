import React from 'react';
import { X, CheckCircle, Terminal, Cpu, Database, Code2 } from 'lucide-react';

export default function AboutModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 24
    }}>
      <div className="panel" style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', overflow: 'hidden' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Code2 size={18} color="#8b5cf6" />
            <span>About Kotlin Parser Studio (Compiler Design Lab Project)</span>
          </div>
          <button className="btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>
              Building a Parser for Kotlin using Lex &amp; Yacc
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              This web application implements a real, compiled Flex/Bison Kotlin subset parser written in C. It performs tokenization, line/column location tracking, LALR(1) shift/reduce syntax analysis, Automatic Semicolon Insertion (ASI), and constructs a hierarchical C Abstract Syntax Tree (AST) with JSON serialization.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ color: '#c084fc', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Terminal size={16} />
                Lexer Engine (Flex / Lex)
              </div>
              <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>Keywords vs General Identifiers</li>
                <li>Line &amp; Column position counters</li>
                <li>Smart ASI Semicolon Injector</li>
                <li>Token-dump serialization</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ color: '#c084fc', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Cpu size={16} />
                Parser Engine (GNU Bison / Yacc)
              </div>
              <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>LALR(1) Productions</li>
                <li>Precedence matching Kotlin spec</li>
                <li>Syntax error diagnostics</li>
                <li>Conflict-free grammar rules</li>
              </ul>
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <div style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <CheckCircle size={16} />
              Empirically Verified &amp; Tested
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tested on 9 valid and invalid test suites with 100% pass rate. Integrated with Node.js Express via child process execution limit protections and rendered in a React studio workbench.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={onClose}>
              Close &amp; Return to Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
