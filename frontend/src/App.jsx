import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import TokenTab from './components/TokenTab';
import AstTab from './components/AstTab';
import DiagnosticsTab from './components/DiagnosticsTab';
import GrammarTab from './components/GrammarTab';

import { fetchHealth, fetchExamples, parseCode } from './services/api';
import { ListTree, Table, AlertOctagon, BookOpen, Clock, Hash } from 'lucide-react';

const DEFAULT_CODE = `// Kotlin Parser Studio — Lab Demonstration Sample
fun main() {
    val x: Int = 10
    var name = "Kotlin Parser Studio"
    
    if (x >= 5) {
        println(name)
    } else {
        println("Small value")
    }

    for (i in 1..5) {
        println(i)
    }
}`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [activeNav, setActiveNav] = useState('editor');
  const [activeTab, setActiveTab] = useState('ast');
  const [healthStatus, setHealthStatus] = useState(null);
  const [examples, setExamples] = useState([]);
  const [parseResult, setParseResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const health = await fetchHealth();
      setHealthStatus(health);

      const ex = await fetchExamples();
      setExamples(ex);

      /* Trigger initial parse */
      handleRunParse(DEFAULT_CODE);
    }
    init();
  }, []);

  const handleRunParse = async (srcCode = code) => {
    setLoading(true);
    try {
      const res = await parseCode(srcCode);
      setParseResult(res);
      if (res?.diagnostics && res.diagnostics.length > 0) {
        setActiveTab('diagnostics');
      }
    } catch (err) {
      setParseResult({
        success: false,
        statistics: { tokenCount: 0, astNodeCount: 0, parseTimeMs: 0 },
        diagnostics: [{ severity: 'ERROR', message: err.message, line: 1, column: 1 }],
        tokens: [],
        ast: null
      });
      setActiveTab('diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setParseResult(null);
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    handleRunParse(DEFAULT_CODE);
  };

  const diagCount = parseResult?.diagnostics?.length || 0;
  const tokenCount = parseResult?.tokens?.length || 0;

  return (
    <div className="app-container">
      <Header
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        healthStatus={healthStatus}
      />

      {activeNav === 'grammar' ? (
        <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
          <div className="panel" style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
            <GrammarTab />
          </div>
        </div>
      ) : (
        <main className="workbench-main">
          {/* Left Panel: Code Editor */}
          <CodeEditor
            code={code}
            setCode={setCode}
            examples={examples}
            onParse={() => handleRunParse(code)}
            onClear={handleClear}
            onReset={handleReset}
            loading={loading}
          />

          {/* Right Panel: Results View (Tokens, AST, Diagnostics, Grammar) */}
          <div className="panel" style={{ height: '100%' }}>
            {/* Panel Header & Tabs */}
            <div className="panel-header" style={{ height: 48, padding: 0 }}>
              <div className="tab-list">
                <button
                  className={`tab-btn ${activeTab === 'ast' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ast')}
                >
                  <ListTree size={16} />
                  AST Tree
                </button>

                <button
                  className={`tab-btn ${activeTab === 'tokens' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tokens')}
                >
                  <Table size={16} />
                  Tokens ({tokenCount})
                </button>

                <button
                  className={`tab-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('diagnostics')}
                  style={{ color: diagCount > 0 ? 'var(--error)' : undefined }}
                >
                  <AlertOctagon size={16} />
                  Diagnostics {diagCount > 0 && `(${diagCount})`}
                </button>

                <button
                  className={`tab-btn ${activeTab === 'grammar' ? 'active' : ''}`}
                  onClick={() => setActiveTab('grammar')}
                >
                  <BookOpen size={16} />
                  Grammar Spec
                </button>
              </div>

              {/* Parsing Execution Statistics */}
              {parseResult && (
                <div className="stats-bar" style={{ paddingRight: 16 }}>
                  <div className="stat-item" title="Parse Execution Time">
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    <span>{parseResult.statistics?.parseTimeMs?.toFixed(2)} ms</span>
                  </div>
                  <div className="stat-item" title="Total Tokens Generated">
                    <Hash size={12} style={{ display: 'inline', marginRight: 4 }} />
                    <span>{parseResult.statistics?.tokenCount} tokens</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'ast' && <AstTab ast={parseResult?.ast} />}
              {activeTab === 'tokens' && <TokenTab tokens={parseResult?.tokens} />}
              {activeTab === 'diagnostics' && (
                <DiagnosticsTab diagnostics={parseResult?.diagnostics} code={code} />
              )}
              {activeTab === 'grammar' && <GrammarTab />}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
