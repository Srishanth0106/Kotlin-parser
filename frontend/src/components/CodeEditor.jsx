import React, { useRef } from 'react';
import { Play, RotateCcw, Trash2, Upload, FileCode } from 'lucide-react';

export default function CodeEditor({
  code,
  setCode,
  examples,
  onParse,
  onClear,
  onReset,
  loading
}) {
  const fileInputRef = useRef(null);

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleExampleSelect = (e) => {
    const selectedId = e.target.value;
    const example = examples.find(ex => ex.id === selectedId);
    if (example) {
      setCode(example.code);
    }
  };

  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <div className="panel-title">
          <FileCode size={18} color="#8b5cf6" />
          <span>Kotlin Source Editor</span>
        </div>

        <div className="panel-actions">
          <select className="select-input" onChange={handleExampleSelect} defaultValue="">
            <option value="" disabled>Load Example...</option>
            {examples.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept=".kt,.txt"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <button className="btn" onClick={() => fileInputRef.current?.click()} title="Upload .kt file">
            <Upload size={14} />
            Upload
          </button>

          <button className="btn" onClick={onClear} title="Clear editor">
            <Trash2 size={14} />
            Clear
          </button>

          <button className="btn" onClick={onReset} title="Reset to sample">
            <RotateCcw size={14} />
            Reset
          </button>

          <button
            className="btn btn-primary"
            onClick={onParse}
            disabled={loading}
          >
            <Play size={14} />
            {loading ? 'Parsing...' : 'Run Parser'}
          </button>
        </div>
      </div>

      <div className="editor-container">
        <pre className="line-numbers">{lineNumbers}</pre>
        <textarea
          className="code-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Kotlin code here (e.g. fun main() { val x = 10 })..."
          spellCheck="false"
        />
      </div>
    </div>
  );
}
