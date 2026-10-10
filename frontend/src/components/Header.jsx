import React from 'react';
import { Code2, BookOpen, Terminal } from 'lucide-react';

export default function Header({ activeNav, setActiveNav, healthStatus }) {
  const isOnline = healthStatus?.status === 'ok' && healthStatus?.parserAvailable;

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <Code2 size={22} />
        </div>
        <div>
          <div className="brand-title">Kotlin Parser Studio</div>
          <div className="brand-subtitle">Official Lex & Yacc Lab Implementation</div>
        </div>
      </div>

      <div className="nav-pills">
        <button
          className={`nav-btn ${activeNav === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveNav('editor')}
        >
          <Terminal size={16} />
          Editor Workbench
        </button>

        <button
          className={`nav-btn ${activeNav === 'grammar' ? 'active' : ''}`}
          onClick={() => setActiveNav('grammar')}
        >
          <BookOpen size={16} />
          Grammar Specification
        </button>
      </div>

      <div className="status-badge" title={`Server timestamp: ${healthStatus?.timestamp || 'N/A'}`}>
        <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
        <span>{isOnline ? 'Flex/Bison Engine Online' : 'Backend Offline'}</span>
      </div>
    </header>
  );
}
