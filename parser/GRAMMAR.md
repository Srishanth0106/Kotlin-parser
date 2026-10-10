# Kotlin Parser Studio — Grammar Documentation

## 1. Official Reference URLs
- **Official Kotlin Grammar Reference:** [https://kotlinlang.org/grammar/](https://kotlinlang.org/grammar/)
- **Kotlin Language Specification (Syntax & Grammar):** [https://kotlinlang.org/spec/syntax-and-grammar.html](https://kotlinlang.org/spec/syntax-and-grammar.html)
- **Official Kotlin Specification Grammar Repository:** [https://github.com/Kotlin/kotlin-spec/tree/release/grammar](https://github.com/Kotlin/kotlin-spec/tree/release/grammar)

---

## 2. Derivation & Official Grammar Mapping

The official Kotlin specification uses an ANTLR-style notation for its EBNF grammar rules. GNU Bison requires LALR(1) context-free grammar productions. Below is the mapping from the official specification rules to the Bison productions implemented in Kotlin Parser Studio.

### Official Kotlin Rules vs. Simplified Bison Subset

| Feature | Official Kotlin Syntax Rule | Implemented Bison Production | Deliberate Simplifications |
| :--- | :--- | :--- | :--- |
| **Top Level File** | `kotlinFile ::= preamble topLevelObject*` | `program -> top_level_list` | Omitted file annotations, package headers, and import lists. |
| **Variable Decl** | `propertyDeclaration ::= ( 'val' \| 'var' ) typeParameters? ...` | `var_decl -> VAL/VAR ID (: type)? (= expr)?` | Supports primitive types (`Int`, `String`, `Boolean`, `Double`, `Char`, `Any`) without custom getter/setter accessors or property delegates. |
| **Function Decl** | `functionDeclaration ::= 'fun' SimpleIdentifier ...` | `func_decl -> FUN ID ( param_list? ) (: type)? block` | Simple identifier functions with typed parameter lists and return type annotations. Generics, inline functions, and expression bodies (`= expr`) excluded. |
| **Class Decl** | `classDeclaration ::= modifiers? 'class' SimpleIdentifier ...` | `class_decl -> CLASS ID class_body` | Class header with body `{ member_list }`. Primary constructor parameters and inheritance omitted. |
| **If / Else** | `ifExpression ::= 'if' '(' controlStructureBody ')' ...` | `if_stmt -> IF ( expr ) statement ( ELSE statement )?` | Classic Kotlin `if-else` statement and expression branching. |
| **While Loop** | `whileStatement ::= 'while' '(' expression ')' ...` | `while_stmt -> WHILE ( expr ) statement` | Standard condition evaluated per iteration. |
| **For Loop** | `forStatement ::= 'for' '(' annotation* variableDeclaration 'in' expression ')' ...` | `for_stmt -> FOR ( ID IN expr RANGE expr ) statement \| FOR ( ID IN expr ) statement` | Range-based (`1..10`) and collection iteration over identifiers/expressions. |
| **Block** | `block ::= '{' statements '}'` | `block -> { statement_list }` | Enclosed list of zero or more statements. |
| **Return** | `jumpExpression ::= 'return' expression?` | `return_stmt -> RETURN expr?` | Returns optional value. |
| **Expressions** | `expression ::= disjunction` | Binary / Unary expression hierarchy | Precedence matching standard Kotlin operator binding. |

---

## 3. Supported Grammar Subset in Bison Notation

```yacc
program
    : top_level_list
    ;

top_level_list
    : top_level_list top_level_item
    | /* empty */
    ;

top_level_item
    : func_decl
    | class_decl
    | var_decl semi_opt
    | statement
    ;

func_decl
    : FUN ID '(' param_list_opt ')' type_annotation_opt block
    ;

param_list_opt
    : param_list
    | /* empty */
    ;

param_list
    : param_list ',' param
    | param
    ;

param
    : ID ':' ID
    ;

type_annotation_opt
    : ':' ID
    | /* empty */
    ;

class_decl
    : CLASS ID '{' class_member_list '}'
    | CLASS ID '{' '}'
    ;

class_member_list
    : class_member_list class_member
    | class_member
    ;

class_member
    : var_decl semi_opt
    | func_decl
    ;

var_decl
    : VAL ID type_annotation_opt '=' expr
    | VAR ID type_annotation_opt '=' expr
    | VAR ID ':' ID
    | VAL ID ':' ID
    ;

block
    : '{' statement_list '}'
    | '{' '}'
    ;

statement_list
    : statement_list statement
    | statement
    ;

statement
    : var_decl semi_opt
    | assignment semi_opt
    | if_stmt
    | while_stmt
    | for_stmt
    | return_stmt semi_opt
    | expr_stmt semi_opt
    | block
    ;

assignment
    : ID '=' expr
    | expr '.' ID '=' expr
    ;

if_stmt
    : IF '(' expr ')' statement %prec LOWER_THAN_ELSE
    | IF '(' expr ')' statement ELSE statement
    ;

while_stmt
    : WHILE '(' expr ')' statement
    ;

for_stmt
    : FOR '(' ID IN expr RANGE expr ')' statement
    | FOR '(' ID IN expr ')' statement
    ;

return_stmt
    : RETURN expr
    | RETURN
    ;

expr_stmt
    : expr
    ;

expr
    : expr OR expr
    | expr AND expr
    | expr EQ expr
    | expr NEQ expr
    | expr '<' expr
    | expr '>' expr
    | expr LE expr
    | expr GE expr
    | expr RANGE expr
    | expr '+' expr
    | expr '-' expr
    | expr '*' expr
    | expr '/' expr
    | expr '%' expr
    | '!' expr
    | '-' expr %prec UMINUS
    | '+' expr %prec UPLUS
    | primary_expr
    ;

primary_expr
    : ID
    | INT_LITERAL
    | FLOAT_LITERAL
    | STRING_LITERAL
    | CHAR_LITERAL
    | BOOLEAN_LITERAL
    | '(' expr ')'
    | function_call
    | field_access
    ;

function_call
    : ID '(' arg_list_opt ')'
    | primary_expr '.' ID '(' arg_list_opt ')'
    ;

field_access
    : primary_expr '.' ID
    ;

arg_list_opt
    : arg_list
    | /* empty */
    ;

arg_list
    : arg_list ',' expr
    | expr
    ;

semi_opt
    : ';'
    | /* empty */
    ;
```

---

## 4. Operator Precedence and Associativity Table

The operators are listed from **lowest precedence to highest precedence**, matching Bison's `%left`, `%right`, `%nonassoc` directives:

| Precedence (Low -> High) | Operator | Associativity | Description |
| :--- | :--- | :--- | :--- |
| 1 | `=` | Right | Assignment |
| 2 | `||` | Left | Logical OR |
| 3 | `&&` | Left | Logical AND |
| 4 | `==`, `!=` | Left | Equality & Inequality |
| 5 | `<`, `>`, `<=`, `>=` | Left | Relational Comparisons |
| 6 | `..` | Left | Range operator |
| 7 | `+`, `-` | Left | Addition, Subtraction |
| 8 | `*`, `/`, `%` | Left | Multiplication, Division, Modulo |
| 9 | `!`, unary `-`, unary `+` | Right | Logical NOT, Unary Minus/Plus |
| 10 | `.`, `()` | Left | Member access, Function call |

---

## 5. Statement Separation and Newline Handling

- **Semicolons:** Semicolons (`;`) are supported but optional at the end of statements.
- **Newlines:** The lexer filters out routine newlines inside expressions and block boundaries so that statements are cleanly delimited without requiring mandatory semicolons.
- **Ambiguity Resolution:** Dangling `if-else` ambiguities are resolved using `%nonassoc LOWER_THAN_ELSE` and `%nonassoc ELSE` rules, binding `else` to the closest preceding `if`.

---

## 6. Unsupported Kotlin Features (Out of Scope)

The following Kotlin features are explicitly excluded from this parser subset:
1. Generics (`<T>`, `out`, `in`).
2. Extension functions (`fun String.myExtension()`).
3. Coroutines, `suspend` functions, and `async/await`.
4. Annotations (`@JvmStatic`, `@Deprecated`).
5. Property delegates (`by lazy`, `by Delegates.observable`).
6. Try/Catch/Finally exception handling constructs.
7. Advanced pattern matching in `when` expressions.
8. Interface inheritance, `open`, `sealed`, `abstract` modifiers.
