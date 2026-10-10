#ifndef AST_H
#define AST_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

/* Diagnostic / Error reporting structure */
typedef struct Diagnostic {
    int line;
    int column;
    char *message;
    char *severity; /* "ERROR", "WARNING" */
    struct Diagnostic *next;
} Diagnostic;

/* Token representation for token-dump mode */
typedef struct TokenInfo {
    char *type;
    char *lexeme;
    int line;
    int column;
    struct TokenInfo *next;
} TokenInfo;

/* AST Node Types */
typedef enum {
    NODE_PROGRAM,
    NODE_FUNC_DECL,
    NODE_PARAM_LIST,
    NODE_PARAM,
    NODE_CLASS_DECL,
    NODE_VAR_DECL,
    NODE_ASSIGNMENT,
    NODE_BLOCK,
    NODE_IF_STMT,
    NODE_WHILE_STMT,
    NODE_FOR_STMT,
    NODE_RETURN_STMT,
    NODE_BINARY_EXPR,
    NODE_UNARY_EXPR,
    NODE_FUNC_CALL,
    NODE_FIELD_ACCESS,
    NODE_IDENTIFIER,
    NODE_LITERAL
} ASTNodeType;

typedef struct ASTNode {
    ASTNodeType type;
    int line;
    int column;

    /* Generic Children Linked List */
    struct ASTNode **children;
    int child_count;
    int child_capacity;

    /* Node Specific Fields */
    char *name;         /* Identifiers, Func names, Class names, Var names */
    char *data_type;    /* Return type, var type, literal type ("INT", "STRING", etc) */
    char *value;        /* Literal raw value, Operator string ("+", "==", etc) */
    bool is_val;        /* For variable declarations (val vs var) */

} ASTNode;

/* AST Construction Functions */
ASTNode *create_ast_node(ASTNodeType type, int line, int column);
void add_child(ASTNode *parent, ASTNode *child);
void add_container_children(ASTNode *parent, ASTNode *container);
void free_ast(ASTNode *node);

/* Helper Constructors */
ASTNode *create_program_node(void);
ASTNode *create_func_decl_node(const char *name, ASTNode *params, const char *return_type, ASTNode *body, int line, int col);
ASTNode *create_param_node(const char *name, const char *type_name, int line, int col);
ASTNode *create_class_decl_node(const char *name, ASTNode *members, int line, int col);
ASTNode *create_var_decl_node(bool is_val, const char *name, const char *type_name, ASTNode *init_expr, int line, int col);
ASTNode *create_assignment_node(ASTNode *target, ASTNode *value, int line, int col);
ASTNode *create_block_node(int line, int col);
ASTNode *create_if_node(ASTNode *cond, ASTNode *then_branch, ASTNode *else_branch, int line, int col);
ASTNode *create_while_node(ASTNode *cond, ASTNode *body, int line, int col);
ASTNode *create_for_node(const char *var_name, ASTNode *iterable, ASTNode *range_end, ASTNode *body, int line, int col);
ASTNode *create_return_node(ASTNode *expr, int line, int col);
ASTNode *create_binary_expr_node(const char *op, ASTNode *left, ASTNode *right, int line, int col);
ASTNode *create_unary_expr_node(const char *op, ASTNode *operand, int line, int col);
ASTNode *create_func_call_node(ASTNode *callee, ASTNode *args, int line, int col);
ASTNode *create_field_access_node(ASTNode *obj, const char *field, int line, int col);
ASTNode *create_identifier_node(const char *name, int line, int col);
ASTNode *create_literal_node(const char *lit_type, const char *value, int line, int col);

/* Token & Diagnostic Management */
TokenInfo *create_token_info(const char *type, const char *lexeme, int line, int col);
void add_token(TokenInfo **head, TokenInfo **tail, const char *type, const char *lexeme, int line, int col);
void free_tokens(TokenInfo *head);

void add_diagnostic(Diagnostic **head, const char *message, const char *severity, int line, int col);
void free_diagnostics(Diagnostic *head);

/* Semantic Analysis */
int analyze_semantics(ASTNode *root, Diagnostic **diagnostics);

/* Output / Serialization */
void print_ast_tree(ASTNode *node, int indent);
void print_json_output(ASTNode *root, TokenInfo *tokens, Diagnostic *diagnostics, int token_count, int parse_success, double elapsed_ms);

#endif /* AST_H */
