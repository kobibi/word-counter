const express = require('express');
const app = express();

require('dotenv').config({path: `${process.cwd()}/config/${process.env.NODE_ENV}.env`}); //{path: `${process.cwd()}/config/${process.env.NODE_ENV}`});

console.log(`${process.cwd()}/config/${process.env.NODE_ENV}.env`);
console.log(process.env.DB_CONNECTION_LIMIT);
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_WC_PASSWORD);
console.log(process.env.DB_WC_USER);

const routes = require('./lib/controllers/word-counter-controller');

app.use(routes);

app.listen(3000);