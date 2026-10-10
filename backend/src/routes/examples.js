const express = require('express');
const router = express.Router();

const EXAMPLES = [
    {
        id: 'var_decl',
        name: 'Variable Declarations',
        description: 'val (immutable) and var (mutable) declarations with type annotations and inferencing',
        code: `val count: Int = 42\nvar message = "Hello Kotlin Parser Studio"\nval isEnabled: Boolean = true`
    },
    {
        id: 'func_decl',
        name: 'Function Declarations',
        description: 'Functions with typed parameters, return types, and function calls',
        code: `fun add(a: Int, b: Int): Int {\n    return a + b\n}\n\nfun main() {\n    val sum = add(10, 20)\n    println("Calculated Sum: ")\n}`
    },
    {
        id: 'expressions',
        name: 'Expressions & Precedence',
        description: 'Arithmetic, logical, relational comparison, and range operators',
        code: `val total = 2 + 3 * 4 > 10 && true\nval inRange = x in 1..100\nval isValid = !isClosed || (status == 200)`
    },
    {
        id: 'control_flow',
        name: 'Control Flow (If/Else)',
        description: 'If-else conditional branching and evaluation',
        code: `fun evaluateGrade(score: Int) {\n    if (score >= 90) {\n        println("Grade A")\n    } else if (score >= 75) {\n        println("Grade B")\n    } else {\n        println("Grade C")\n    }\n}`
    },
    {
        id: 'loops',
        name: 'Loops (While & For)',
        description: 'While loops and range-based for loops',
        code: `fun runLoops() {\n    var i = 0\n    while (i < 5) {\n        println(i)\n        i = i + 1\n    }\n\n    for (item in 1..10) {\n        println(item)\n    }\n}`
    },
    {
        id: 'class_decl',
        name: 'Class & Member Declarations',
        description: 'Class declarations with properties and methods',
        code: `class Circle {\n    val radius: Double = 5.0\n    fun getArea(): Double {\n        return 3.14 * radius * radius\n    }\n}`
    },
    {
        id: 'invalid_syntax',
        name: 'Invalid Syntax (Error Demo)',
        description: 'Demonstrates lexical and syntax diagnostic detection in editor',
        code: `fun broken() {\n    val x = \n    if (x > 5 {\n        return 10\n    }\n}`
    }
];

router.get('/', (req, res) => {
    res.json(EXAMPLES);
});

module.exports = router;
