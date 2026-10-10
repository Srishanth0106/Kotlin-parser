%{
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ast.h"
#include "parser.tab.h"

int current_column = 1;
int nest_depth = 0;
int last_can_end_stmt = 0;

extern TokenInfo *g_tokens_head;
extern TokenInfo *g_tokens_tail;
extern int g_token_count;
extern Diagnostic *g_diagnostics;

#define YY_USER_ACTION \
    yylloc.first_line = yylineno; \
    yylloc.first_column = current_column; \
    yylloc.last_line = yylineno; \
    yylloc.last_column = current_column + yyleng - 1;

static int record_tok(const char* name, int tok_id, int can_end) {
    int start_col = current_column;
    add_token(&g_tokens_head, &g_tokens_tail, name, yytext, yylineno, start_col);
    g_token_count++;
    current_column += yyleng;
    last_can_end_stmt = can_end;
    return tok_id;
}

static void update_pos_only(void) {
    for (int i = 0; yytext[i] != '\0'; i++) {
        if (yytext[i] == '\n') {
            current_column = 1;
        } else {
            current_column++;
        }
    }
}

%}

%option noyywrap
%option yylineno

/* Regular Expressions */
DIGIT       [0-9]
LETTER      [a-zA-Z_]
ID          {LETTER}({LETTER}|{DIGIT})*
INT_LIT     {DIGIT}+
FLOAT_LIT   {DIGIT}+"."{DIGIT}+
STRING_LIT  \"([^\"\\\n]|\\.)*\"
CHAR_LIT    '([^'\\\n]|\\.)'

%%

"//".*                      { update_pos_only(); }
"/*"([^*]|\*+[^/*])*\*+"/"   { update_pos_only(); }

[ \t\r]+                    { update_pos_only(); }
\n                          { 
                              current_column = 1; 
                              if (last_can_end_stmt && nest_depth == 0) {
                                  last_can_end_stmt = 0;
                                  add_token(&g_tokens_head, &g_tokens_tail, "SEMI", ";", yylineno, current_column);
                                  g_token_count++;
                                  return ';';
                              }
                            }

"val"                       { yylval.sval = strdup(yytext); return record_tok("VAL", VAL, 0); }
"var"                       { yylval.sval = strdup(yytext); return record_tok("VAR", VAR, 0); }
"fun"                       { yylval.sval = strdup(yytext); return record_tok("FUN", FUN, 0); }
"class"                     { yylval.sval = strdup(yytext); return record_tok("CLASS", CLASS, 0); }
"if"                        { yylval.sval = strdup(yytext); return record_tok("IF", IF, 0); }
"else"                      { yylval.sval = strdup(yytext); return record_tok("ELSE", ELSE, 0); }
"while"                     { yylval.sval = strdup(yytext); return record_tok("WHILE", WHILE, 0); }
"for"                       { yylval.sval = strdup(yytext); return record_tok("FOR", FOR, 0); }
"in"                        { yylval.sval = strdup(yytext); return record_tok("IN", IN, 0); }
"return"                    { yylval.sval = strdup(yytext); return record_tok("RETURN", RETURN, 1); }

"true"|"false"              { yylval.sval = strdup(yytext); return record_tok("BOOLEAN_LITERAL", BOOLEAN_LITERAL, 1); }

"=="                        { return record_tok("EQ", EQ, 0); }
"!="                        { return record_tok("NEQ", NEQ, 0); }
"<="                        { return record_tok("LE", LE, 0); }
">="                        { return record_tok("GE", GE, 0); }
"&&"                        { return record_tok("AND", AND, 0); }
"||"                        { return record_tok("OR", OR, 0); }
".."                        { return record_tok("RANGE", RANGE, 0); }

"+"                         { return record_tok("PLUS", '+', 0); }
"-"                         { return record_tok("MINUS", '-', 0); }
"*"                         { return record_tok("STAR", '*', 0); }
"/"                         { return record_tok("SLASH", '/', 0); }
"%"                         { return record_tok("PERCENT", '%', 0); }
"="                         { return record_tok("ASSIGN", '=', 0); }
"!"                         { return record_tok("NOT", '!', 0); }
"<"                         { return record_tok("LT", '<', 0); }
">"                         { return record_tok("GT", '>', 0); }

"("                         { nest_depth++; return record_tok("LPAREN", '(', 0); }
")"                         { if (nest_depth > 0) nest_depth--; return record_tok("RPAREN", ')', 1); }
"{"                         { return record_tok("LBRACE", '{', 0); }
"}"                         { return record_tok("RBRACE", '}', 1); }
"["                         { nest_depth++; return record_tok("LBRACKET", '[', 0); }
"]"                         { if (nest_depth > 0) nest_depth--; return record_tok("RBRACKET", ']', 1); }
","                         { return record_tok("COMMA", ',', 0); }
":"                         { return record_tok("COLON", ':', 0); }
"."                         { return record_tok("DOT", '.', 0); }
";"                         { return record_tok("SEMI", ';', 0); }

{FLOAT_LIT}                 { yylval.sval = strdup(yytext); return record_tok("FLOAT_LITERAL", FLOAT_LITERAL, 1); }
{INT_LIT}                   { yylval.sval = strdup(yytext); return record_tok("INT_LITERAL", INT_LITERAL, 1); }
{STRING_LIT}                { yylval.sval = strdup(yytext); return record_tok("STRING_LITERAL", STRING_LITERAL, 1); }
{CHAR_LIT}                  { yylval.sval = strdup(yytext); return record_tok("CHAR_LITERAL", CHAR_LITERAL, 1); }
{ID}                        { yylval.sval = strdup(yytext); return record_tok("ID", ID, 1); }

.                           { 
                              int start_col = current_column;
                              char msg[256];
                              snprintf(msg, sizeof(msg), "Lexical error: Unexpected character '%s'", yytext);
                              add_diagnostic(&g_diagnostics, msg, "ERROR", yylineno, start_col);
                              return record_tok("UNKNOWN", yytext[0], 0);
                            }

%%
