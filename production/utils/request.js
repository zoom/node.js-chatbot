"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeFetch = require("node-fetch");

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _debug = require("./debug");

var _debug2 = _interopRequireDefault(_debug);

var _log = require("../services/log");

var _log2 = _interopRequireDefault(_log);

var _abortController = require("abort-controller");

var _abortController2 = _interopRequireDefault(_abortController);

var _formData = require("form-data");

var _formData2 = _interopRequireDefault(_formData);

var _url = require("url");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import querystring from 'querystring';
let errorHandle = (logDataOption, errorInfo, reject) => {
  _log2.default.run({
    type: 'http',
    message: {
      request: logDataOption,
      response: null,
      error: errorInfo
    }
  });

  _log2.default.run({
    type: 'error_notice',
    message: {
      error: errorInfo
    }
  });

  reject(Object.assign({}, errorInfo));
};

let requestWrap = opt => {
  let {
    body,
    bodyType,
    method = 'get',
    url,
    headers = {},
    query = {},
    timeout
  } = opt;
  return new Promise((resolve, reject) => {
    let newBody = body;

    if (bodyType === 'formParameters') {
      newBody = new _url.URLSearchParams();
      Object.keys(body).forEach(key => {
        newBody.append(key, body[key]);
      });
    } else if (bodyType === 'formData') {
      newBody = new _formData2.default();
      Object.keys(body).forEach(key => {
        newBody.append(key, body[key]);
      });
    } else if (typeof body === 'object') {
      newBody = JSON.stringify(body);
    }

    let dataOption = {
      method,
      headers,
      body: newBody
    };
    let timeoutResult = null;

    if (typeof timeout === 'number') {
      const controller = new _abortController2.default();
      timeoutResult = setTimeout(() => {
        controller.abort();
      }, timeout);
    }

    if (typeof query === 'object') {
      let urlObject = new URL(url);
      Object.keys(query).forEach(name => {
        urlObject.searchParams.set(name, query[name]);
      });
      url = urlObject.href;
    }

    let logDataOption = Object.assign({
      url
    }, dataOption);
    (0, _debug2.default)('http')(logDataOption);
    let nodefeatchResult = (0, _nodeFetch2.default)(url, dataOption).then(res => {
      let status = res.status;
      let headers = res.headers;
      res.text().then(responseBody => {
        let responseText = responseBody;

        if (typeof responseBody === 'string') {
          try {
            responseBody = JSON.parse(responseBody);
          } catch (e) {
            responseBody = responseText; //can't parse
          } // catch(e){
          //   errorHandle(logDataOption,{
          //     type:'parseError',
          //     status,
          //     message:responseText
          //   },reject);
          //   return;
          // }

        }

        if (status >= 200 && status < 300) {
          //success 
          _log2.default.run({
            type: 'http',
            message: {
              request: logDataOption,
              response: {
                status,
                body: responseBody
              },
              error: null
            }
          });

          resolve({
            status,
            body: responseBody,
            headers
          });
        } else {
          //success but status fail
          errorHandle(logDataOption, {
            status: status,
            message: responseBody
          }, reject);
          return;
        }
      }).catch(e => {
        //promise all error
        errorHandle(logDataOption, {
          // type:'parseError',
          status,
          message: e
        }, reject);
        return;
      });
    }).catch(e => {
      //request error
      errorHandle(logDataOption, e, reject);
    });

    if (timeoutResult !== null) {
      nodefeatchResult.finally(() => {
        clearTimeout(timeoutResult);
      });
    }
  });
};

exports.default = requestWrap;
module.exports = exports.default;