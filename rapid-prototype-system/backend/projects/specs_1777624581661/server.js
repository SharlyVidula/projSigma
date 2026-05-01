const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3005;
app.use(cors());
app.use(express.static('public'));
app.get('/api/calculator', (req, res) => {
    res.json({
        "result": "Calculator API"
    });
});
app.get('/api/history', (req, res) => {
    res.json({
        "result": "History API"
    });
});
app.get('/api/favorites', (req, res) => {
    res.json({
        "result": "Favorites API"
    });
});
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});