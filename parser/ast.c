#define _POSIX_C_SOURCE 200809L
#include "ast.h"

static char *safe_strdup(const char *str) {
    if (!str) return NULL;
    char *copy = malloc(strlen(str) + 1);
    if (copy) strcpy(copy, str);
    return copy;
}

ASTNode *create_ast_node(ASTNodeType type, int line, int column) {
    ASTNode *node = (ASTNode *)calloc(1, sizeof(ASTNode));
    if (!node) {
        fprintf(stderr, "Fatal error: Out of memory creating AST node.\n");
        exit(1);
    }
    node->type = type;
    node->line = line;
    node->column = column;
    node->child_capacity = 4;
    node->children = (ASTNode **)malloc(sizeof(ASTNode *) * node->child_capacity);
    node->child_count = 0;
    return node;
}

void add_child(ASTNode *parent, ASTNode *child) {
    if (!parent || !child) return;
    if (parent->child_count >= parent->child_capacity) {
        parent->child_capacity *= 2;
        parent->children = (ASTNode **)realloc(parent->children, sizeof(ASTNode *) * parent->child_capacity);
    }
    parent->children[parent->child_count++] = child;
}

void add_container_children(ASTNode *parent, ASTNode *container) {
    if (!parent || !container) return;
    for (int i = 0; i < container->child_count; i++) {
        add_child(parent, container->children[i]);
    }
    free(container->children);
    if (container->name) free(container->name);
    if (container->data_type) free(container->data_type);
    if (container->value) free(container->value);
    free(container);
}

void free_ast(ASTNode *node) {
    if (!node) return;
    for (int i = 0; i < node->child_count; i++) {
        free_ast(node->children[i]);
    }
    free(node->children);
    if (node->name) free(node->name);
    if (node->data_type) free(node->data_type);
    if (node->value) free(node->value);
    free(node);
}

ASTNode *create_program_node(void) {
    return create_ast_node(NODE_PROGRAM, 1, 1);
}

ASTNode *create_func_decl_node(const char *name, ASTNode *params, const char *return_type, ASTNode *body, int line, int col) {
    ASTNode *node = create_ast_node(NODE_FUNC_DECL, line, col);
    node->name = safe_strdup(name);
    node->data_type = safe_strdup(return_type ? return_type : "Unit");
    if (params) add_child(node, params);
    if (body) add_child(node, body);
    return node;
}

ASTNode *create_param_node(const char *name, const char *type_name, int line, int col) {
    ASTNode *node = create_ast_node(NODE_PARAM, line, col);
    node->name = safe_strdup(name);
    node->data_type = safe_strdup(type_name);
    return node;
}

ASTNode *create_class_decl_node(const char *name, ASTNode *members, int line, int col) {
    ASTNode *node = create_ast_node(NODE_CLASS_DECL, line, col);
    node->name = safe_strdup(name);
    if (members) add_container_children(node, members);
    return node;
}

ASTNode *create_var_decl_node(bool is_val, const char *name, const char *type_name, ASTNode *init_expr, int line, int col) {
    ASTNode *node = create_ast_node(NODE_VAR_DECL, line, col);
    node->is_val = is_val;
    node->name = safe_strdup(name);
    node->data_type = safe_strdup(type_name ? type_name : "Inferred");
    if (init_expr) add_child(node, init_expr);
    return node;
}

ASTNode *create_assignment_node(ASTNode *target, ASTNode *value, int line, int col) {
    ASTNode *node = create_ast_node(NODE_ASSIGNMENT, line, col);
    if (target) add_child(node, target);
    if (value) add_child(node, value);
    return node;
}

ASTNode *create_block_node(int line, int col) {
    return create_ast_node(NODE_BLOCK, line, col);
}

ASTNode *create_if_node(ASTNode *cond, ASTNode *then_branch, ASTNode *else_branch, int line, int col) {
    ASTNode *node = create_ast_node(NODE_IF_STMT, line, col);
    if (cond) add_child(node, cond);
    if (then_branch) add_child(node, then_branch);
    if (else_branch) add_child(node, else_branch);
    return node;
}

ASTNode *create_while_node(ASTNode *cond, ASTNode *body, int line, int col) {
    ASTNode *node = create_ast_node(NODE_WHILE_STMT, line, col);
    if (cond) add_child(node, cond);
    if (body) add_child(node, body);
    return node;
}

ASTNode *create_for_node(const char *var_name, ASTNode *iterable, ASTNode *range_end, ASTNode *body, int line, int col) {
    ASTNode *node = create_ast_node(NODE_FOR_STMT, line, col);
    node->name = safe_strdup(var_name);
    if (iterable) add_child(node, iterable);
    if (range_end) add_child(node, range_end);
    if (body) add_child(node, body);
    return node;
}

ASTNode *create_return_node(ASTNode *expr, int line, int col) {
    ASTNode *node = create_ast_node(NODE_RETURN_STMT, line, col);
    if (expr) add_child(node, expr);
    return node;
}

ASTNode *create_binary_expr_node(const char *op, ASTNode *left, ASTNode *right, int line, int col) {
    ASTNode *node = create_ast_node(NODE_BINARY_EXPR, line, col);
    node->value = safe_strdup(op);
    if (left) add_child(node, left);
    if (right) add_child(node, right);
    return node;
}

ASTNode *create_unary_expr_node(const char *op, ASTNode *operand, int line, int col) {
    ASTNode *node = create_ast_node(NODE_UNARY_EXPR, line, col);
    node->value = safe_strdup(op);
    if (operand) add_child(node, operand);
    return node;
}

ASTNode *create_func_call_node(ASTNode *callee, ASTNode *args, int line, int col) {
    ASTNode *node = create_ast_node(NODE_FUNC_CALL, line, col);
    if (callee) add_child(node, callee);
    if (args) add_container_children(node, args);
    return node;
}

ASTNode *create_field_access_node(ASTNode *obj, const char *field, int line, int col) {
    ASTNode *node = create_ast_node(NODE_FIELD_ACCESS, line, col);
    node->name = safe_strdup(field);
    if (obj) add_child(node, obj);
    return node;
}

ASTNode *create_identifier_node(const char *name, int line, int col) {
    ASTNode *node = create_ast_node(NODE_IDENTIFIER, line, col);
    node->name = safe_strdup(name);
    return node;
}

ASTNode *create_literal_node(const char *lit_type, const char *value, int line, int col) {
    ASTNode *node = create_ast_node(NODE_LITERAL, line, col);
    node->data_type = safe_strdup(lit_type);
    node->value = safe_strdup(value);
    return node;
}

/* Tokens and Diagnostics */
TokenInfo *create_token_info(const char *type, const char *lexeme, int line, int col) {
    TokenInfo *t = (TokenInfo *)calloc(1, sizeof(TokenInfo));
    t->type = safe_strdup(type);
    t->lexeme = safe_strdup(lexeme);
    t->line = line;
    t->column = col;
    return t;
}

void add_token(TokenInfo **head, TokenInfo **tail, const char *type, const char *lexeme, int line, int col) {
    TokenInfo *t = create_token_info(type, lexeme, line, col);
    if (!*head) {
        *head = t;
        *tail = t;
    } else {
        (*tail)->next = t;
        *tail = t;
    }
}

void free_tokens(TokenInfo *head) {
    while (head) {
        TokenInfo *next = head->next;
        if (head->type) free(head->type);
        if (head->lexeme) free(head->lexeme);
        free(head);
        head = next;
    }
}

void add_diagnostic(Diagnostic **head, const char *message, const char *severity, int line, int col) {
    Diagnostic *d = (Diagnostic *)calloc(1, sizeof(Diagnostic));
    d->message = safe_strdup(message);
    d->severity = safe_strdup(severity);
    d->line = line;
    d->column = col;

    if (!*head) {
        *head = d;
    } else {
        Diagnostic *curr = *head;
        while (curr->next) curr = curr->next;
        curr->next = d;
    }
}

void free_diagnostics(Diagnostic *head) {
    while (head) {
        Diagnostic *next = head->next;
        if (head->message) free(head->message);
        if (head->severity) free(head->severity);
        free(head);
        head = next;
    }
}

/* Semantic Analysis */
static void collect_functions(ASTNode *node, char **known_funcs, int *count, int max_size) {
    if (!node) return;
    if (node->type == NODE_FUNC_DECL && node->name) {
        if (*count < max_size) {
            known_funcs[(*count)++] = node->name;
        }
    }
    for (int i = 0; i < node->child_count; i++) {
        collect_functions(node->children[i], known_funcs, count, max_size);
    }
}

static void check_function_calls(ASTNode *node, char **known_funcs, int count, Diagnostic **diagnostics, int *error_count) {
    if (!node) return;

    if (node->type == NODE_FUNC_CALL && node->child_count > 0) {
        ASTNode *callee = node->children[0];
        if (callee && callee->type == NODE_IDENTIFIER && callee->name) {
            const char *func_name = callee->name;
            bool found = false;
            for (int i = 0; i < count; i++) {
                if (strcmp(known_funcs[i], func_name) == 0) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                char msg[512];
                if (strcmp(func_name, "prin") == 0) {
                    snprintf(msg, sizeof(msg), "Semantic error: Undeclared function '%s'. Did you mean 'print' or 'println'?", func_name);
                } else {
                    snprintf(msg, sizeof(msg), "Semantic error: Undeclared function '%s'", func_name);
                }
                add_diagnostic(diagnostics, msg, "ERROR", callee->line, callee->column);
                (*error_count)++;
            }
        }
    }

    for (int i = 0; i < node->child_count; i++) {
        check_function_calls(node->children[i], known_funcs, count, diagnostics, error_count);
    }
}

int analyze_semantics(ASTNode *root, Diagnostic **diagnostics) {
    if (!root) return 0;

    char *known_funcs[128];
    int count = 0;

    /* Built-in Kotlin functions */
    known_funcs[count++] = "print";
    known_funcs[count++] = "println";
    known_funcs[count++] = "readln";
    known_funcs[count++] = "toInt";
    known_funcs[count++] = "toString";
    known_funcs[count++] = "min";
    known_funcs[count++] = "max";
    known_funcs[count++] = "abs";
    known_funcs[count++] = "sqrt";

    /* Collect user declared functions */
    collect_functions(root, known_funcs, &count, 128);

    int error_count = 0;
    check_function_calls(root, known_funcs, count, diagnostics, &error_count);

    return error_count;
}

/* Readable Tree Printing for Lab Demo */
static const char *node_type_name(ASTNodeType type) {
    switch (type) {
        case NODE_PROGRAM: return "Program";
        case NODE_FUNC_DECL: return "FunctionDeclaration";
        case NODE_PARAM_LIST: return "ParameterList";
        case NODE_PARAM: return "Parameter";
        case NODE_CLASS_DECL: return "ClassDeclaration";
        case NODE_VAR_DECL: return "VariableDeclaration";
        case NODE_ASSIGNMENT: return "Assignment";
        case NODE_BLOCK: return "Block";
        case NODE_IF_STMT: return "IfStatement";
        case NODE_WHILE_STMT: return "WhileStatement";
        case NODE_FOR_STMT: return "ForStatement";
        case NODE_RETURN_STMT: return "ReturnStatement";
        case NODE_BINARY_EXPR: return "BinaryExpression";
        case NODE_UNARY_EXPR: return "UnaryExpression";
        case NODE_FUNC_CALL: return "FunctionCall";
        case NODE_FIELD_ACCESS: return "FieldAccess";
        case NODE_IDENTIFIER: return "Identifier";
        case NODE_LITERAL: return "Literal";
        default: return "Unknown";
    }
}

void print_ast_tree(ASTNode *node, int indent) {
    if (!node) return;
    for (int i = 0; i < indent; i++) printf("  ");
    printf("- %s", node_type_name(node->type));

    if (node->name) printf(" name=\"%s\"", node->name);
    if (node->data_type) printf(" type=\"%s\"", node->data_type);
    if (node->value) printf(" value=\"%s\"", node->value);
    if (node->type == NODE_VAR_DECL) printf(" kind=\"%s\"", node->is_val ? "val" : "var");
    printf(" (line: %d, col: %d)\n", node->line, node->column);

    for (int i = 0; i < node->child_count; i++) {
        print_ast_tree(node->children[i], indent + 1);
    }
}

/* JSON Serialization */
static void print_json_escaped_string(const char *str) {
    if (!str) {
        printf("null");
        return;
    }
    putchar('"');
    for (const char *p = str; *p; p++) {
        switch (*p) {
            case '\\': printf("\\\\"); break;
            case '"':  printf("\\\""); break;
            case '\b': printf("\\b"); break;
            case '\f': printf("\\f"); break;
            case '\n': printf("\\n"); break;
            case '\r': printf("\\r"); break;
            case '\t': printf("\\t"); break;
            default:
                if ((unsigned char)*p < 32) {
                    printf("\\u%04x", (unsigned char)*p);
                } else {
                    putchar(*p);
                }
                break;
        }
    }
    putchar('"');
}

static void print_ast_json_node(ASTNode *node) {
    if (!node) {
        printf("null");
        return;
    }
    printf("{\n");
    printf("  \"type\": \"%s\",\n", node_type_name(node->type));
    printf("  \"line\": %d,\n", node->line);
    printf("  \"column\": %d,\n", node->column);
    
    printf("  \"name\": "); print_json_escaped_string(node->name); printf(",\n");
    printf("  \"dataType\": "); print_json_escaped_string(node->data_type); printf(",\n");
    printf("  \"value\": "); print_json_escaped_string(node->value); printf(",\n");
    printf("  \"isVal\": %s,\n", node->is_val ? "true" : "false");
    
    printf("  \"children\": [");
    for (int i = 0; i < node->child_count; i++) {
        if (i > 0) printf(", ");
        print_ast_json_node(node->children[i]);
    }
    printf("]\n}");
}

void print_json_output(ASTNode *root, TokenInfo *tokens, Diagnostic *diagnostics, int token_count, int parse_success, double elapsed_ms) {
    printf("{\n");
    printf("  \"success\": %s,\n", parse_success ? "true" : "false");

    /* Statistics */
    printf("  \"statistics\": {\n");
    printf("    \"tokenCount\": %d,\n", token_count);
    printf("    \"astNodeCount\": %d,\n", root ? root->child_count : 0);
    printf("    \"parseTimeMs\": %.2f\n", elapsed_ms);
    printf("  },\n");

    /* Diagnostics */
    printf("  \"diagnostics\": [");
    Diagnostic *curr_diag = diagnostics;
    int diag_first = 1;
    while (curr_diag) {
        if (!diag_first) printf(",");
        printf("\n    {\n");
        printf("      \"severity\": "); print_json_escaped_string(curr_diag->severity); printf(",\n");
        printf("      \"message\": "); print_json_escaped_string(curr_diag->message); printf(",\n");
        printf("      \"line\": %d,\n", curr_diag->line);
        printf("      \"column\": %d\n", curr_diag->column);
        printf("    }");
        diag_first = 0;
        curr_diag = curr_diag->next;
    }
    printf("\n  ],\n");

    /* Tokens */
    printf("  \"tokens\": [");
    TokenInfo *curr_tok = tokens;
    int tok_first = 1;
    while (curr_tok) {
        if (!tok_first) printf(",");
        printf("\n    {\n");
        printf("      \"type\": "); print_json_escaped_string(curr_tok->type); printf(",\n");
        printf("      \"lexeme\": "); print_json_escaped_string(curr_tok->lexeme); printf(",\n");
        printf("      \"line\": %d,\n", curr_tok->line);
        printf("      \"column\": %d\n", curr_tok->column);
        printf("    }");
        tok_first = 0;
        curr_tok = curr_tok->next;
    }
    printf("\n  ],\n");

    /* AST */
    printf("  \"ast\": ");
    if (root) {
        print_ast_json_node(root);
    } else {
        printf("null");
    }
    printf("\n}\n");
}
