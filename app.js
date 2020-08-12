const express = require('express');
const app = express();

const routes = require('./lib/controllers/word-counter-controller');

app.use(routes);

app.listen(3000);