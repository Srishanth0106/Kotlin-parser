# Kotlin Parser Studio — Lex & Yacc Lab Implementation

> **Compiler Design Lab Project:** Building a Parser for a Defined Subset of Kotlin using Flex (Lex) and GNU Bison (Yacc) with a C Abstract Syntax Tree (AST) Generator, Express.js Backend, and React Workbench UI.

## 🌐 Live Demo
**[https://kotlin-parser-frontend.onrender.com](https://kotlin-parser-frontend.onrender.com)**

> ⚠️ First load may take ~30 seconds if the backend is waking from sleep (free tier).

---

## 1. Official Grammar References
This project derives its supported syntax rules from the official Kotlin language specifications:
- **Official Kotlin Grammar Reference:** [https://kotlinlang.org/grammar/](https://kotlinlang.org/grammar/)
- **Kotlin Language Specification (Syntax & Grammar):** [https://kotlinlang.org/spec/syntax-and-grammar.html](https://kotlinlang.org/spec/syntax-and-grammar.html)
- **Official Kotlin Specification Repository:** [https://github.com/Kotlin/kotlin-spec/tree/release/grammar](https://github.com/Kotlin/kotlin-spec/tree/release/grammar)

---

## 2. Project Architecture & Technology Stack

```
kotlin-parser-studio/
├── parser/                   # Real Flex / Bison C Parser Engine
│   ├── lexer.l               # Flex Scanner with position tracking & ASI
│   ├── parser.y              # Bison LALR(1) Grammar productions
│   ├── ast.h / ast.c         # C AST Data Structures & JSON Serializer
│   ├── main.c                # CLI Driver (--json, --tree, --tokens)
│   ├── Makefile              # GCC build script & test target
│   └── GRAMMAR.md            # Detailed Bison production documentation
├── tests/                    # Valid & Invalid Test Fixtures
│   ├── valid/                # 6 Valid Kotlin syntax test files
│   ├── invalid/              # 3 Invalid Kotlin syntax error test files
│   └── run_tests.sh          # Automated bash test suite runner
├── backend/                  # Node.js Express Backend Service
│   ├── package.json
│   └── src/
│       ├── app.js            # Express application setup & CORS
│       ├── server.js         # HTTP Server entry point (port 5000)
│       ├── routes/           # REST Endpoints (/api/health, /api/examples, /api/parse)
│       └── services/         # Spawn service for binary execution
├── frontend/                 # React 18 + Vite Studio Workbench
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── components/       # Header, CodeEditor, TokenTab, AstTab, DiagnosticsTab, GrammarTab
│       ├── services/         # API fetch module
│       └── App.jsx           # Main Studio Workbench UI
├── Dockerfile                # Multi-stage containerization script
├── docker-compose.yml        # Docker compose service definition
└── README.md                 # Complete documentation & Viva Voce guide
```

---

## 3. Supported Kotlin Features & Syntax Subset

- **Variable Declarations:** `val` (read-only) and `var` (mutable) with explicit type annotations (`: Int`, `: String`, `: Boolean`) or type inferencing.
- **Function Declarations:** `fun name(param: Type): ReturnType { ... }` and zero-parameter functions.
- **Expressions & Literals:** Integer (`42`), Float (`3.14`), String (`"Hello"`), Char (`'a'`), Boolean (`true`/`false`).
- **Operators & Precedence:** Arithmetic (`+`, `-`, `*`, `/`, `%`), Comparison (`<`, `>`, `<=`, `>=`), Equality (`==`, `!=`), Logical (`&&`, `||`, `!`), Range (`..`), Membership (`in`).
- **Control Flow:** `if (cond) stmt else stmt` with dangling-else ambiguity resolution.
- **Loops:** `while (cond) stmt` and range-based `for (i in 1..10) stmt`.
- **Blocks & Nesting:** Nested block statements `{ { val inner = 1 } }`.
- **Function Calls:** `println("Big")`, `add(10, 20)`, object method calls `obj.compute()`.
- **Return Statements:** `return expr` or `return`.
- **Classes:** `class Person { val name: String = "Alice" fun greet() { ... } }`.
- **Statement Termination:** Optional semicolons and Automatic Semicolon Insertion (ASI) on newlines.

---

## 4. Empirical Test Verification Matrix

The parser has been validated using the automated test suite (`tests/run_tests.sh`) with **100% Pass Rate (9/9 Passed)**:

| Test Case | Category | Input Summary | Result |
| :--- | :--- | :--- | :--- |
| `var_decl.kt` | Valid | `val x: Int = 10`, `var name = "..."` | **PASS** |
| `func_decl.kt` | Valid | `fun add(a: Int, b: Int): Int { return a + b }` | **PASS** |
| `expressions.kt` | Valid | `val total = 2 + 3 * 4 > 10 && true`, `x in 1..10` | **PASS** |
| `control_flow.kt` | Valid | `if (score >= 90) { ... } else { ... }` | **PASS** |
| `loops.kt` | Valid | `while (count < 5) { ... }`, `for (i in 1..10) { ... }` | **PASS** |
| `class_decl.kt` | Valid | `class Calculator { val v = "1.0" fun compute() { ... } }` | **PASS** |
| `missing_brace.kt` | Invalid | `fun broken() { val x = 10` (Unclosed brace) | **REJECTED (PASS)** |
| `missing_expr.kt` | Invalid | `val x = ;` (Missing expression) | **REJECTED (PASS)** |
| `unmatched_paren.kt`| Invalid | `if (x > 5 { return 1 }` (Unmatched parenthesis) | **REJECTED (PASS)** |

---

## 5. Quick Start & Execution Instructions

### 1. Build and Test the C Parser (Terminal / WSL)
```bash
cd parser
make clean && make
make test
```
To run the parser manually on any file:
```bash
./kotlin_parser --json ../tests/valid/var_decl.kt
./kotlin_parser --tree ../tests/valid/func_decl.kt
./kotlin_parser --tokens ../tests/valid/expressions.kt
```

### 2. Start the Express Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 3. Start the React Frontend Studio
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your web browser.*

### 4. Optional Docker Execution
```bash
docker-compose up --build
```

---

## 6. Compiler Design Viva Voce Explanation Guide

If asked questions during your lab evaluation or viva presentation, refer to these technical explanations:

1. **How does Flex tokenize the source code and calculate positions?**
   - Flex matches regular expression patterns sequentially. Each rule calls `update_pos_and_record()`, incrementing `current_column` by `yyleng` and logging token type, lexeme, line number (`yylineno`), and start column into a linked list.
2. **How does Automatic Semicolon Insertion (ASI) work?**
   - In `lexer.l`, when a newline (`\n`) is encountered, the scanner checks if the previously scanned token was a statement-ending token (such as identifiers, literals, `)`, `}`, `]`, or `return`). If true and not nested in parentheses (`nest_depth == 0`), the scanner automatically synthesizes a `;` token.
3. **How does Bison handle operator precedence and associativity?**
   - Bison uses `%left`, `%right`, and `%nonassoc` directives. For example, `%left '+' '-'` and `%left '*' '/'` ensure that multiplication binds tighter than addition (`2 + 3 * 4` evaluates as `2 + (3 * 4)` in the AST).
4. **How is the AST constructed in memory and serialized to JSON?**
   - The C parser uses a generic node structure `ASTNode` with a dynamic array of child pointers (`ASTNode **children`). As Bison reduces grammar productions, it constructs AST nodes using constructor functions in `ast.c`. The `print_json_output()` function traverses the tree and prints machine-readable JSON with string escaping.
5. **How does the web application invoke the real C parser?**
   - The Express backend uses Node.js `child_process.spawn` to execute the compiled `kotlin_parser` binary with fixed argument arrays (`['--json', tempFilePath]`). User input is written to isolated temporary files with execution size limits and timeouts to prevent command injection or infinite loop hangs.
