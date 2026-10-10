#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "ast.h"
#include "parser.tab.h"

extern int yyparse(void);
extern FILE *yyin;
extern ASTNode *root_ast;
extern Diagnostic *g_diagnostics;
extern TokenInfo *g_tokens_head;
extern TokenInfo *g_tokens_tail;
extern int g_token_count;
extern int g_parse_success;

typedef enum {
    MODE_JSON,
    MODE_TREE,
    MODE_TOKENS
} OutputMode;

int main(int argc, char **argv) {
    OutputMode mode = MODE_JSON;
    const char *filepath = NULL;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--tree") == 0) {
            mode = MODE_TREE;
        } else if (strcmp(argv[i], "--tokens") == 0) {
            mode = MODE_TOKENS;
        } else if (strcmp(argv[i], "--json") == 0) {
            mode = MODE_JSON;
        } else if (argv[i][0] != '-') {
            filepath = argv[i];
        }
    }

    if (filepath) {
        FILE *file = fopen(filepath, "r");
        if (!file) {
            fprintf(stderr, "Error: Could not open input file '%s'\n", filepath);
            return 1;
        }
        yyin = file;
    } else {
        yyin = stdin;
    }

    clock_t start_time = clock();
    int result = yyparse();
    clock_t end_time = clock();
    double elapsed_ms = ((double)(end_time - start_time) / CLOCKS_PER_SEC) * 1000.0;

    int success = (result == 0 && g_parse_success == 1);

    /* Perform Semantic Analysis Pass */
    if (success && root_ast) {
        int semantic_errors = analyze_semantics(root_ast, &g_diagnostics);
        if (semantic_errors > 0) {
            success = 0;
        }
    }

    if (mode == MODE_TREE) {
        printf("=== Kotlin AST Tree ===\n");
        if (root_ast) {
            print_ast_tree(root_ast, 0);
        } else {
            printf("Parsing failed or empty AST.\n");
        }
        if (g_diagnostics) {
            printf("\n=== Diagnostics ===\n");
            Diagnostic *d = g_diagnostics;
            while (d) {
                printf("[%s] Line %d, Col %d: %s\n", d->severity, d->line, d->column, d->message);
                d = d->next;
            }
        }
    } else if (mode == MODE_TOKENS) {
        printf("=== Tokens List (%d tokens) ===\n", g_token_count);
        TokenInfo *t = g_tokens_head;
        while (t) {
            printf("%-15s '%s' (line %d, col %d)\n", t->type, t->lexeme, t->line, t->column);
            t = t->next;
        }
    } else {
        /* Default: JSON output for backend integration */
        print_json_output(root_ast, g_tokens_head, g_diagnostics, g_token_count, success, elapsed_ms);
    }

    if (filepath && yyin) {
        fclose(yyin);
    }

    free_ast(root_ast);
    free_tokens(g_tokens_head);
    free_diagnostics(g_diagnostics);

    return success ? 0 : 1;
}
