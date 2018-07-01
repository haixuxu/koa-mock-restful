koa-mock-restful
---

koa-mock-restful is a koa  middleware that creates mocks for REST APIs. It will be helpful when you try to test your application without the actual REST API server.

**Features:**  

🔥 Built in support for hot Mocker file replacement.  
🚀 Quickly and easily configure the API via JSON.  

## Installation

```bash
npm install koa-mock-restful --save-dev
```

## Usage

koa-mock-restful dev support mock, configured in `mocker.js`.

```js
const mockMap = {
  'GET /api/user': {
      username: 'admin',
      sex: 5,
    },
    'GET /repos/hello': (ctx, next) => {
      ctx.body = {
        text: 'this is from mock server',
      };
    },
    'GET /api/userinfo/:id': (ctx, next) => {
      ctx.body = {
        id: ctx.params.id,
        username: 'kenny',
      };
    },
    'GET /api/user/list/:id/:type': (ctx, next) => {
      ctx.body = {
        id: ctx.params.id,
        type: ctx.params.type,
      };
    },
  
    'POST /api/login/account': (ctx, next) => {
      const {password, username} = ctx.request.body;
      if (password === '888888' && username === 'admin') {
        ctx.body =  {
          status: 'ok',
          code: 0,
          token: 'sdfsdfsdfdsf',
          data: {
            id: 1,
            username: 'kenny',
            sex: 6,
          },
        };
      } else {
        ctx.body = {
          status: 'error',
          code: 403,
        };
      }
    },
    'DELETE /api/user/:id': (ctx, next) => {
      ctx.body = {status: 'ok', message: '删除成功！', id: ctx.params.id};
    },
}
module.exports = mockMap;
```

## apiMocker

```js
apiMocker({entry:'./mocker.js',debug:true})
```

## Using with [koa](https://github.com/koajs/koa)

```diff
const path = require('path');
const koa = require('koa');
+ const apiMocker = require('koa-mock-restful');

const app = koa();

+ app.use(apiMocker({entry:'./mocker/index.js',debug:true});
app.listen(8080);
```