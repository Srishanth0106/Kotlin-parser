const express = require('express');
const router = express.Router();
const { parseKotlinCode } = require('../services/parserService');

router.post('/', async (req, res) => {
    try {
        const { code } = req.body;
        if (code === undefined || code === null) {
            return res.status(400).json({ error: "Missing 'code' string in request body." });
        }

        const result = await parseKotlinCode(code);
        res.json(result);
    } catch (err) {
        console.error('Parse endpoint error:', err);
        res.status(500).json({
            success: false,
            statistics: { tokenCount: 0, astNodeCount: 0, parseTimeMs: 0 },
            diagnostics: [{
                severity: 'ERROR',
                message: err.message || 'Internal parser server error',
                line: 1,
                column: 1
            }],
            tokens: [],
            ast: null
        });
    }
});

module.exports = router;
