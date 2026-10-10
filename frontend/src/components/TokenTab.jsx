import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function TokenTab({ tokens = [] }) {
  const [filter, setFilter] = useState('');

  const filteredTokens = tokens.filter(tok => 
    tok.type.toLowerCase().includes(filter.toLowerCase()) ||
    tok.lexeme.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="select-input"
            style={{ width: '100%', paddingLeft: 30 }}
            placeholder="Filter tokens..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTokens.length}</strong> of <strong>{tokens.length}</strong> tokens
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {tokens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
            No tokens available. Click <strong>Run Parser</strong> to generate token stream.
          </div>
        ) : (
          <table className="token-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Token Type</th>
                <th>Lexeme</th>
                <th>Line</th>
                <th>Column</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((tok, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--text-dim)' }}>{idx + 1}</td>
                  <td>
                    <span className="token-badge">{tok.type}</span>
                  </td>
                  <td>
                    <code className="lexeme-code">{tok.lexeme}</code>
                  </td>
                  <td>{tok.line}</td>
                  <td>{tok.column}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
