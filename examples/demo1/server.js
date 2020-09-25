const Koa = require('koa');

const app = new Koa();
const mockMiddleware = require('../../lib');

app.use(mockMiddleware(require('./entry')));

app.listen(3000);

console.log('server listen on http://127.0.0.1:3000/');
