const express = require('express');
const router = express.Router();
const { parseKotlinCode } = require('../services/parserService');

router.get('/', async (req, res) => {
    try {
        const testResult = await parseKotlinCode('val x = 1');
        res.json({
            status: 'ok',
            parserAvailable: testResult && typeof testResult.success === 'boolean',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'degraded',
            parserAvailable: false,
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
