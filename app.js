const express = require('express');
const app = express();

require('dotenv').config({path: `${process.cwd()}/config/${process.env.NODE_ENV}.env`}); //{path: `${process.cwd()}/config/${process.env.NODE_ENV}`});

const routes = require('./lib/controllers/word-counter-controller');

app.use(routes);

app.listen(3000);