const path = require('path');
const parse = require('url').parse;
let debug = require('debug')('koa:mock');
const utils = require('./utils');

let cwd = process.cwd();
let mockRouteMap = {};

let debugFn = function (type, msg) {
  debug(type + msg);
};

// 用于刷新mock设置
createMiddleware.refresh = function (mockObj) {
  mockRouteMap = {};
  createRoute(mockObj);
};

module.exports = createMiddleware;

function createMiddleware(mockObj, logfn) {
  if (mockObj.entry) {
    let entry = mockObj.entry;
    if (path.isAbsolute(entry)) {
      mockObj = require(entry);
    } else {
      mockObj = require(path.resolve(cwd, entry));
    }
  }

  if (logfn && typeof logfn === 'function') {
    debugFn = logfn;
  }

  createRoute(mockObj);

  return async function (ctx, next) {
    let route = matchRoute(ctx.req);
    if (route) {
      //match url
      debugFn('matched', `${route.method.toUpperCase()} ${route.path}`);
      const matchFn = utils.pathMatch({ sensitive: false, strict: false, end: false });
      const match = matchFn(route.path);
      ctx.params = match(parse(ctx.req.url).pathname);
      route.handler(ctx, next);
    } else {
      await next();
    }
  };
}

function createRoute(mockModule) {
  Object.keys(mockModule).forEach((key) => {
    let result = utils.parseKey(key);
    let method = result.method;
    let handler = mockModule[key];
    let regexp = new RegExp('^' + result.path.replace(/(:\w*)[^/]/gi, '(.*)') + '$');
    let route = { path: result.path, method, regexp };
    if (typeof handler === 'function') {
      route.handler = handler;
    } else {
      route.handler = (ctx, next) => {
        ctx.body = handler;
      };
    }
    if (!mockRouteMap[method]) {
      mockRouteMap[method] = [];
    }
    debugFn('createRoute', ': path:' + route.path + '  method:' + route.method);
    mockRouteMap[method].push(route);
  });
}

function matchRoute(req) {
  let url = req.url;
  let method = req.method.toLowerCase();
  let uri = url.replace(/\?.*$/, '');
  debugFn('matchRoute', ':(path:' + url + '  method:' + method + ')');
  let routerList = mockRouteMap[method];
  return routerList && routerList.find((item) => item.path === uri || item.regexp.test(uri));
}
