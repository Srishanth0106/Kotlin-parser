import React from 'react';
import { ExternalLink, Layers, ShieldAlert, Cpu } from 'lucide-react';

export default function GrammarTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 8 }}>
      {/* Official References */}
      <section>
        <h3 style={{ fontSize: '1rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ExternalLink size={18} />
          Official Kotlin Language Specification References
        </h3>
        <ul style={{ paddingLeft: 20, fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>
            <a href="https://kotlinlang.org/grammar/" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
              Official Kotlin Grammar Reference (kotlinlang.org)
            </a>
          </li>
          <li>
            <a href="https://kotlinlang.org/spec/syntax-and-grammar.html" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
              Kotlin Specification: Syntax & Grammar Specification
            </a>
          </li>
          <li>
            <a href="https://github.com/Kotlin/kotlin-spec/tree/release/grammar" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
              Official Kotlin Spec Grammar Repository (GitHub)
            </a>
          </li>
        </ul>
      </section>

      {/* Precedence Table */}
      <section>
        <h3 style={{ fontSize: '1rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Layers size={18} />
          Operator Precedence & Associativity
        </h3>
        <table className="token-table">
          <thead>
            <tr>
              <th>Precedence Level</th>
              <th>Operators</th>
              <th>Associativity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1 (Lowest)</td>
              <td><code className="lexeme-code">=</code></td>
              <td>Right</td>
              <td>Assignment</td>
            </tr>
            <tr>
              <td>2</td>
              <td><code className="lexeme-code">||</code></td>
              <td>Left</td>
              <td>Logical OR</td>
            </tr>
            <tr>
              <td>3</td>
              <td><code className="lexeme-code">&amp;&amp;</code></td>
              <td>Left</td>
              <td>Logical AND</td>
            </tr>
            <tr>
              <td>4</td>
              <td><code className="lexeme-code">==, !=</code></td>
              <td>Left</td>
              <td>Equality &amp; Inequality</td>
            </tr>
            <tr>
              <td>5</td>
              <td><code className="lexeme-code">&lt;, &gt;, &lt;=, &gt;=, in</code></td>
              <td>Left</td>
              <td>Relational Comparison &amp; Membership</td>
            </tr>
            <tr>
              <td>6</td>
              <td><code className="lexeme-code">..</code></td>
              <td>Left</td>
              <td>Range operator</td>
            </tr>
            <tr>
              <td>7</td>
              <td><code className="lexeme-code">+, -</code></td>
              <td>Left</td>
              <td>Addition, Subtraction</td>
            </tr>
            <tr>
              <td>8</td>
              <td><code className="lexeme-code">*, /, %</code></td>
              <td>Left</td>
              <td>Multiplication, Division, Modulo</td>
            </tr>
            <tr>
              <td>9</td>
              <td><code className="lexeme-code">!, unary -, unary +</code></td>
              <td>Right</td>
              <td>Logical NOT, Unary Minus/Plus</td>
            </tr>
            <tr>
              <td>10 (Highest)</td>
              <td><code className="lexeme-code">., ()</code></td>
              <td>Left</td>
              <td>Field access, Function call</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Supported Grammar Productions */}
      <section>
        <h3 style={{ fontSize: '1rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Cpu size={18} />
          Supported Grammar Subset (GNU Bison LALR(1) Syntax)
        </h3>
        <pre className="json-view">{`program             : top_level_list ;
top_level_item      : func_decl | class_decl | statement ;

func_decl           : FUN ID '(' param_list_opt ')' type_annotation_opt block ;
param               : ID ':' ID ;
type_annotation_opt : ':' ID | /* empty */ ;

class_decl          : CLASS ID '{' class_member_list '}' | CLASS ID '{' '}' ;
var_decl            : VAL ID type_annotation_opt '=' expr
                    | VAR ID type_annotation_opt '=' expr
                    | VAL ID ':' ID
                    | VAR ID ':' ID ;

statement           : var_decl semi_opt | if_stmt | while_stmt | for_stmt | return_stmt semi_opt | expr semi_opt | block | ';' ;

if_stmt             : IF '(' expr ')' statement
                    | IF '(' expr ')' statement ELSE statement ;

while_stmt          : WHILE '(' expr ')' statement ;
for_stmt            : FOR '(' ID IN expr RANGE expr ')' statement | FOR '(' ID IN expr ')' statement ;
return_stmt         : RETURN expr | RETURN ;

expr                : expr '=' expr
                    | expr OR expr | expr AND expr | expr EQ expr | expr NEQ expr
                    | expr '<' expr | expr '>' expr | expr LE expr | expr GE expr | expr IN expr
                    | expr RANGE expr | expr '+' expr | expr '-' expr | expr '*' expr | expr '/' expr | expr '%' expr
                    | '!' expr | '-' expr | '+' expr | postfix_expr ;

postfix_expr        : primary_expr | postfix_expr '.' ID | postfix_expr '(' arg_list_opt ')' ;
primary_expr        : ID | INT_LITERAL | FLOAT_LITERAL | STRING_LITERAL | CHAR_LITERAL | BOOLEAN_LITERAL | '(' expr ')' ;`}</pre>
      </section>

      {/* Known Limitations */}
      <section>
        <h3 style={{ fontSize: '1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShieldAlert size={18} />
          Deliberate Simplifications &amp; Unsupported Constructs
        </h3>
        <ul style={{ paddingLeft: 20, fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong>Generics:</strong> Type parameters (<code className="lexeme-code">&lt;T&gt;</code>) and variance annotations omitted.</li>
          <li><strong>Extension Functions:</strong> Receiver type prefixes (<code className="lexeme-code">fun String.foo()</code>) not implemented.</li>
          <li><strong>Coroutines:</strong> <code className="lexeme-code">suspend</code> keyword and async/await builders excluded.</li>
          <li><strong>Annotations &amp; Modifiers:</strong> <code className="lexeme-code">@JvmStatic</code>, <code className="lexeme-code">public/private</code> visibility modifiers out of scope.</li>
          <li><strong>Exceptions:</strong> <code className="lexeme-code">try/catch/finally</code> exception blocks excluded.</li>
        </ul>
      </section>
    </div>
  );
}
