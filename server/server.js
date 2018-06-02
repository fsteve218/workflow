global.d = console.log;
const express = require('express');
const port = process.env.PORT || 5000;

// Setupe Server
const app = express();

// Setup Routes
app.get( '', (req,res) => {
    res.send('Hello World');
});

// Listen on port
app.listen(port, () => d(`API server running on port ${port}`) );