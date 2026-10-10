const express = require('express');
const cors = require('cors');

const healthRoute = require('./routes/health');
const examplesRoute = require('./routes/examples');
const parseRoute = require('./routes/parse');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoute);
app.use('/api/examples', examplesRoute);
app.use('/api/parse', parseRoute);

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;
