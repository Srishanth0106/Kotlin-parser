%{
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ast.h"

extern int yylex(void);
extern int yylineno;
extern int yychar;
extern char *yytext;
extern int current_column;

void yyerror(const char *s);

ASTNode *root_ast = NULL;
Diagnostic *g_diagnostics = NULL;
TokenInfo *g_tokens_head = NULL;
TokenInfo *g_tokens_tail = NULL;
int g_token_count = 0;
int g_parse_success = 1;

%}

%locations

%code requires {
    #include "ast.h"
}

%union {
    char *sval;
    struct ASTNode *ast;
}

/* Keyword Tokens */
%token <sval> VAL VAR FUN CLASS IF ELSE WHILE FOR IN RETURN

/* Literal Tokens */
%token <sval> ID INT_LITERAL FLOAT_LITERAL STRING_LITERAL CHAR_LITERAL BOOLEAN_LITERAL

/* Multi-character Operators */
%token EQ NEQ LE GE AND OR RANGE

/* Precedence and Associativity */
%nonassoc LOWER_THAN_ELSE
%nonassoc ELSE

%right '='
%left OR
%left AND
%left EQ NEQ
%left '<' '>' LE GE IN
%left RANGE
%left '+' '-'
%left '*' '/' '%'
%right '!' UMINUS UPLUS
%left '.' '(' ')'

/* Rule Return Types */
%type <ast> program top_level_list top_level_item func_decl param_list_opt param_list param class_decl class_member_list class_member var_decl block statement_list statement assignment_stmt function_call_stmt if_stmt while_stmt for_stmt return_stmt expr primary_expr postfix_expr arg_list_opt arg_list
%type <sval> type_annotation_opt

%%

program
    : top_level_list YYEOF {
        root_ast = $1;
        $$ = $1;
    }
    ;

top_level_list
    : top_level_list top_level_item {
        $$ = $1;
        if ($2) add_child($$, $2);
    }
    | /* empty */ {
        $$ = create_program_node();
    }
    ;

top_level_item
    : func_decl { $$ = $1; }
    | class_decl { $$ = $1; }
    | statement { $$ = $1; }
    ;

func_decl
    : FUN ID '(' param_list_opt ')' type_annotation_opt block {
        $$ = create_func_decl_node($2, $4, $6, $7, @1.first_line, @1.first_column);
        free($2);
        if ($6) free($6);
    }
    ;

param_list_opt
    : param_list { $$ = $1; }
    | /* empty */ { $$ = NULL; }
    ;

param_list
    : param_list ',' param {
        $$ = $1;
        if ($3) add_child($$, $3);
    }
    | param {
        $$ = create_ast_node(NODE_PARAM_LIST, @1.first_line, @1.first_column);
        if ($1) add_child($$, $1);
    }
    ;

param
    : ID ':' ID {
        $$ = create_param_node($1, $3, @1.first_line, @1.first_column);
        free($1);
        free($3);
    }
    ;

type_annotation_opt
    : ':' ID {
        $$ = $2;
    }
    | /* empty */ {
        $$ = NULL;
    }
    ;

class_decl
    : CLASS ID '{' class_member_list '}' {
        $$ = create_class_decl_node($2, $4, @1.first_line, @1.first_column);
        free($2);
    }
    | CLASS ID '{' '}' {
        $$ = create_class_decl_node($2, NULL, @1.first_line, @1.first_column);
        free($2);
    }
    ;

class_member_list
    : class_member_list class_member {
        $$ = $1;
        if ($2) add_child($$, $2);
    }
    | class_member {
        $$ = create_ast_node(NODE_BLOCK, @1.first_line, @1.first_column);
        if ($1) add_child($$, $1);
    }
    ;

class_member
    : var_decl semi_opt { $$ = $1; }
    | func_decl { $$ = $1; }
    | ';' { $$ = NULL; }
    ;

var_decl
    : VAL ID type_annotation_opt '=' expr {
        $$ = create_var_decl_node(true, $2, $3, $5, @1.first_line, @1.first_column);
        free($2);
        if ($3) free($3);
    }
    | VAR ID type_annotation_opt '=' expr {
        $$ = create_var_decl_node(false, $2, $3, $5, @1.first_line, @1.first_column);
        free($2);
        if ($3) free($3);
    }
    | VAL ID ':' ID {
        $$ = create_var_decl_node(true, $2, $4, NULL, @1.first_line, @1.first_column);
        free($2);
        free($4);
    }
    | VAR ID ':' ID {
        $$ = create_var_decl_node(false, $2, $4, NULL, @1.first_line, @1.first_column);
        free($2);
        free($4);
    }
    ;

block
    : '{' statement_list '}' {
        $$ = $2;
    }
    | '{' '}' {
        $$ = create_block_node(@1.first_line, @1.first_column);
    }
    ;

statement_list
    : statement_list statement {
        $$ = $1;
        if ($2) add_child($$, $2);
    }
    | statement {
        $$ = create_block_node(@1.first_line, @1.first_column);
        if ($1) add_child($$, $1);
    }
    ;

statement
    : var_decl semi_opt { $$ = $1; }
    | assignment_stmt semi_opt { $$ = $1; }
    | function_call_stmt semi_opt { $$ = $1; }
    | if_stmt { $$ = $1; }
    | while_stmt { $$ = $1; }
    | for_stmt { $$ = $1; }
    | return_stmt semi_opt { $$ = $1; }
    | block { $$ = $1; }
    | ';' { $$ = NULL; }
    ;

assignment_stmt
    : expr '=' expr {
        $$ = create_assignment_node($1, $3, @1.first_line, @1.first_column);
    }
    ;

function_call_stmt
    : postfix_expr '(' arg_list_opt ')' {
        $$ = create_func_call_node($1, $3, @1.first_line, @1.first_column);
    }
    ;

if_stmt
    : IF '(' expr ')' statement %prec LOWER_THAN_ELSE {
        $$ = create_if_node($3, $5, NULL, @1.first_line, @1.first_column);
    }
    | IF '(' expr ')' statement ELSE statement {
        $$ = create_if_node($3, $5, $7, @1.first_line, @1.first_column);
    }
    ;

while_stmt
    : WHILE '(' expr ')' statement {
        $$ = create_while_node($3, $5, @1.first_line, @1.first_column);
    }
    ;

for_stmt
    : FOR '(' ID IN expr RANGE expr ')' statement {
        $$ = create_for_node($3, $5, $7, $9, @1.first_line, @1.first_column);
        free($3);
    }
    | FOR '(' ID IN expr ')' statement {
        $$ = create_for_node($3, $5, NULL, $7, @1.first_line, @1.first_column);
        free($3);
    }
    ;

return_stmt
    : RETURN expr {
        $$ = create_return_node($2, @1.first_line, @1.first_column);
    }
    | RETURN {
        $$ = create_return_node(NULL, @1.first_line, @1.first_column);
    }
    ;

expr
    : expr '=' expr {
        $$ = create_assignment_node($1, $3, @1.first_line, @1.first_column);
    }
    | expr OR expr { $$ = create_binary_expr_node("||", $1, $3, @1.first_line, @1.first_column); }
    | expr AND expr { $$ = create_binary_expr_node("&&", $1, $3, @1.first_line, @1.first_column); }
    | expr EQ expr { $$ = create_binary_expr_node("==", $1, $3, @1.first_line, @1.first_column); }
    | expr NEQ expr { $$ = create_binary_expr_node("!=", $1, $3, @1.first_line, @1.first_column); }
    | expr '<' expr { $$ = create_binary_expr_node("<", $1, $3, @1.first_line, @1.first_column); }
    | expr '>' expr { $$ = create_binary_expr_node(">", $1, $3, @1.first_line, @1.first_column); }
    | expr LE expr { $$ = create_binary_expr_node("<=", $1, $3, @1.first_line, @1.first_column); }
    | expr GE expr { $$ = create_binary_expr_node(">=", $1, $3, @1.first_line, @1.first_column); }
    | expr IN expr { $$ = create_binary_expr_node("in", $1, $3, @1.first_line, @1.first_column); }
    | expr RANGE expr { $$ = create_binary_expr_node("..", $1, $3, @1.first_line, @1.first_column); }
    | expr '+' expr { $$ = create_binary_expr_node("+", $1, $3, @1.first_line, @1.first_column); }
    | expr '-' expr { $$ = create_binary_expr_node("-", $1, $3, @1.first_line, @1.first_column); }
    | expr '*' expr { $$ = create_binary_expr_node("*", $1, $3, @1.first_line, @1.first_column); }
    | expr '/' expr { $$ = create_binary_expr_node("/", $1, $3, @1.first_line, @1.first_column); }
    | expr '%' expr { $$ = create_binary_expr_node("%", $1, $3, @1.first_line, @1.first_column); }
    | '!' expr { $$ = create_unary_expr_node("!", $2, @1.first_line, @1.first_column); }
    | '-' expr %prec UMINUS { $$ = create_unary_expr_node("-", $2, @1.first_line, @1.first_column); }
    | '+' expr %prec UPLUS { $$ = create_unary_expr_node("+", $2, @1.first_line, @1.first_column); }
    | postfix_expr { $$ = $1; }
    ;

postfix_expr
    : primary_expr { $$ = $1; }
    | postfix_expr '.' ID {
        $$ = create_field_access_node($1, $3, @1.first_line, @1.first_column);
        free($3);
    }
    | postfix_expr '(' arg_list_opt ')' {
        $$ = create_func_call_node($1, $3, @1.first_line, @1.first_column);
    }
    ;

primary_expr
    : ID {
        $$ = create_identifier_node($1, @1.first_line, @1.first_column);
        free($1);
    }
    | INT_LITERAL {
        $$ = create_literal_node("INT", $1, @1.first_line, @1.first_column);
        free($1);
    }
    | FLOAT_LITERAL {
        $$ = create_literal_node("FLOAT", $1, @1.first_line, @1.first_column);
        free($1);
    }
    | STRING_LITERAL {
        $$ = create_literal_node("STRING", $1, @1.first_line, @1.first_column);
        free($1);
    }
    | CHAR_LITERAL {
        $$ = create_literal_node("CHAR", $1, @1.first_line, @1.first_column);
        free($1);
    }
    | BOOLEAN_LITERAL {
        $$ = create_literal_node("BOOLEAN", $1, @1.first_line, @1.first_column);
        free($1);
    }
    | '(' expr ')' {
        $$ = $2;
    }
    ;

arg_list_opt
    : arg_list { $$ = $1; }
    | /* empty */ { $$ = NULL; }
    ;

arg_list
    : arg_list ',' expr {
        $$ = $1;
        if ($3) add_child($$, $3);
    }
    | expr {
        $$ = create_ast_node(NODE_BLOCK, @1.first_line, @1.first_column);
        if ($1) add_child($$, $1);
    }
    ;

semi_opt
    : ';'
    | /* empty */
    ;

%%

void yyerror(const char *s) {
    g_parse_success = 0;
    char msg[512];
    snprintf(msg, sizeof(msg), "Syntax error near '%s': %s", yytext ? yytext : "EOF", s);
    add_diagnostic(&g_diagnostics, msg, "ERROR", yylineno, current_column);
}
